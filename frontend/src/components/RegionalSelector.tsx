import { useState, useEffect } from 'react';

// API URLを環境変数から取得
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Region {
  id: number;
  name: string;
  code: string;
}

interface Prefecture {
  id: number;
  name: string;
  code: string;
  region_id: number;
}

interface RegionalSelectorProps {
  selectedRegion?: number;
  selectedPrefecture?: number;
  selectedStation?: string;
  onRegionChange?: (regionId: number | undefined) => void;
  onPrefectureChange?: (prefectureId: number | undefined) => void;
  onStationChange?: (station: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

// 日本の八地方区分（フォールバック用）
const fallbackRegions: Region[] = [
  { id: 1, name: '北海道地方', code: 'hokkaido' },
  { id: 2, name: '東北地方', code: 'tohoku' },
  { id: 3, name: '関東地方', code: 'kanto' },
  { id: 4, name: '中部地方', code: 'chubu' },
  { id: 5, name: '近畿地方', code: 'kinki' },
  { id: 6, name: '中国地方', code: 'chugoku' },
  { id: 7, name: '四国地方', code: 'shikoku' },
  { id: 8, name: '九州・沖縄地方', code: 'kyushu_okinawa' }
];

// 都道府県（フォールバック用 - 関東地方のみ）
const fallbackPrefectures: Prefecture[] = [
  { id: 8, name: '茨城県', code: 'ibaraki', region_id: 3 },
  { id: 9, name: '栃木県', code: 'tochigi', region_id: 3 },
  { id: 10, name: '群馬県', code: 'gunma', region_id: 3 },
  { id: 11, name: '埼玉県', code: 'saitama', region_id: 3 },
  { id: 12, name: '千葉県', code: 'chiba', region_id: 3 },
  { id: 13, name: '東京都', code: 'tokyo', region_id: 3 },
  { id: 14, name: '神奈川県', code: 'kanagawa', region_id: 3 }
];

function RegionalSelector({
  selectedRegion,
  selectedPrefecture,
  selectedStation,
  onRegionChange,
  onPrefectureChange,
  onStationChange,
  className = '',
  disabled = false
}: RegionalSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 地方一覧を取得
  useEffect(() => {
    fetchRegions();
  }, []);

  // 地方が選択されたら都道府県一覧を取得
  useEffect(() => {
    if (selectedRegion) {
      fetchPrefectures(selectedRegion);
    } else {
      setPrefectures([]);
      setStations([]);
    }
  }, [selectedRegion]);

  // 都道府県が選択されたら駅一覧を取得
  useEffect(() => {
    if (selectedPrefecture) {
      fetchStations(selectedPrefecture);
    } else {
      setStations([]);
    }
  }, [selectedPrefecture]);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/regions`);
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        throw new Error('Failed to fetch regions');
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      // フォールバック
      setRegions(fallbackRegions);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrefectures = async (regionId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/prefectures?region_id=${regionId}`);
      if (response.ok) {
        const data = await response.json();
        setPrefectures(data);
      } else {
        throw new Error('Failed to fetch prefectures');
      }
    } catch (error) {
      console.error('Failed to fetch prefectures:', error);
      // フォールバック（関東地方の場合）
      if (regionId === 3) {
        setPrefectures(fallbackPrefectures);
      } else {
        setPrefectures([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async (prefectureId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/stations?prefecture_id=${prefectureId}`);
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      } else {
        throw new Error('Failed to fetch stations');
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      // フォールバック（東京都の場合）
      if (prefectureId === 13) {
        setStations(['渋谷駅', '新宿駅', '池袋駅', '東京駅', '品川駅', '上野駅', '秋葉原駅', '原宿駅']);
      } else {
        setStations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const regionId = value ? parseInt(value) : undefined;
    onRegionChange?.(regionId);
    onPrefectureChange?.(undefined); // 都道府県をリセット
    onStationChange?.(undefined); // 駅をリセット
  };

  const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const prefectureId = value ? parseInt(value) : undefined;
    onPrefectureChange?.(prefectureId);
    onStationChange?.(undefined); // 駅をリセット
  };

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || undefined;
    onStationChange?.(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 地方選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          地方区分
        </label>
        <select
          value={selectedRegion || ''}
          onChange={handleRegionChange}
          disabled={disabled || loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">地方を選択してください</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* 都道府県選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          都道府県
        </label>
        <select
          value={selectedPrefecture || ''}
          onChange={handlePrefectureChange}
          disabled={disabled || loading || !selectedRegion}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">都道府県を選択してください</option>
          {prefectures.map((prefecture) => (
            <option key={prefecture.id} value={prefecture.id}>
              {prefecture.name}
            </option>
          ))}
        </select>
      </div>

      {/* 駅選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          最寄駅
        </label>
        <select
          value={selectedStation || ''}
          onChange={handleStationChange}
          disabled={disabled || loading || !selectedPrefecture}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">最寄駅を選択してください</option>
          {stations.map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          読み込み中...
        </div>
      )}
    </div>
  );
}

export default RegionalSelector;