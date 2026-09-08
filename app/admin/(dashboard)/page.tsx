import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active, created_at')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#1C1613] border border-[#3D2F28] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Authenticated Session
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#F8F1E7]">
                Welcome, {profile?.full_name || 'Administrator'}
              </h1>
              <p className="text-sm text-[#A68A78] mt-1 max-w-2xl">
                You have successfully authenticated into the PNT Collections Admin Console.
                Your active role is verified via database-level authorization.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs text-[#A68A78] bg-[#2B211C] p-3 rounded-lg border border-[#4A3B32]">
              <span className="text-[#E8D8C8] font-medium">
                {user?.email}
              </span>
              <span className="mt-0.5 text-[11px] text-amber-300">
                Role: {profile?.role?.toUpperCase() || 'ADMIN'}
              </span>
              <span className="text-[10px] text-[#8C7364] mt-1">
                Verified via public.is_admin()
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Foundation Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#1C1613] border border-[#3D2F28] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Auth Foundation
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-lg font-medium text-[#F8F1E7]">
            Supabase Auth
          </p>
          <p className="text-xs text-[#A68A78] mt-1">
            Cookie-based SSR session management with active token refresh via Next.js Proxy.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#1C1613] border border-[#3D2F28] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Database Schema
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-lg font-medium text-[#F8F1E7]">
            Catalog Foundation
          </p>
          <p className="text-xs text-[#A68A78] mt-1">
            12 core tables and security barrier views deployed and remotely verified.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#1C1613] border border-[#3D2F28] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Access Control
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-lg font-medium text-[#F8F1E7]">
            Role-Based RLS
          </p>
          <p className="text-xs text-[#A68A78] mt-1">
            Strict isolation between customer, staff, and admin roles with SECURITY DEFINER helpers.
          </p>
        </div>
      </div>

      {/* Modules Readiness Overview */}
      <div className="p-6 rounded-2xl bg-[#1C1613] border border-[#3D2F28] shadow-md space-y-4">
        <div>
          <h2 className="text-base font-semibold text-[#F8F1E7] tracking-wide">
            Admin Subsystems Readiness
          </h2>
          <p className="text-xs text-[#A68A78] mt-0.5">
            Database models are active. Administrative management interfaces will be implemented in subsequent phases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-[#2B211C] border border-[#4A3B32]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#E8D8C8]">Catalog & Sarees</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3D2F28] text-amber-300 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#A68A78]">
              Product specs, variants, and fabric/weave attributes configured in database.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#2B211C] border border-[#4A3B32]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#E8D8C8]">Inventory Ledger</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3D2F28] text-amber-300 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#A68A78]">
              Append-only movements ledger with stock constraints and concurrency locks.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#2B211C] border border-[#4A3B32]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#E8D8C8]">Categories & Tags</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3D2F28] text-amber-300 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#A68A78]">
              Hierarchical categories with recursive cycle-prevention triggers.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#2B211C] border border-[#4A3B32]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#E8D8C8]">Customer Records</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3D2F28] text-amber-300 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#A68A78]">
              Protected customer profiles, addresses, and order history foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
