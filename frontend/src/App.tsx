import { useEffect, useState } from 'react';
import './App.css';

interface Place {
  id: number;
  name: string;
  location: string;
  station: string;
  googleMapsUrl: string;
  walkingTime?: string;
}

interface RegistrationForm {
  type: 'cafes' | 'bookstores';
  name: string;
  googleMapsUrl: string;
  station: string;
  walkingTime: string;
}

// API URLを環境変数から取得（開発時はlocalhost、本番時はRenderのURL）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [selectedStation, setSelectedStation] = useState('')
  const [activeTab, setActiveTab] = useState<'cafes' | 'bookstores'>('cafes')
  const [cafes, setCafes] = useState<Place[]>([])
  const [bookstores, setBookstores] = useState<Place[]>([])
  const [stations, setStations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    type: 'cafes',
    name: '',
    googleMapsUrl: '',
    station: '',
    walkingTime: ''
  })

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stations`);
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        setStations([
          '渋谷駅', '新宿駅', '池袋駅', '東京駅', '品川駅',
          '上野駅', '秋葉原駅', '原宿駅', '代官山駅', '恵比寿駅'
        ]);
      }
    };
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const [cafesResponse, bookstoresResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/cafes?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bookstores?station=${encodeURIComponent(selectedStation)}`)
          ]);

          const cafesData = await cafesResponse.json();
          const bookstoresData = await bookstoresResponse.json();

          setCafes(cafesData);
          setBookstores(bookstoresData);
        } catch (error) {
          console.error('Failed to fetch places:', error);
          setCafes([]);
          setBookstores([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setCafes([]);
      setBookstores([]);
    }
  }, [selectedStation]);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = registrationForm.type === 'cafes' ? '/api/cafes' : '/api/bookstores';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registrationForm.name,
          googleMapsUrl: registrationForm.googleMapsUrl,
          station: registrationForm.station,
          walkingTime: registrationForm.walkingTime
        }),
      });

      if (response.ok) {
        // 登録成功後、データを再取得
        if (selectedStation) {
          const [cafesResponse, bookstoresResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/cafes?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bookstores?station=${encodeURIComponent(selectedStation)}`)
          ]);

          const cafesData = await cafesResponse.json();
          const bookstoresData = await bookstoresResponse.json();

          setCafes(cafesData);
          setBookstores(bookstoresData);
        }

        // フォームをリセット
        setRegistrationForm({
          type: 'cafes',
          name: '',
          googleMapsUrl: '',
          station: '',
          walkingTime: ''
        });
        setShowRegistrationForm(false);
        alert('登録しました！');
      } else {
        const error = await response.json();
        alert(`登録に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to register place:', error);
      alert('登録に失敗しました');
    }
  };

  const formatWalkingTime = (walkingTime: string): string => {
    return walkingTime ? `${walkingTime}分` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">いちだん読書場所</h1>
              <p className="text-sm text-gray-600">駅周辺の読書に適した場所を探そう</p>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              管理画面
            </a>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 説明 */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">駅を選択してください</h2>
            <p className="text-gray-600">最寄りの駅を選ぶと、その周辺の喫茶店と本屋が表示されます</p>
          </div>

          {/* 駅選択 */}
          <div className="flex justify-center mb-8">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="block w-64 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">駅を選択してください</option>
              {stations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          {/* タブ */}
          {selectedStation && (
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('cafes')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'cafes'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  喫茶店 ({cafes.length})
                </button>
                <button
                  onClick={() => setActiveTab('bookstores')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'bookstores'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  本屋 ({bookstores.length})
                </button>
              </div>
            </div>
          )}

          {/* 場所一覧 */}
          {selectedStation && (
            <div className="mb-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTab === 'cafes' ? (
                    cafes.map((cafe) => (
                      <div key={cafe.id} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cafe.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{cafe.location}</p>
                        <p className="text-sm text-gray-600 mb-2">{cafe.station}</p>
                        {cafe.walkingTime && (
                          <p className="text-sm text-gray-600 mb-4">
                            🚶‍♂️ {formatWalkingTime(cafe.walkingTime)}
                          </p>
                        )}
                        <a
                          href={cafe.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Google Mapsで見る
                        </a>
                      </div>
                    ))
                  ) : (
                    bookstores.map((bookstore) => (
                      <div key={bookstore.id} className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{bookstore.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{bookstore.location}</p>
                        <p className="text-sm text-gray-600 mb-2">{bookstore.station}</p>
                        {bookstore.walkingTime && (
                          <p className="text-sm text-gray-600 mb-4">
                            🚶‍♂️ {formatWalkingTime(bookstore.walkingTime)}
                          </p>
                        )}
                        <a
                          href={bookstore.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Google Mapsで見る
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {!loading && (
                activeTab === 'cafes' ? (
                  cafes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">この駅周辺に登録された喫茶店がありません</p>
                    </div>
                  )
                ) : (
                  bookstores.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">この駅周辺に登録された本屋がありません</p>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {/* 新しい場所を登録 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">新しい場所を登録</h3>
              <button
                onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {showRegistrationForm ? '閉じる' : '登録フォームを開く'}
              </button>
            </div>

            {showRegistrationForm && (
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      種類
                    </label>
                    <select
                      value={registrationForm.type}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, type: e.target.value as 'cafes' | 'bookstores' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="cafes">喫茶店</option>
                      <option value="bookstores">本屋</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      店舗名
                    </label>
                    <input
                      type="text"
                      value={registrationForm.name}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Google Maps URL
                    </label>
                    <input
                      type="url"
                      value={registrationForm.googleMapsUrl}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, googleMapsUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最寄駅
                    </label>
                    <select
                      value={registrationForm.station}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, station: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">駅を選択してください</option>
                      {stations.map((station) => (
                        <option key={station} value={station}>
                          {station}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      徒歩時間（分）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={registrationForm.walkingTime}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, walkingTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    登録
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            © 2024 いちだん読書場所. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
