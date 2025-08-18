// モックデータ投入スクリプト（開発環境用）
import { regions, prefectures } from './regions-data';

console.log('🌱 モックデータの確認');
console.log('==================');

console.log('\n🗾 地方データ:');
regions.forEach(region => {
  console.log(`  ${region.id}: ${region.name} (${region.code})`);
});

console.log('\n🏛️  都道府県データ:');
prefectures.forEach(prefecture => {
  const region = regions.find(r => r.id === prefecture.region_id);
  console.log(`  ${prefecture.id}: ${prefecture.name} → ${region?.name}`);
});

console.log('\n📊 統計:');
console.log(`  地方: ${regions.length}件`);
console.log(`  都道府県: ${prefectures.length}件`);

console.log('\n🎯 地方別都道府県数:');
regions.forEach(region => {
  const prefCount = prefectures.filter(p => p.region_id === region.id).length;
  console.log(`  ${region.name}: ${prefCount}県`);
});

console.log('\n✅ モックデータの確認が完了しました！');
console.log('💡 本番環境ではDATABASE_URL環境変数を設定してnpm run seedを実行してください。');