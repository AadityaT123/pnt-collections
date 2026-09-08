'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { assets } from '@/lib/assets'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === 'unauthorized'
      ? 'Access restricted: Administrator credentials are required.'
      : null
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 1. Authenticate against Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (authError || !authData.user) {
        setErrorMessage(
          authError?.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please try again.'
            : authError?.message || 'Authentication failed. Please try again.'
        )
        setIsLoading(false)
        return
      }

      // 2. Verify admin authorization via public.is_admin() RPC
      const { data: isAdmin, error: rpcError } =
        await supabase.rpc('is_admin')

      if (rpcError || !isAdmin) {
        // User is authenticated, but is NOT an active admin in public.profiles
        await supabase.auth.signOut()
        setErrorMessage(
          'Access restricted: This account does not possess administrator privileges.'
        )
        setIsLoading(false)
        return
      }

      // 3. Authorized Admin: Route to protected /admin dashboard
      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      console.error('Login error:', err)
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#1C1613] border border-[#3D2F28] shadow-xl mb-4">
          <div className="relative w-12 h-12">
            <Image
              src={assets.images.logo}
              alt="PNT Collections"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="text-2xl font-serif font-medium tracking-wide text-[#F8F1E7]">
          PNT Collections
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#C5A880] mt-1 font-medium">
          Admin Portal Authentication
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-[#1C1613] border border-[#3D2F28] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
              <svg
                className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-[#E8D8C8] uppercase tracking-wider mb-2"
            >
              Admin Email
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pntcollections.com"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-[#2B211C] border border-[#4A3B32] rounded-lg text-sm text-[#F8F1E7] placeholder-[#786154] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#E8D8C8] uppercase tracking-wider mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-[#2B211C] border border-[#4A3B32] rounded-lg text-sm text-[#F8F1E7] placeholder-[#786154] focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C5A880] to-[#E8D8C8] hover:from-[#B8986C] hover:to-[#D8C4B0] text-[#1C1613] text-sm font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[#1C1613]"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#3D2F28] flex items-center justify-between text-xs text-[#A68A78]">
          <span>Protected Administrative Zone</span>
          <Link
            href="/"
            className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Return to Store</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#140F0D] text-[#F8F1E7] flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-[#A68A78] text-sm">
            Loading authentication portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
