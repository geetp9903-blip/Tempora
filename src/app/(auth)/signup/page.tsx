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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      toast.success("Account created! Welcome to Tempora.")
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error creating account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Get Started" subtitle="Create your free Tempora account">
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-2 py-3">
          {loading ? "Creating account..." : "Sign Up"}
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
        Already have an account?{" "}
        <Link href="/login" className="text-brand-primary hover:text-brand-light font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
