import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Loader2 } from 'lucide-react'
import { AuthHeader } from './AuthHeader'

export function LoginForm() {
  const navigate = useNavigate()
  const { signIn, signInWithGitHub } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app')
    } catch (error) {
      // Error is handled in AuthContext with toast
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setGithubLoading(true)
    try {
      await signInWithGitHub()
      // Redirect happens automatically via OAuth flow
    } catch (error) {
      // Error is handled in AuthContext with toast
      setGithubLoading(false)
    }
  }

  return (
    <>
      <AuthHeader />
      <div className="flex min-h-screen items-center justify-center bg-black p-4 pt-24">
        <Card className="w-full max-w-md bg-white/[0.05] backdrop-blur-md border-white/[0.1]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome back</CardTitle>
          <CardDescription className="text-center text-white/60">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-white/60">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={githubLoading || loading}
          >
            {githubLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-white/60">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-indigo-400 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  )
}
