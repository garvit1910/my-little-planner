import { useState, useEffect } from 'react'

type PresetType = '25-5' | '50-10' | '90-20' | '15-3' | 'custom'

export function usePomodoroSettings() {
  const [favoritePresets, setFavoritePresets] = useState<PresetType[]>([])
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('pomodoro_favorites')
    if (saved) {
      setFavoritePresets(JSON.parse(saved))
    }

    const autoApply = localStorage.getItem('pomodoro_auto_apply')
    setAutoApplyEnabled(autoApply === 'true')
  }, [])

  const saveFavorite = (preset: PresetType) => {
    const updated = [...favoritePresets, preset]
    setFavoritePresets(updated)
    localStorage.setItem('pomodoro_favorites', JSON.stringify(updated))
  }

  const removeFavorite = (preset: PresetType) => {
    const updated = favoritePresets.filter(p => p !== preset)
    setFavoritePresets(updated)
    localStorage.setItem('pomodoro_favorites', JSON.stringify(updated))
  }

  const toggleAutoApply = () => {
    const newValue = !autoApplyEnabled
    setAutoApplyEnabled(newValue)
    localStorage.setItem('pomodoro_auto_apply', newValue.toString())
  }

  return { favoritePresets, saveFavorite, removeFavorite, autoApplyEnabled, toggleAutoApply }
}
