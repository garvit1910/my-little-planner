import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'

export function AuthHeader() {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.1]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <Zap className="h-6 w-6 text-white" />
          <span className="text-xl font-bold text-white">Presto AI</span>
        </div>

        {/* Home Button */}
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>
    </header>
  )
}
