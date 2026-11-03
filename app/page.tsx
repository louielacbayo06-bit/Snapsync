import { HomePage } from '../components/home-page';
import { supabase } from '../utils/supabase';

// Next.js 16 uses this instead of 'force-dynamic'
export const instant = false;

export default async function Home() {
  const { error } = await supabase.from('test_table').select('*').limit(1);
  const isConnected = !error || error.code === '42P01';

  return <HomePage isConnected={isConnected} />;
}
