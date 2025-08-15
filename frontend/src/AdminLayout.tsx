import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = '19930322';

function AdminLayout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  // ログアウト処理
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
        {/* ヘッダー */}
        <header className="w-full bg-white shadow-sm border-b border-primary-200">
          <div className="max-w-md mx-auto px-6 py-4">
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
        <main className="w-full max-w-md px-6 py-6 flex-1 mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/admin" className="text-xl font-bold text-gray-900">
                管理画面
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">管理者</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  📊 ダッシュボード
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/stations"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  🚉 駅一覧
                </Link>
              </li>
              <li className="pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  店舗管理
                </div>
                <ul className="space-y-1 ml-3">
                  <li>
                    <Link
                      to="/admin/shop/cafes"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      ☕ 喫茶店
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/shop/books"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      📚 本屋
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/shop/bars"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      🍺 バー
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;