import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = {
  title: 'Admin Console | PNT Creation',
  description: 'PNT Creation internal administration and catalog console.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verify authenticated Supabase Auth user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // 2. Authoritative check via public.is_admin() RPC function
  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin')

  if (rpcError || !isAdmin) {
    // Attempt graceful sign-out to clear unauthorized session cookies
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  // 3. Fetch admin profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active || profile.role !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-[#F8F1E7] text-[#2B211C] flex flex-col font-sans selection:bg-[#B58A45]/20 selection:text-[#2B211C]">
      <AdminHeader
        adminEmail={user.email}
        adminName={profile.full_name}
        role={profile.role}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
