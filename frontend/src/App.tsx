import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminStations from './AdminStations';
import AdminCafes from './AdminCafes';
import AdminBooks from './AdminBooks';
import AdminBars from './AdminBars';

interface Place {
  id: number;
  name: string;
  location: string;
  station: string;
  googleMapsUrl: string;
  walkingTime?: string;
}

interface RegistrationForm {
  type: 'cafes' | 'bookstores' | 'bars';
  name: string;
  googleMapsUrl: string;
  station: string;
  walkingTime: string;
}

interface StationForm {
  name: string;
  location: string;
}

// API URLを環境変数から取得（開発時はlocalhost、本番時はRenderのURL）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function HomePage() {
  const [selectedStation, setSelectedStation] = useState('')
  const [activeTab, setActiveTab] = useState<'cafes' | 'bookstores' | 'bars'>('cafes')
  const [cafes, setCafes] = useState<Place[]>([])
  const [bookstores, setBookstores] = useState<Place[]>([])
  const [bars, setBars] = useState<Place[]>([])
  const [stations, setStations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showStationForm, setShowStationForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    type: 'cafes',
    name: '',
    googleMapsUrl: '',
    station: '',
    walkingTime: ''
  })
  const [stationForm, setStationForm] = useState<StationForm>({
    name: '',
    location: ''
  })
  // エラー関連のstate
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [apiErrors, setApiErrors] = useState<{[key: string]: any}>({})
  
  // エラーをクリアする関数
  const clearError = () => {
    setError(null)
    setApiErrors({})
  }

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stations`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setStations(data);
        clearError(); // 成功時はエラーをクリア
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        const errorMessage = `駅データの取得に失敗: ${error instanceof Error ? error.message : String(error)}`;
        setError(errorMessage);
        setApiErrors(prev => ({...prev, stations: error}));
        // フォールバック: ハードコードされた駅リスト
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
          const [cafesResponse, bookstoresResponse, barsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/cafes?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bookstores?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bars?station=${encodeURIComponent(selectedStation)}`)
          ]);

          // レスポンスステータスをチェック
          if (!cafesResponse.ok) {
            throw new Error(`喫茶店データ取得失敗: HTTP ${cafesResponse.status}`);
          }
          if (!bookstoresResponse.ok) {
            throw new Error(`本屋データ取得失敗: HTTP ${bookstoresResponse.status}`);
          }
          if (!barsResponse.ok) {
            throw new Error(`バーデータ取得失敗: HTTP ${barsResponse.status}`);
          }

          const cafesData = await cafesResponse.json();
          const bookstoresData = await bookstoresResponse.json();
          const barsData = await barsResponse.json();

          setCafes(cafesData);
          setBookstores(bookstoresData);
          setBars(barsData);
          clearError(); // 成功時はエラーをクリア
        } catch (error) {
          console.error('Failed to fetch places:', error);
          const errorMessage = `${selectedStation}のデータ取得に失敗: ${error instanceof Error ? error.message : String(error)}`;
          setError(errorMessage);
          setApiErrors(prev => ({...prev, places: error}));
          setCafes([]);
          setBookstores([]);
          setBars([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setCafes([]);
      setBookstores([]);
      setBars([]);
    }
  }, [selectedStation]);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = registrationForm.type === 'cafes' ? '/api/cafes' : registrationForm.type === 'bookstores' ? '/api/bookstores' : '/api/bars';
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
          const [cafesResponse, bookstoresResponse, barsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/cafes?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bookstores?station=${encodeURIComponent(selectedStation)}`),
            fetch(`${API_BASE_URL}/api/bars?station=${encodeURIComponent(selectedStation)}`)
          ]);

          const cafesData = await cafesResponse.json();
          const bookstoresData = await bookstoresResponse.json();
          const barsData = await barsResponse.json();

          setCafes(cafesData);
          setBookstores(bookstoresData);
          setBars(barsData);
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
        clearError(); // 成功時はエラーをクリア
        alert('場所を登録しました！');
      } else {
        const errorData = await response.json();
        const errorMessage = `場所の登録に失敗: ${errorData.error || 'サーバーエラー'}`;
        setError(errorMessage);
        setApiErrors(prev => ({...prev, registration: errorData}));
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Failed to register place:', error);
      const errorMessage = `場所の登録に失敗: ${error instanceof Error ? error.message : String(error)}`;
      setError(errorMessage);
      setApiErrors(prev => ({...prev, registration: error}));
      alert(errorMessage);
    }
  };

  // 駅登録処理
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚉 Submitting station form:', stationForm);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/stations`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationForm),
      });

      if (response.ok) {
        // 駅登録成功後、駅一覧を再取得
        const stationsResponse = await fetch(`${API_BASE_URL}/api/stations`);
        const stationsData = await stationsResponse.json();
        setStations(stationsData);

        // フォームをリセット
        setStationForm({
          name: '',
          location: ''
        });
        setShowStationForm(false);
        clearError(); // 成功時はエラーをクリア
        alert('駅を登録しました！');
      } else {
        const errorData = await response.json();
        console.error('❌ Station registration failed:', response.status, errorData);
        const errorMessage = `駅の登録に失敗 (${response.status}): ${errorData.error || 'サーバーエラー'}`;
        const debugInfo = `送信データ: ${JSON.stringify(stationForm)}`;
        setError(`${errorMessage}\n${debugInfo}`);
        setApiErrors(prev => ({...prev, stationRegistration: {...errorData, requestData: stationForm, status: response.status}}));
        alert(errorMessage);
      }
    } catch (error) {
      console.error('❌ Network error during station registration:', error);
      const errorMessage = `駅の登録に失敗 (ネットワークエラー): ${error instanceof Error ? error.message : String(error)}`;
      const debugInfo = `送信データ: ${JSON.stringify(stationForm)}, API: ${API_BASE_URL}`;
      setError(`${errorMessage}\n${debugInfo}`);
      setApiErrors(prev => ({...prev, stationRegistration: {error, requestData: stationForm, apiUrl: API_BASE_URL}}));
      alert(errorMessage);
    }
  };

  // 徒歩時間を表示用にフォーマットする関数
  const formatWalkingTime = (walkingTime: string): string => {
    if (!walkingTime) return '';
    // 数字のみの場合は「分」を付ける
    if (/^\d+$/.test(walkingTime)) {
      return `${walkingTime}分`;
    }
    // 既に「分」が付いている場合はそのまま返す
    return walkingTime;
  };

  return (
    <div className="w-full min-h-screen bg-primary-50 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="w-full bg-white shadow-sm border-b border-primary-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 sm:py-6">
          <div className="text-center">
            <div className="flex justify-between items-center mb-2">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-primary-900 border-b-2 border-primary-200 pb-2">
                  ichidan-dokusho-place
                </h1>
              </div>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded"
              >
                🐛
              </button>
            </div>
            <p className="text-primary-600 mt-3 text-sm sm:text-base">
              読書に集中できる場所を見つけよう
            </p>
            <p className="text-xs text-primary-500 mt-1">一段読書と連携</p>
          </div>
        </div>
      </header>

      {/* エラー表示 */}
      {error && (
        <div className="w-full max-w-md px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-red-800 font-medium text-sm">⚠️ エラー</h3>
                <p className="text-red-600 text-xs mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  API: {API_BASE_URL}
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* デバッグ情報 */}
      {debugMode && (
        <div className="w-full max-w-md px-6 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-gray-800 font-medium mb-2 text-sm">🐛 DEBUG</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div>API: {API_BASE_URL}</div>
              <div>駅: {selectedStation || '未選択'}</div>
              <div>駅数: {stations.length}</div>
              <div>カフェ: {cafes.length}</div>
              <div>本屋: {bookstores.length}</div>
              <div>バー: {bars.length}</div>
              <div>読込中: {loading ? 'Yes' : 'No'}</div>
              {Object.keys(apiErrors).length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">エラー詳細</summary>
                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(apiErrors, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div className="bg-primary-50 p-3 rounded-lg">
                <h3 className="font-medium text-primary-900 mb-1 text-sm">🍺 バー</h3>
                <p className="text-xs text-primary-700">
                  リラックスしながら読書できる空間
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
                <button
                  onClick={() => setActiveTab('bars')}
                  className={`flex-1 px-4 py-3 font-medium transition-colors duration-200 text-sm ${
                    activeTab === 'bars'
                      ? 'text-primary-700 border-b-2 border-primary-600'
                      : 'text-primary-500 hover:text-primary-700'
                  }`}
                >
                  🍺 バー
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

                  {/* バー一覧 */}
                  {activeTab === 'bars' && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
                        {selectedStation}周辺のバー
                      </h3>
                      {bars.length > 0 ? (
                        <div className="space-y-3">
                          {bars.map((bar) => (
                            <div key={bar.id} className="border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-primary-900 text-sm sm:text-base">{bar.name}</h4>
                                <div className="text-right">
                                  <span className="text-xs text-primary-500 block">{bar.station}</span>
                                  {bar.walkingTime && (
                                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                      🚶‍♂️ {formatWalkingTime(bar.walkingTime)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <a
                                href={bar.googleMapsUrl}
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
                          <p className="text-sm">この駅周辺のバーはまだ登録されていません。</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* 登録セクション */}
        <section className="mb-6">
          <div className="card">
            <h2 className="text-base sm:text-lg font-semibold text-primary-900 border-b border-primary-200 pb-2 mb-4">
              📝 新しい場所を登録
            </h2>
            
            {/* ボタンセクション */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <button
                onClick={() => setShowStationForm(!showStationForm)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showStationForm
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                🚉 駅
              </button>
              <button
                onClick={() => setShowRegistrationForm(!showRegistrationForm)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showRegistrationForm
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                📍 場所
              </button>
            </div>

            {/* 駅登録フォーム */}
            {showStationForm && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <form onSubmit={handleStationSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        駅名
                      </label>
                      <input
                        type="text"
                        value={stationForm.name}
                        onChange={(e) => setStationForm({...stationForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="例: 新宿駅"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">
                        地域
                      </label>
                      <input
                        type="text"
                        value={stationForm.location}
                        onChange={(e) => setStationForm({...stationForm, location: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="例: 新宿区"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    登録
                  </button>
                </form>
              </div>
            )}
            
            {showRegistrationForm && (
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    種類
                  </label>
                  <select
                    value={registrationForm.type}
                    onChange={(e) => setRegistrationForm({...registrationForm, type: e.target.value as 'cafes' | 'bookstores' | 'bars'})}
                    className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="cafes">☕ 喫茶店</option>
                    <option value="bookstores">📚 本屋</option>
                    <option value="bars">🍺 バー</option>
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
                  登録
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 読書の空間設計を支援 */}
        {selectedStation && (
          <section className="mb-6">
            <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
              <h2 className="text-base sm:text-lg font-semibold text-primary-900 mb-3 border-b border-primary-200 pb-2">
                📚 読書の空間設計を支援
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
                  <span>「近くのバー」でリラックスしながら読書</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">5</span>
                  <span>一段読書に記録、インプットが蓄積</span>
                </div>
                <div className="flex items-start">
                  <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">6</span>
                  <span>草稿が生成され、noteやXに発信</span>
                </div>
              </div>
              
              {/* 場所の特徴説明 */}
              <div className="mt-4 pt-4 border-t border-primary-200">
                <h3 className="text-sm font-medium text-primary-800 mb-2">各場所の特徴</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white rounded-lg p-3 border border-primary-200">
                    <div className="font-medium text-primary-700 mb-1">📚 本屋</div>
                    <div className="text-primary-600">書籍購入、新刊発見、読書環境の確認</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-primary-200">
                    <div className="font-medium text-primary-700 mb-1">☕ 喫茶店</div>
                    <div className="text-primary-600">集中読書、静寂な環境、長時間滞在</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-primary-200">
                    <div className="font-medium text-primary-700 mb-1">🍺 バー</div>
                    <div className="text-primary-600">リラックス読書、夜間利用、社交的読書</div>
                  </div>
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
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="stations" element={<AdminStations />} />
        <Route path="shop/cafes" element={<AdminCafes />} />
        <Route path="shop/books" element={<AdminBooks />} />
        <Route path="shop/bars" element={<AdminBars />} />
      </Route>
    </Routes>
  );
}

export default App
