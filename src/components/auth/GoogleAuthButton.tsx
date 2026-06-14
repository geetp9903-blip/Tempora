import * as React from "react"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export const GoogleAuthButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false)
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || "An error occurred signing in with Google")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.24 10.285V14.4h6.887C18.2 16.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.617l3.18-3.18C17.96 1.84 15.26 1 12.24 1c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.776 0 10.7-4.164 10.7-10 0-.663-.08-1.32-.24-1.715H12.24z"/>
      </svg>
      {loading ? "Connecting..." : "Continue with Google"}
    </Button>
  )
}
