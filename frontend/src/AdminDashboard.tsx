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
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [apiErrors, setApiErrors] = useState<{[key: string]: any}>({});
  
  // スマホデバッグ機能
  const [mobileConsole, setMobileConsole] = useState<string[]>([]);
  const [showMobileConsole, setShowMobileConsole] = useState(false);
  const [networkLogs, setNetworkLogs] = useState<any[]>([]);
  
  // ログを追加する関数
  const addMobileLog = (message: string, type: 'info' | 'error' | 'warn' | 'network' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setMobileConsole(prev => [...prev.slice(-49), logEntry]); // 最新50件を保持
  };
  
  // ネットワークログを追加する関数
  const addNetworkLog = (method: string, url: string, status?: number, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      method,
      url,
      status,
      data,
      id: Date.now()
    };
    setNetworkLogs(prev => [...prev.slice(-19), logEntry]); // 最新20件を保持
  };
  
  // エラーをクリアする関数
  const clearError = () => {
    setError(null);
    setApiErrors({});
  };
  
  // デバッグログをクリア
  const clearDebugLogs = () => {
    setMobileConsole([]);
    setNetworkLogs([]);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        addMobileLog('管理画面統計データ取得開始', 'info');
        
        const [stationsRes, cafesRes, bookstoresRes, barsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/stations/all`),
          fetch(`${API_BASE_URL}/api/cafes/all`),
          fetch(`${API_BASE_URL}/api/bookstores/all`),
          fetch(`${API_BASE_URL}/api/bars/all`)
        ]);

        addNetworkLog('GET', `${API_BASE_URL}/api/stations/all`, stationsRes.status);
        addNetworkLog('GET', `${API_BASE_URL}/api/cafes/all`, cafesRes.status);
        addNetworkLog('GET', `${API_BASE_URL}/api/bookstores/all`, bookstoresRes.status);
        addNetworkLog('GET', `${API_BASE_URL}/api/bars/all`, barsRes.status);

        // レスポンスステータスをチェック
        if (!stationsRes.ok) {
          throw new Error(`駅データ取得失敗: HTTP ${stationsRes.status}`);
        }
        if (!cafesRes.ok) {
          throw new Error(`カフェデータ取得失敗: HTTP ${cafesRes.status}`);
        }
        if (!bookstoresRes.ok) {
          throw new Error(`本屋データ取得失敗: HTTP ${bookstoresRes.status}`);
        }
        if (!barsRes.ok) {
          throw new Error(`バーデータ取得失敗: HTTP ${barsRes.status}`);
        }

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
        
        addMobileLog(`統計データ取得完了: 駅${stations.length}件, カフェ${cafes.length}件, 本屋${bookstores.length}件, バー${bars.length}件`, 'info');
        clearError(); // 成功時はエラーをクリア
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        const errorMessage = `統計データの取得に失敗: ${error instanceof Error ? error.message : String(error)}`;
        addMobileLog(errorMessage, 'error');
        setError(errorMessage);
        setApiErrors(prev => ({...prev, stats: error}));
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">ichidan-dokusho-place 管理画面</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`text-xs px-2 py-1 rounded ${debugMode ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'}`}
            >
              🐛
            </button>
            <button
              onClick={() => setShowMobileConsole(!showMobileConsole)}
              className={`text-xs px-2 py-1 rounded ${showMobileConsole ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'}`}
            >
              📱
            </button>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-medium">⚠️ エラーが発生しました</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                API URL: {API_BASE_URL}
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
      )}

      {/* デバッグ情報 */}
      {debugMode && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-medium mb-2">🐛 デバッグ情報</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div>API URL: {API_BASE_URL}</div>
            <div>駅数: {stats.stations}</div>
            <div>カフェ数: {stats.cafes}</div>
            <div>本屋数: {stats.bookstores}</div>
            <div>バー数: {stats.bars}</div>
            <div>ローディング中: {loading ? 'はい' : 'いいえ'}</div>
            {Object.keys(apiErrors).length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-red-600">APIエラー詳細</summary>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(apiErrors, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* スマホコンソール */}
      {showMobileConsole && (
        <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-xs mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-green-300 font-bold">📱 管理画面コンソール</h3>
            <div className="flex gap-1">
              <button
                onClick={clearDebugLogs}
                className="text-red-400 hover:text-red-300 px-2 py-1 bg-gray-800 rounded text-xs"
              >
                Clear
              </button>
              <button
                onClick={() => setShowMobileConsole(false)}
                className="text-gray-400 hover:text-gray-300 px-2 py-1 bg-gray-800 rounded text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-1">
            {mobileConsole.length === 0 ? (
              <div className="text-gray-500">ログがありません</div>
            ) : (
              mobileConsole.map((log, index) => (
                <div 
                  key={index} 
                  className={`${
                    log.includes('ERROR') ? 'text-red-400' :
                    log.includes('WARN') ? 'text-yellow-400' :
                    log.includes('NETWORK') ? 'text-blue-400' :
                    'text-green-400'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
          
          {networkLogs.length > 0 && (
            <details className="mt-2">
              <summary className="text-blue-300 cursor-pointer">ネットワークログ ({networkLogs.length})</summary>
              <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                {networkLogs.map((log) => (
                  <div key={log.id} className="text-xs">
                    <div className={`${log.status >= 200 && log.status < 300 ? 'text-green-400' : 'text-red-400'}`}>
                      [{log.timestamp}] {log.method} {log.url.split('/').pop()} 
                      {log.status ? ` - ${log.status}` : ' - PENDING'}
                    </div>
                    {log.data && (
                      <div className="text-gray-400 ml-2 truncate">
                        {typeof log.data === 'object' ? JSON.stringify(log.data).slice(0, 100) : String(log.data).slice(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

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