import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { AuthHeader } from './AuthHeader'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (error) {
      // Error is handled in AuthContext with toast
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <AuthHeader />
        <div className="flex min-h-screen items-center justify-center bg-black p-4 pt-24">
          <Card className="w-full max-w-md bg-white/[0.05] backdrop-blur-md border-white/[0.1]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-white">Check your email</CardTitle>
              <CardDescription className="text-center text-white/60">
                We've sent you a password reset link to {email}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link to="/auth/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <AuthHeader />
      <div className="flex min-h-screen items-center justify-center bg-black p-4 pt-24">
        <Card className="w-full max-w-md bg-white/[0.05] backdrop-blur-md border-white/[0.1]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Reset password</CardTitle>
          <CardDescription className="text-center text-white/60">
            Enter your email address and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
