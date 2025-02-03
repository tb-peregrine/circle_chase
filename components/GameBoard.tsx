'use client'

import { useState, useEffect } from 'react'
import Analytics from './Analytics'

interface GameBoardProps {
    username: string
    onLogout: () => void
}

export default function GameBoard({ username, onLogout }: GameBoardProps) {
    const [gameStarted, setGameStarted] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [activeCircle, setActiveCircle] = useState(Math.floor(Math.random() * 16))
    const [startTime, setStartTime] = useState<number | null>(null)
    const [endTime, setEndTime] = useState<number | null>(null)
    const [gameId, setGameId] = useState(`game_${Date.now()}`)
    const [showingResults, setShowingResults] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const TOTAL_CLICKS_NEEDED = 5 // This represents the clicks after game starts

    const sendClickData = async (correct: boolean) => {
        try {
            const clickData = {
                user_id: username,
                game_id: gameId,
                timestamp: new Date().toISOString(),
                correct_click: correct ? 1 : 0
            }

            await fetch(`${process.env.NEXT_PUBLIC_TINYBIRD_HOST}/v0/events?name=game_clicks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clickData)
            })
        } catch (error) {
            console.error('Error sending click data:', error)
        }
    }

    const handleCircleClick = async (index: number) => {
        const isCorrect = index === activeCircle

        if (!gameStarted) {
            if (isCorrect) {
                setGameStarted(true)
                setStartTime(Date.now())
                await sendClickData(true) // This is click #1
                moveGreenCircle()
            } else {
                await sendClickData(false)
            }
            return
        }

        await sendClickData(isCorrect)

        if (isCorrect) {
            const newClickCount = clickCount + 1
            setClickCount(newClickCount)

            if (newClickCount === TOTAL_CLICKS_NEEDED) { // This will be click #6 total (1 start + 5 game)
                const finalTime = Date.now()
                setEndTime(finalTime)
                setIsLoading(true)
                // Wait for data to be written to Tinybird
                setTimeout(() => {
                    setIsLoading(false)
                    setShowingResults(true)
                }, 2000)
            } else {
                moveGreenCircle()
            }
        }
    }

    const moveGreenCircle = () => {
        let newPosition
        do {
            newPosition = Math.floor(Math.random() * 16)
        } while (newPosition === activeCircle)
        setActiveCircle(newPosition)
    }

    const resetGame = () => {
        setGameStarted(false)
        setClickCount(0)
        setStartTime(null)
        setEndTime(null)
        setActiveCircle(Math.floor(Math.random() * 16))
        setGameId(`game_${Date.now()}`)
        setShowingResults(false)
        setIsLoading(false)
    }

    const handleLogout = () => {
        setGameStarted(false)
        setClickCount(0)
        setStartTime(null)
        setEndTime(null)
        setShowingResults(false)
        setIsLoading(false)
        onLogout()
    }

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-xl">Calculating results...</div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                </div>
            </div>
        )
    }

    if (showingResults && endTime && startTime) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
                <Analytics
                    username={username}
                    currentGameTime={(endTime - startTime) / 1000}
                />
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={resetGame}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Play New Game
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">
                Welcome, {username}!
            </h1>
            {!gameStarted && (
                <p className="mb-4">Click the green circle to start the game!</p>
            )}
            {gameStarted && (
                <p className="mb-4">Circles clicked: {clickCount}/{TOTAL_CLICKS_NEEDED}</p>
            )}

            <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 16 }).map((_, index) => (
                    <div
                        key={index}
                        onClick={() => handleCircleClick(index)}
                        className={`
                            w-16 h-16 rounded-full cursor-pointer transition-colors
                            ${index === activeCircle ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                    />
                ))}
            </div>
        </div>
    )
} 