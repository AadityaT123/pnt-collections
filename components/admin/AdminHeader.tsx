'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { assets } from '@/lib/assets'

interface AdminHeaderProps {
  adminEmail?: string | null
  adminName?: string | null
  role?: string
}

export default function AdminHeader({ adminEmail, adminName, role = 'admin' }: AdminHeaderProps) {
  const router = useRouter()
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

  return (
    <header className="sticky top-0 z-50 bg-[#1C1613] text-[#F8F1E7] border-b border-[#3D2F28] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Portal Identity */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded bg-[#2B211C] p-1 border border-[#4A3B32]">
              <Image
                src={assets.images.logo}
                alt="PNT Collections"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wider text-[#E8D8C8] uppercase group-hover:text-amber-300 transition-colors">
                PNT Collections
              </span>
              <span className="text-[10px] text-[#A68A78] tracking-widest uppercase">
                Admin Console
              </span>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#3D2F28]">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {role}
            </span>
          </div>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:text-[#E8D8C8] transition-colors py-1.5 px-2.5 rounded hover:bg-[#2B211C]"
          >
            <span>Live Storefront</span>
            <svg
              className="w-3.5 h-3.5"
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
            <p className="text-xs font-medium text-[#F8F1E7]">
              {adminName || 'System Admin'}
            </p>
            <p className="text-[11px] text-[#A68A78] truncate max-w-[200px]">
              {adminEmail || 'admin@pntcollections.com'}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E8D8C8] bg-[#2B211C] hover:bg-[#3D2F28] border border-[#4A3B32] hover:border-amber-500/40 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSigningOut ? (
              <>
                <svg
                  className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-amber-300"
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
                  className="w-3.5 h-3.5 text-[#A68A78]"
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
