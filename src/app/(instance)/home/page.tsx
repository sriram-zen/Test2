import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Image from 'next/image'

export const metadata = {
  title: 'Welcome Home',
  description: 'Instance-specific home page',
}

export default async function InstanceHomePage() {
  const supabase = createServerComponentClient({ cookies })
  // Example: fetch some instance-specific config from Supabase (dummy, replace with real table)
  const { data: instanceConfig } = await supabase
    .from('instances')
    .select('*')
    .eq('slug', 'default')
    .single()

  return (
    <section className="flex flex-col items-center gap-6">
      <Image
        src="https://images.pexels.com/photos/31716531/pexels-photo-31716531/free-photo-of-dreamy-portrait-with-floral-face-art.jpeg?auto=compress&cs=tinysrgb&w=1200&lazy=load"
        alt="Welcome image"
        width={1200}
        height={800}
        className="rounded-xl shadow-lg"
        unoptimized
      />
      <h1 className="text-3xl font-extrabold text-[#043933]">
        {instanceConfig?.branding_name || 'Instance Home'}
      </h1>
      <p className="max-w-xl text-lg text-gray-700 text-center">
        {instanceConfig?.welcome_message || 'Welcome to your personalized platform instance. Enjoy custom theming, secure access, and a delightful experience!'}
      </p>
      <div className="mt-6 flex gap-4">
        <a
          href="/instruments"
          className="px-5 py-2 rounded-lg bg-[#043933] text-white font-semibold hover:bg-[#055444] transition"
        >
          Explore Instruments
        </a>
        <a
          href="/protected"
          className="px-5 py-2 rounded-lg border border-[#043933] text-[#043933] font-semibold hover:bg-[#043933] hover:text-white transition"
        >
          Protected Area
        </a>
      </div>
    </section>
  )
}
