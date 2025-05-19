import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Instance Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/sign-in?redirect=/admin/dashboard')
  }
  // Check for admin role (replace 'is_admin' with your own column/claim)
  // This example assumes a 'roles' claim or user_metadata.is_admin
  const isAdmin = user.user_metadata?.is_admin || user?.role === 'admin'
  if (!isAdmin) {
    redirect('/')
  }

  // Fetch instance configs or any admin data
  const { data: instances } = await supabase.from('instances').select('*')

  return (
    <section>
      <h1 className="text-3xl font-bold text-[#043933] mb-8">Admin Dashboard</h1>
      <p className="mb-6">Manage your instance settings, users, and compliance from this dashboard.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="font-semibold mb-2 text-[#043933]">Instance Configurations</h2>
          <ul className="text-sm">
            {instances?.map((inst) => (
              <li key={inst.id} className="py-1 border-b last:border-b-0">
                <span className="font-medium">{inst.branding_name || inst.slug}</span>
                <span className="ml-2 text-xs text-gray-500">({inst.slug})</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border">
          <h2 className="font-semibold mb-2 text-[#043933]">Compliance Logs</h2>
          <p className="text-xs text-gray-600 mb-2">Access and export activities are logged.</p>
          {/* Optionally, fetch and display logs */}
        </div>
      </div>
    </section>
  )
}
