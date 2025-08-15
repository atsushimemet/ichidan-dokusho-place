import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = '19930322';

function AdminLayout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // モバイルメニューを閉じる
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* ハンバーガーメニューボタン（モバイル用） */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-3"
              >
                <span className="sr-only">メニューを開く</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
              <Link to="/admin" className="text-xl font-bold text-gray-900">
                管理画面
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">管理者</span>
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

      <div className="flex flex-1 relative">
        {/* デスクトップサイドバー */}
        <nav className="hidden lg:block w-64 bg-white shadow-sm">
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

        {/* モバイルサイドバー（オーバーレイ） */}
        {isMobileMenuOpen && (
          <>
            {/* バックドロップ */}
            <div
              className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
              onClick={closeMobileMenu}
            ></div>
            
            {/* サイドバー */}
            <nav className="lg:hidden fixed top-0 left-0 bottom-0 flex flex-col w-80 max-w-xs bg-white z-50 transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">メニュー</span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      📊 ダッシュボード
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/stations"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      🚉 駅一覧
                    </Link>
                  </li>
                  <li className="pt-2">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                      店舗管理
                    </div>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          to="/admin/shop/cafes"
                          onClick={closeMobileMenu}
                          className="block px-6 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          ☕ 喫茶店
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/shop/books"
                          onClick={closeMobileMenu}
                          className="block px-6 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          📚 本屋
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/admin/shop/bars"
                          onClick={closeMobileMenu}
                          className="block px-6 py-3 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          🍺 バー
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </nav>
          </>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;