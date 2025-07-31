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
    <div className="w-full min-h-screen bg-primary-50 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="w-full bg-white shadow-sm border-b border-primary-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-900 border-b-2 border-primary-200 pb-2">
              ichidan-dokusho-place
            </h1>
            <p className="text-primary-600 mt-3 text-sm sm:text-base">
              読書に集中できる場所を見つけよう
            </p>
            <p className="text-xs text-primary-500 mt-1">一段読書と連携</p>
            <div className="mt-4">
              <a
                href="/admin"
                className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                管理画面
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="w-full max-w-md px-6 py-6 flex-1">
        {/* 説明セクション */}
        <section className="mb-6">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
              読書の空間設計を支援
            </h2>
            <p className="text-primary-700 mb-4 text-sm leading-relaxed">
              インプットの質と習慣性を高めるため、「どこで読むか」「どこで本を買うか」まで含めて、
              読書の空間設計を支援します。
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 p-3 rounded-lg">
                <h3 className="font-medium text-primary-900 mb-1 text-sm">📚 本屋</h3>
                <p className="text-xs text-primary-700">
                  幅広い書籍を取り揃える書店
                </p>
              </div>
              <div className="bg-primary-50 p-3 rounded-lg">
                <h3 className="font-medium text-primary-900 mb-1 text-sm">☕ 喫茶店</h3>
                <p className="text-xs text-primary-700">
                  読書に集中できる静かな空間
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 駅選択 */}
        <section className="mb-6">
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
              最寄駅を選択
            </h2>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            >
              <option value="">駅を選択してください</option>
              {stations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* タブ切り替え */}
        {selectedStation && (
          <section className="mb-6">
            <div className="card">
              <div className="flex border-b border-primary-200 mb-4">
                <button
                  onClick={() => setActiveTab('cafes')}
                  className={`flex-1 px-4 py-3 font-medium transition-colors duration-200 text-sm ${
                    activeTab === 'cafes'
                      ? 'text-primary-700 border-b-2 border-primary-600'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  ☕ 喫茶店
                </button>
                <button
                  onClick={() => setActiveTab('bookstores')}
                  className={`flex-1 px-4 py-3 font-medium transition-colors duration-200 text-sm ${
                    activeTab === 'bookstores'
                      ? 'text-primary-700 border-b-2 border-primary-600'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  📚 本屋
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-primary-600 text-sm">読み込み中...</span>
                </div>
              ) : (
                <>
                  {/* 喫茶店一覧 */}
                  {activeTab === 'cafes' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
                        {selectedStation}周辺の喫茶店
                      </h3>
                      {cafes.length > 0 ? (
                        <div className="space-y-3">
                          {cafes.map((cafe) => (
                            <div key={cafe.id} className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-primary-900 text-sm sm:text-base">{cafe.name}</h4>
                                <div className="text-right">
                                  <span className="text-xs text-primary-500 block">{cafe.station}</span>
                                  {cafe.walkingTime && (
                                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                      🚶‍♂️ {formatWalkingTime(cafe.walkingTime)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={cafe.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                              >
                                📍 Google Mapsで見る →
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-primary-500">
                          <p className="text-sm">この駅周辺の喫茶店はまだ登録されていません。</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 本屋一覧 */}
                  {activeTab === 'bookstores' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
                        {selectedStation}周辺の本屋
                      </h3>
                      {bookstores.length > 0 ? (
                        <div className="space-y-3">
                          {bookstores.map((bookstore) => (
                            <div key={bookstore.id} className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-primary-900 text-sm sm:text-base">{bookstore.name}</h4>
                                <div className="text-right">
                                  <span className="text-xs text-primary-500 block">{bookstore.station}</span>
                                  {bookstore.walkingTime && (
                                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                      🚶‍♂️ {formatWalkingTime(bookstore.walkingTime)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={bookstore.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
                              >
                                📍 Google Mapsで見る →
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-primary-500">
                          <p className="text-sm">この駅周辺の本屋はまだ登録されていません。</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* 場所登録フォーム */}
        <section className="mb-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-primary-900 border-b border-primary-200 pb-2">
                📝 新しい場所を登録
              </h2>
              <button
                onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                className="btn-primary text-sm px-3 py-2"
              >
                {showRegistrationForm ? '閉じる' : '登録する'}
              </button>
            </div>

            {showRegistrationForm && (
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    種類
                  </label>
                  <select
                    value={registrationForm.type}
                    onChange={(e) => setRegistrationForm({...registrationForm, type: e.target.value as 'cafes' | 'bookstores'})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="cafes">☕ 喫茶店</option>
                    <option value="bookstores">📚 本屋</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    店舗名
                  </label>
                  <input
                    type="text"
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({...registrationForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="例: 喫茶 木漏れ日"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={registrationForm.googleMapsUrl}
                    onChange={(e) => setRegistrationForm({...registrationForm, googleMapsUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="https://maps.google.com/?q=..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    最寄駅
                  </label>
                  <select
                    value={registrationForm.station}
                    onChange={(e) => setRegistrationForm({...registrationForm, station: e.target.value})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    required
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
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    駅からの徒歩時間（分）
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={registrationForm.walkingTime}
                    onChange={(e) => setRegistrationForm({...registrationForm, walkingTime: e.target.value})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="例: 5"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3"
                >
                  登録する
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 読書ルート提案 */}
        {selectedStation && (
          <section className="mb-6">
            <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
              <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
                🚶‍♂️ 読書ルート提案
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-primary-700">
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                  <span>一段読書で書きたいテーマを確認する</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                  <span>「近くの本屋」で気になる書籍を購入</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                  <span>「近くの喫茶店」で落ち着いた場所で読書</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                  <span>一段読書に記録、インプットが蓄積</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">5</span>
                  <span>草稿が生成され、noteやXに発信</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* フッター */}
      <footer className="w-full bg-white border-t border-primary-200 mt-8">
        <div className="max-w-md mx-auto px-6 py-4">
          <p className="text-center text-primary-600 text-xs">
            © 2024 ichidan-dokusho-place. 読書の空間設計を支援するプロトタイプ機能です。
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
