'use client'

import { useState } from 'react'

interface LoginScreenProps {
    onLogin: (username: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [username, setUsername] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (username.trim()) {
            onLogin(username.trim())
        }
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Welcome to Circle Chase!</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block mb-2">
                        Enter your username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Start Game
                </button>
            </form>
        </div>
    )
} 