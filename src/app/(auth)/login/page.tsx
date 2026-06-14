'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      toast.success("Welcome back!")
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your Tempora account">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-secondary">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-primary hover:text-brand-light transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-2 py-3">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0e0e1a] px-3 text-secondary font-medium">Or continue with</span>
        </div>
      </div>

      <GoogleAuthButton />

      <p className="text-center text-sm text-secondary mt-2">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-primary hover:text-brand-light font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
