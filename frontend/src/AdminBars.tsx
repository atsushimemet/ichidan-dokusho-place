import { useEffect, useState } from 'react';
import EditModal from './components/EditModal';

// API URLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Bar {
  id: number;
  name: string;
  location: string;
  station: string;
  google_maps_url: string;
  walking_time?: string;
  created_at?: string;
}

function AdminBars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBar, setEditingBar] = useState<Bar | null>(null);

  useEffect(() => {
    fetchBars();
  }, []);

  const fetchBars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bars/all`);
      if (!response.ok) {
        throw new Error('バーデータの取得に失敗しました');
      }
      const data = await response.json();
      setBars(data);
    } catch (error) {
      console.error('Failed to fetch bars:', error);
      setError('バーデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bar: Bar) => {
    setEditingBar(bar);
  };

  const handleSaveBar = async (data: any) => {
    if (!editingBar) return;
    
    const response = await fetch(`${API_BASE_URL}/api/bars/${editingBar.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '更新に失敗しました');
    }

    const updatedBar = await response.json();
    setBars(bars.map(b => b.id === editingBar.id ? updatedBar : b));
    setEditingBar(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bars/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // リストから削除
      setBars(bars.filter(bar => bar.id !== id));
    } catch (error) {
      console.error('Failed to delete bar:', error);
      alert('削除に失敗しました');
    }
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">バー一覧</h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">登録されているバーの一覧です</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              バー一覧 ({bars.length}件)
            </h3>
          </div>

          {bars.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">登録されているバーがありません</div>
            </div>
          ) : (
            <>
              {/* モバイル表示: カード形式 */}
              <div className="block lg:hidden space-y-4">
                {bars.map((bar) => (
                  <div key={bar.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🍺</span>
                        <h4 className="text-lg font-medium text-gray-900">{bar.name}</h4>
                      </div>
                      <span className="text-sm text-gray-500">ID: {bar.id}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">所在地:</span>
                        <span className="text-sm text-gray-900 ml-2">{bar.location}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">最寄駅:</span>
                        <span className="text-sm text-gray-900 ml-2">{bar.station}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">徒歩時間:</span>
                        <span className="text-sm text-gray-900 ml-2">
                          {bar.walking_time ? `${bar.walking_time}分` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Google Maps:</span>
                        <a
                          href={bar.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-900 ml-2"
                        >
                          地図を開く
                        </a>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">登録日時:</span>
                        <span className="text-sm text-gray-900 ml-2">
                          {bar.created_at 
                            ? new Date(bar.created_at).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(bar)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(bar.id, bar.name)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* デスクトップ表示: テーブル形式 */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        店名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所在地
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最寄駅
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        徒歩時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Google Maps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bars.map((bar) => (
                      <tr key={bar.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bar.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            🍺 {bar.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bar.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bar.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bar.walking_time ? `${bar.walking_time}分` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={bar.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            地図を開く
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bar.created_at 
                            ? new Date(bar.created_at).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(bar)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(bar.id, bar.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <EditModal
        isOpen={!!editingBar}
        onClose={() => setEditingBar(null)}
        onSave={handleSaveBar}
        title="バー編集"
        fields={[
          { key: 'name', label: '店舗名', type: 'text', required: true, value: editingBar?.name || '' },
          { key: 'station', label: '最寄駅', type: 'text', required: true, value: editingBar?.station || '' },
          { key: 'google_maps_url', label: 'Google Maps URL', type: 'url', required: true, value: editingBar?.google_maps_url || '' },
          { key: 'walking_time', label: '徒歩時間（分）', type: 'number', required: false, value: editingBar?.walking_time || '' },
        ]}
      />
    </div>
  );
}

export default AdminBars;