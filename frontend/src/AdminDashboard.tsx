import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// API URLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Stats {
  stations: number;
  cafes: number;
  bookstores: number;
  bars: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    stations: 0,
    cafes: 0,
    bookstores: 0,
    bars: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stationsRes, cafesRes, bookstoresRes, barsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stations/all`),
          fetch(`${API_BASE_URL}/api/cafes/all`),
          fetch(`${API_BASE_URL}/api/bookstores/all`),
          fetch(`${API_BASE_URL}/api/bars/all`)
        ]);

        const [stations, cafes, bookstores, bars] = await Promise.all([
          stationsRes.json(),
          cafesRes.json(),
          bookstoresRes.json(),
          barsRes.json()
        ]);

        setStats({
          stations: stations.length,
          cafes: cafes.length,
          bookstores: bookstores.length,
          bars: bars.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">ichidan-dokusho-place 管理画面</p>
      </div>

      {/* 統計カード - モバイル縦型レイアウト */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link to="/admin/stations" className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl sm:text-2xl">🚉</div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">駅</dt>
                  <dd className="text-2xl sm:text-lg font-medium text-gray-900">{stats.stations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/shop/cafes" className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl sm:text-2xl">☕</div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">喫茶店</dt>
                  <dd className="text-2xl sm:text-lg font-medium text-gray-900">{stats.cafes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/shop/books" className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl sm:text-2xl">📚</div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">本屋</dt>
                  <dd className="text-2xl sm:text-lg font-medium text-gray-900">{stats.bookstores}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/shop/bars" className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl sm:text-2xl">🍺</div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">バー</dt>
                  <dd className="text-2xl sm:text-lg font-medium text-gray-900">{stats.bars}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* クイックアクション - モバイル向け縦型 */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">クイックアクション</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              to="/admin/stations"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="mr-2 text-lg">🚉</span>
              駅を管理
            </Link>
            <Link
              to="/admin/shop/cafes"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="mr-2 text-lg">☕</span>
              喫茶店を管理
            </Link>
            <Link
              to="/admin/shop/books"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="mr-2 text-lg">📚</span>
              本屋を管理
            </Link>
            <Link
              to="/admin/shop/bars"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="mr-2 text-lg">🍺</span>
              バーを管理
            </Link>
          </div>
        </div>
      </div>

      {/* システム情報 */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">システム情報</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-4 sm:gap-y-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">総登録数</dt>
              <dd className="mt-1 text-lg sm:text-sm text-gray-900 font-semibold">
                {stats.stations + stats.cafes + stats.bookstores + stats.bars} 件
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">最終更新</dt>
              <dd className="mt-1 text-lg sm:text-sm text-gray-900 font-semibold">
                {new Date().toLocaleDateString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;