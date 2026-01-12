import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Wait a moment for the session to be established
    const timer = setTimeout(() => {
      navigate('/app')
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
