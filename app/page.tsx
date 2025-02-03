'use client'

import { useState } from 'react'
import LoginScreen from '@/components/LoginScreen'
import GameBoard from '@/components/GameBoard'

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  const handleLogin = (name: string) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUsername('')
    setIsLoggedIn(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <GameBoard username={username} onLogout={handleLogout} />
      )}
    </main>
  )
}
