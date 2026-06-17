'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/auth/AuthCard"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Note: When the user clicks the link in the email, they are redirected here.
  // Supabase auth-helpers automatically exchange the #access_token for a session
  // behind the scenes. So we can just call updateUser.

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error

      toast.success("Password updated successfully!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Error updating password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Update Password" subtitle="Enter your new password below">
      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-2 py-3">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthCard>
  )
}
