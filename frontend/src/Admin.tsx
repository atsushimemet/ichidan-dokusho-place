import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Place {
  id: number;
  name: string;
  location: string;
  station: string;
  googleMapsUrl: string;
  walkingTime?: string;
}

interface EditForm {
  id: number;
  name: string;
  googleMapsUrl: string;
  station: string;
  walkingTime: string;
}

interface Station {
  id: number;
  name: string;
  location: string;
}

interface StationForm {
  name: string;
  location: string;
}

// API URLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = '19930322';

function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState<'cafes' | 'bookstores' | 'stations'>('cafes');
  const [cafes, setCafes] = useState<Place[]>([]);
  const [bookstores, setBookstores] = useState<Place[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<EditForm | null>(null);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [showStationForm, setShowStationForm] = useState(false);
  const [stationForm, setStationForm] = useState<StationForm>({
    name: '',
    location: ''
  });

  // ログイン処理
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('パスワードが正しくありません');
    }
  };

  // データ取得
  const fetchData = async () => {
    setLoading(true);
    try {
      const [cafesResponse, bookstoresResponse, stationsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/cafes/all`),
        fetch(`${API_BASE_URL}/api/bookstores/all`),
        fetch(`${API_BASE_URL}/api/stations/all`)
      ]);

      const cafesData = await cafesResponse.json();
      const bookstoresData = await bookstoresResponse.json();
      const stationsData = await stationsResponse.json();

      setCafes(cafesData);
      setBookstores(bookstoresData);
      setStations(stationsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // 削除処理
  const handleDelete = async (id: number, type: 'cafes' | 'bookstores') => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/${type}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 削除後にデータを再取得
        fetchData();
        alert('削除しました');
      } else {
        const error = await response.json();
        alert(`削除に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除に失敗しました');
    }
  };

  // 編集開始
  const handleEdit = (item: Place) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      googleMapsUrl: item.googleMapsUrl,
      station: item.station,
      walkingTime: item.walkingTime || ''
    });
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // 編集保存
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/${activeTab}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingItem.name,
          googleMapsUrl: editingItem.googleMapsUrl,
          station: editingItem.station,
          walkingTime: editingItem.walkingTime
        }),
      });

      if (response.ok) {
        // 保存後にデータを再取得
        fetchData();
        setEditingItem(null);
        alert('更新しました');
      } else {
        const error = await response.json();
        alert(`更新に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('更新に失敗しました');
    }
  };

  // 駅登録処理
  const handleStationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationForm),
      });

      if (response.ok) {
        fetchData();
        setStationForm({ name: '', location: '' });
        setShowStationForm(false);
        alert('駅を登録しました！');
      } else {
        const error = await response.json();
        alert(`登録に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to register station:', error);
      alert('登録に失敗しました');
    }
  };

  // 駅編集開始
  const handleEditStation = (station: Station) => {
    setEditingStation(station);
  };

  // 駅編集キャンセル
  const handleCancelEditStation = () => {
    setEditingStation(null);
  };

  // 駅編集保存
  const handleSaveEditStation = async () => {
    if (!editingStation) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${editingStation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingStation.name,
          location: editingStation.location
        }),
      });

      if (response.ok) {
        fetchData();
        setEditingStation(null);
        alert('更新しました');
      } else {
        const error = await response.json();
        alert(`更新に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Update station error:', error);
      alert('更新に失敗しました');
    }
  };

  // 駅削除処理
  const handleDeleteStation = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('削除しました');
      } else {
        const error = await response.json();
        alert(`削除に失敗しました: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete station error:', error);
      alert('削除に失敗しました');
    }
  };

  // 徒歩時間のフォーマット
  const formatWalkingTime = (walkingTime: string): string => {
    return walkingTime ? `${walkingTime}分` : '';
  };

  const currentData = activeTab === 'cafes' ? cafes : activeTab === 'bookstores' ? bookstores : stations;

  // ログイン画面
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-primary-50 flex flex-col items-center">
        {/* ヘッダー */}
        <header className="w-full bg-white shadow-sm border-b border-primary-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-6 py-4 sm:py-6">
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="text-xl sm:text-2xl font-bold text-primary-900 border-b-2 border-primary-200 pb-2 hover:text-primary-600 transition-colors"
              >
                ichidan-dokusho-place
              </button>
              <p className="text-primary-600 mt-3 text-sm sm:text-base">
                読書に集中できる場所を見つけよう
              </p>
              <p className="text-xs text-primary-500 mt-1">一段読書と連携</p>
            </div>
          </div>
        </header>

        {/* ログインフォーム */}
        <main className="w-full max-w-md px-6 py-6 flex-1">
          <div className="card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">管理画面ログイン</h2>
              <p className="text-primary-600">管理者パスワードを入力してください</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="パスワードを入力"
                  required
                />
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                ログイン
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                ← トップページに戻る
              </button>
            </div>
                  </div>

        {/* 駅登録フォーム */}
        {activeTab === 'stations' && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">新しい駅を登録</h3>
              <button
                onClick={() => setShowStationForm(!showStationForm)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {showStationForm ? '閉じる' : '駅を追加'}
              </button>
            </div>

            {showStationForm && (
              <form onSubmit={handleStationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      駅名
                    </label>
                    <input
                      type="text"
                      value={stationForm.name}
                      onChange={(e) => setStationForm({...stationForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例: 新宿駅"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地域
                    </label>
                    <input
                      type="text"
                      value={stationForm.location}
                      onChange={(e) => setStationForm({...stationForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="例: 新宿区"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    登録する
                  </button>
                </div>
              </form>
            )}
          </div>
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

  // 管理画面
  return (
    <div className="w-full min-h-screen bg-primary-50 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="w-full bg-white shadow-sm border-b border-primary-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 sm:py-6">
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xl sm:text-2xl font-bold text-primary-900 border-b-2 border-primary-200 pb-2 hover:text-primary-600 transition-colors"
            >
              ichidan-dokusho-place
            </button>
            <p className="text-primary-600 mt-3 text-sm sm:text-base">
              読書に集中できる場所を見つけよう
            </p>
            <p className="text-xs text-primary-500 mt-1">一段読書と連携</p>
            <div className="mt-4 flex justify-center items-center space-x-4">
              <span className="text-sm text-primary-600">管理者</span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="inline-flex items-center px-3 py-2 border border-primary-300 text-xs font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="w-full max-w-md px-6 py-6 flex-1">


        {/* タブ */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('cafes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cafes'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              喫茶店 ({cafes.length})
            </button>
            <button
              onClick={() => setActiveTab('bookstores')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'bookstores'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              本屋 ({bookstores.length})
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stations'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              駅 ({stations.length})
            </button>
          </div>
        </div>

        {/* データ一覧 */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                登録された{activeTab === 'cafes' ? '喫茶店' : activeTab === 'bookstores' ? '本屋' : '駅'}がありません
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'stations' ? (
                // 駅一覧テーブル
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        駅名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        地域
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(currentData as Station[]).map((station) => (
                      <tr key={station.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{station.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {station.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditStation(station)}
                              className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md text-xs"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteStation(station.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // 喫茶店・本屋一覧テーブル
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        店舗名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最寄駅
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        徒歩時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(currentData as Place[]).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.walkingTime && (
                            <span className="inline-flex items-center">
                              🚶‍♂️ {formatWalkingTime(item.walkingTime)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md text-xs"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, activeTab as 'cafes' | 'bookstores')}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-white border-t border-primary-200 mt-8">
        <div className="max-w-md mx-auto px-6 py-4">
          <p className="text-center text-primary-600 text-xs">
            © 2024 ichidan-dokusho-place. 読書の空間設計を支援するプロトタイプ機能です。
          </p>
        </div>
      </footer>

      {/* 編集モーダル */}
      {editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">編集</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    店舗名
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.googleMapsUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最寄駅
                  </label>
                  <select
                    value={editingItem.station}
                    onChange={(e) => setEditingItem({ ...editingItem, station: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {stations.map((station) => (
                      <option key={station.id} value={station.name}>
                        {station.name}
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
                    value={editingItem.walkingTime}
                    onChange={(e) => setEditingItem({ ...editingItem, walkingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 駅編集モーダル */}
      {editingStation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">駅を編集</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    駅名
                  </label>
                  <input
                    type="text"
                    value={editingStation.name}
                    onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地域
                  </label>
                  <input
                    type="text"
                    value={editingStation.location}
                    onChange={(e) => setEditingStation({ ...editingStation, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelEditStation}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEditStation}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin; 
