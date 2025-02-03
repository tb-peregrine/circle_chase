'use client'

import { useEffect, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface UserStats {
    user_id: string
    avg_game_duration_seconds: number
    best_game_duration_seconds: number
    avg_click_time_seconds: number
    completed_games: number
}

interface LeaderboardEntry {
    user_id: string
    best_time_ms: number
    games_completed: number
    avg_time_ms: number
}

interface AnalyticsProps {
    username: string
    currentGameTime: number
}

export default function Analytics({ username, currentGameTime }: AnalyticsProps) {
    const [userStats, setUserStats] = useState<UserStats | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, leaderboardResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_TINYBIRD_HOST}/v0/pipes/user_stats.json?user_id=${username}`, {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`
                        }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_TINYBIRD_HOST}/v0/pipes/leaderboard.json`, {
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`
                        }
                    })
                ])

                const statsData = await statsResponse.json()
                const leaderboardData = await leaderboardResponse.json()

                setUserStats(statsData.data[0])
                setLeaderboard(leaderboardData.data)
            } catch (error) {
                console.error('Error fetching analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [username])

    if (loading) {
        return <div>Loading analytics...</div>
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Your Performance</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Current Game</p>
                        <p className="text-2xl font-bold">{currentGameTime.toFixed(2)}s</p>
                        <p className="text-xs text-gray-500">for 6 clicks total</p>
                    </div>
                    {userStats && (
                        <>
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Best Time</p>
                                <p className="text-2xl font-bold">{userStats.best_game_duration_seconds}s</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Average Time</p>
                                <p className="text-2xl font-bold">{userStats.avg_game_duration_seconds}s</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Games Completed</p>
                                <p className="text-2xl font-bold">{userStats.completed_games}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={leaderboard.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                label={{
                                    value: 'Time (seconds)',
                                    position: 'bottom',
                                    offset: 0
                                }}
                                tickFormatter={(value) => (value / 1000).toFixed(2)}
                            />
                            <YAxis
                                type="category"
                                dataKey="user_id"
                                width={100}
                            />
                            <Tooltip
                                formatter={(value: number) => `${(value / 1000).toFixed(2)}s`}
                                labelStyle={{ color: 'black' }}
                            />
                            <Bar
                                dataKey="best_time_ms"
                                fill="#82ca9d"
                                name="Best Time"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
} 