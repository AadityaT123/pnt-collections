'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { assets } from '@/lib/assets'

interface AdminHeaderProps {
  adminEmail?: string | null
  adminName?: string | null
  role?: string
}

export default function AdminHeader({ adminEmail, adminName, role = 'admin' }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Error signing out:', err)
      setIsSigningOut(false)
    }
  }

  const isDashboardActive = pathname === '/admin'
  const isProductsActive = pathname.startsWith('/admin/products')

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] text-[#2B211C] border-b border-[#D6B978]/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Portal Identity */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded bg-[#F8F1E7] p-1 border border-[#D6B978]/50">
              <Image
                src={assets.images.logo}
                alt="PNT Creation"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold tracking-wider text-[#2B211C] uppercase group-hover:text-[#641C24] transition-colors">
                PNT Creation
              </span>
              <span className="text-[10px] text-[#B58A45] tracking-widest uppercase font-medium">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#D6B978]/40">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFE2D0] text-[#641C24] border border-[#D6B978]/60 uppercase tracking-wider">
              {role}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-[#D6B978]/40">
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDashboardActive
                  ? 'bg-[#641C24] text-white shadow-xs font-semibold'
                  : 'text-[#7A5A45] hover:text-[#2B211C] hover:bg-[#F8F1E7]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isProductsActive
                  ? 'bg-[#641C24] text-white shadow-xs font-semibold'
                  : 'text-[#7A5A45] hover:text-[#2B211C] hover:bg-[#F8F1E7]'
              }`}
            >
              Products
            </Link>
          </nav>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#641C24] hover:text-[#4A141B] font-medium transition-colors py-1.5 px-2.5 rounded-lg hover:bg-[#F8F1E7] border border-transparent hover:border-[#D6B978]/30"
          >
            <span>Live Storefront</span>
            <svg
              className="w-3.5 h-3.5 text-[#B58A45]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>

          {/* Admin Identity */}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-[#2B211C]">
              {adminName || 'System Admin'}
            </p>
            <p className="text-[11px] text-[#7A5A45] truncate max-w-[200px]">
              {adminEmail || 'admin@pntcollections.com'}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#641C24] bg-[#F8F1E7] hover:bg-[#EFE2D0] border border-[#D6B978]/50 hover:border-[#B58A45] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <svg
                  className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-[#641C24]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-[#B58A45]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
