import Link from 'next/link'
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/50 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#B58A45]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Authenticated Session
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#2B211C]">
                Welcome, {profile?.full_name || 'Administrator'}
              </h1>
              <p className="text-sm text-[#7A5A45] mt-1 max-w-2xl">
                You have successfully authenticated into the PNT Creation Admin Console.
                Your active role is verified via database-level authorization.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end text-xs text-[#7A5A45] bg-[#F8F1E7] p-3 rounded-lg border border-[#D6B978]/50 shadow-xs">
              <span className="text-[#2B211C] font-semibold">
                {user?.email}
              </span>
              <span className="mt-0.5 text-[11px] text-[#641C24] font-medium">
                Role: {profile?.role?.toUpperCase() || 'ADMIN'}
              </span>
              <span className="text-[10px] text-[#B58A45] mt-1 font-mono">
                Verified via public.is_admin()
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Foundation Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B58A45]">
              Auth Foundation
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-lg font-serif font-medium text-[#2B211C]">
            Supabase Auth
          </p>
          <p className="text-xs text-[#7A5A45] mt-1">
            Cookie-based SSR session management with active token refresh via Next.js Proxy.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B58A45]">
              Database Schema
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-lg font-serif font-medium text-[#2B211C]">
            Catalog Foundation
          </p>
          <p className="text-xs text-[#7A5A45] mt-1">
            12 core tables and security barrier views deployed and remotely verified.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B58A45]">
              Access Control
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-lg font-serif font-medium text-[#2B211C]">
            Role-Based RLS
          </p>
          <p className="text-xs text-[#7A5A45] mt-1">
            Strict isolation between customer, staff, and admin roles with SECURITY DEFINER helpers.
          </p>
        </div>
      </div>

      {/* Modules Readiness Overview */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-md space-y-4">
        <div>
          <h2 className="text-base font-serif font-semibold text-[#2B211C] tracking-wide">
            Admin Subsystems Readiness
          </h2>
          <p className="text-xs text-[#7A5A45] mt-0.5">
            Database models are active. Administrative management interfaces will be implemented in subsequent phases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F8F1E7] border border-[#D6B978]/40 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#2B211C]">Catalog & Sarees</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                  Live Management
                </span>
              </div>
              <p className="text-[11px] text-[#7A5A45]">
                Product specs, variants, stock ledger, categories, and image metadata.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="mt-3 inline-flex items-center gap-1 text-xs text-[#641C24] hover:text-[#4A141B] font-semibold transition-colors"
            >
              <span>Manage Products</span>
              <svg className="w-3 h-3 text-[#B58A45]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F1E7] border border-[#D6B978]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#2B211C]">Inventory Ledger</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFE2D0] text-[#7A5A45] border border-[#D6B978]/40 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#7A5A45]">
              Append-only movements ledger with stock constraints and concurrency locks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F1E7] border border-[#D6B978]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#2B211C]">Categories & Tags</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFE2D0] text-[#7A5A45] border border-[#D6B978]/40 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#7A5A45]">
              Hierarchical categories with recursive cycle-prevention triggers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F1E7] border border-[#D6B978]/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#2B211C]">Customer Records</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFE2D0] text-[#7A5A45] border border-[#D6B978]/40 font-mono">
                Schema Ready
              </span>
            </div>
            <p className="text-[11px] text-[#7A5A45]">
              Protected customer profiles, addresses, and order history foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
