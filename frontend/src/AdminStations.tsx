import { useEffect, useState } from 'react';
import EditModal from './components/EditModal';

// API URLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Station {
  id: number;
  name: string;
  location: string;
  prefecture_id?: number;
  prefecture_name?: string;
  region_name?: string;
  created_at?: string;
}

function AdminStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stations/all`);
      if (!response.ok) {
        throw new Error('駅データの取得に失敗しました');
      }
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setError('駅データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
  };

  const handleSaveStation = async (data: any) => {
    if (!editingStation) return;
    
    const response = await fetch(`${API_BASE_URL}/api/stations/${editingStation.id}`, {
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

    // Update local state
    const updatedStation = await response.json();
    setStations(stations.map(s => s.id === editingStation.id ? updatedStation : s));
    setEditingStation(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // リストから削除
      setStations(stations.filter(station => station.id !== id));
    } catch (error) {
      console.error('Failed to delete station:', error);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">駅一覧</h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">登録されている駅の一覧です</p>
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
              駅一覧 ({stations.length}件)
            </h3>
          </div>

          {stations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">登録されている駅がありません</div>
            </div>
          ) : (
            <>
              {/* モバイル表示: カード形式 */}
              <div className="block sm:hidden space-y-4">
                {stations.map((station) => (
                  <div key={station.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">🚉</span>
                        <h4 className="text-lg font-medium text-gray-900">{station.name}</h4>
                      </div>
                      <span className="text-sm text-gray-500">ID: {station.id}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">所在地:</span>
                        <span className="text-sm text-gray-900 ml-2">{station.location}</span>
                      </div>
                      {station.prefecture_name && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">都道府県:</span>
                          <span className="text-sm text-gray-900 ml-2">{station.prefecture_name}</span>
                        </div>
                      )}
                      {station.region_name && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">地方:</span>
                          <span className="text-sm text-gray-900 ml-2">{station.region_name}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-500">登録日時:</span>
                        <span className="text-sm text-gray-900 ml-2">
                          {station.created_at 
                            ? new Date(station.created_at).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(station)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(station.id, station.name)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* デスクトップ表示: テーブル形式 */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        駅名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        所在地
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        都道府県
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        地方
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
                    {stations.map((station) => (
                      <tr key={station.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {station.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            🚉 {station.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {station.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {station.prefecture_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {station.region_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {station.created_at 
                            ? new Date(station.created_at).toLocaleDateString('ja-JP')
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(station)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(station.id, station.name)}
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
        isOpen={!!editingStation}
        onClose={() => setEditingStation(null)}
        onSave={handleSaveStation}
        title="駅編集"
        fields={[
          { key: 'name', label: '駅名', type: 'text', required: true, value: editingStation?.name || '' },
          { key: 'location', label: '所在地', type: 'text', required: true, value: editingStation?.location || '' },
        ]}
      />
    </div>
  );
}

export default AdminStations;