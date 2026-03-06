import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.from('roles').select('*')
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}