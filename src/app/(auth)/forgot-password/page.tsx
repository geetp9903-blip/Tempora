'use client'

import * as React from "react"
import Link from "next/link"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      })
      if (error) throw error

      toast.success("Password reset link sent! Check your inbox.")
    } catch (err: any) {
      toast.error(err.message || "Error sending password reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Reset Password" subtitle="Enter your email to receive a password reset link">
      <form onSubmit={handleReset} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-2 py-3">
          {loading ? "Sending link..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-sm text-secondary mt-2">
        Remembered your password?{" "}
        <Link href="/login" className="text-brand-primary hover:text-brand-light font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
