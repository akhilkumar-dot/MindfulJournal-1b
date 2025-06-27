"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, TrendingUp, BarChart3, Activity, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface MoodData {
  id: number
  mood_score: number
  energy_level?: number
  stress_level?: number
  notes?: string
  created_at: string
}

interface MoodStats {
  current_mood: number
  avg_mood: number
  mood_trend: string
  total_logs: number
  mood_distribution: Array<{ mood: string; count: number; color: string }>
  weekly_trend: Array<{ day: string; mood: number; energy: number; stress: number }>
}

export default function MoodTrackingPage() {
  const { user, isLoaded } = useUser()
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  const fetchMoodData = async () => {
    try {
      setLoading(true)

      // Sync user first
      await fetch("/api/user/sync", { method: "POST" })

      // Fetch mood data and journal entries with mood scores
      const [moodResponse, entriesResponse] = await Promise.all([
        fetch(`/api/mood?days=${timeRange}`),
        fetch(`/api/journal/entries?includeMood=true&limit=100`),
      ])

      let allMoodData: MoodData[] = []

      if (moodResponse.ok) {
        const { moodLogs } = await moodResponse.json()
        allMoodData = [...allMoodData, ...moodLogs]
      }

      if (entriesResponse.ok) {
        const { entries } = await entriesResponse.json()
        const entriesWithMood = entries
          .filter((entry: any) => entry.mood_score)
          .map((entry: any) => ({
            id: entry.id,
            mood_score: entry.mood_score,
            created_at: entry.created_at,
            notes: entry.title,
          }))
        allMoodData = [...allMoodData, ...entriesWithMood]
      }

      // Sort by date
      allMoodData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setMoodData(allMoodData)
      calculateMoodStats(allMoodData)
    } catch (error) {
      console.error("Error fetching mood data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMoodStats = (data: MoodData[]) => {
    if (data.length === 0) {
      setMoodStats(null)
      return
    }

    const avgMood = data.reduce((sum, item) => sum + item.mood_score, 0) / data.length
    const currentMood = data[0]?.mood_score || 0

    // Calculate trend
    const recentData = data.slice(0, Math.min(7, data.length))
    const olderData = data.slice(7, Math.min(14, data.length))
    const recentAvg = recentData.reduce((sum, item) => sum + item.mood_score, 0) / recentData.length
    const olderAvg =
      olderData.length > 0 ? olderData.reduce((sum, item) => sum + item.mood_score, 0) / olderData.length : recentAvg

    let trend = "stable"
    if (recentAvg > olderAvg + 0.5) trend = "improving"
    else if (recentAvg < olderAvg - 0.5) trend = "declining"

    // Mood distribution
    const distribution = [
      { mood: "Very Low (1-2)", count: 0, color: "#ef4444" },
      { mood: "Low (3-4)", count: 0, color: "#f97316" },
      { mood: "Neutral (5-6)", count: 0, color: "#eab308" },
      { mood: "Good (7-8)", count: 0, color: "#22c55e" },
      { mood: "Excellent (9-10)", count: 0, color: "#10b981" },
    ]

    data.forEach((item) => {
      if (item.mood_score <= 2) distribution[0].count++
      else if (item.mood_score <= 4) distribution[1].count++
      else if (item.mood_score <= 6) distribution[2].count++
      else if (item.mood_score <= 8) distribution[3].count++
      else distribution[4].count++
    })

    // Weekly trend
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const weeklyTrend = last7Days.map((date) => {
      const dayData = data.filter((item) => item.created_at.split("T")[0] === date)
      const avgMood = dayData.length > 0 ? dayData.reduce((sum, item) => sum + item.mood_score, 0) / dayData.length : 0
      const avgEnergy =
        dayData.length > 0 ? dayData.reduce((sum, item) => sum + (item.energy_level || 5), 0) / dayData.length : 0
      const avgStress =
        dayData.length > 0 ? dayData.reduce((sum, item) => sum + (item.stress_level || 5), 0) / dayData.length : 0

      return {
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        mood: Math.round(avgMood * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        stress: Math.round(avgStress * 10) / 10,
      }
    })

    setMoodStats({
      current_mood: currentMood,
      avg_mood: Math.round(avgMood * 10) / 10,
      mood_trend: trend,
      total_logs: data.length,
      mood_distribution: distribution,
      weekly_trend: weeklyTrend,
    })
  }

  useEffect(() => {
    if (isLoaded && user) {
      fetchMoodData()
    }
  }, [isLoaded, user, timeRange])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return "😄"
    if (score >= 7) return "😊"
    if (score >= 5) return "🙂"
    if (score >= 3) return "😐"
    return "😔"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      default:
        return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracking</h1>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={fetchMoodData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Link href="/journal/new">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {moodData.length > 0 && moodStats ? (
          <>
            {/* Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    {moodStats.current_mood}/10 {getMoodEmoji(moodStats.current_mood)}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest entry</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{moodStats.avg_mood}/10</div>
                  <p className="text-xs text-muted-foreground">Over {timeRange} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
                  {getTrendIcon(moodStats.mood_trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{moodStats.mood_trend}</div>
                  <p className="text-xs text-muted-foreground">Recent trend</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                  <Activity className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{moodStats.total_logs}</div>
                  <p className="text-xs text-muted-foreground">Mood entries</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Weekly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Trend</CardTitle>
                  <CardDescription>Your mood patterns over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodStats.weekly_trend}>
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 10]} />
                        <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Mood Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>How often you experience different mood levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodStats.mood_distribution.filter((item) => item.count > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          label={({ mood, count }) => `${mood}: ${count}`}
                        >
                          {moodStats.mood_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Mood Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
                <CardDescription>Your latest mood tracking data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodData.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{getMoodEmoji(entry.mood_score)}</div>
                        <div>
                          <div className="font-medium">Mood: {entry.mood_score}/10</div>
                          {entry.notes && <div className="text-sm text-gray-600">{entry.notes}</div>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(entry.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Empty state
          <>
            {/* Empty Stats Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Mood</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">No mood data yet</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Start tracking to see trends</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mood Trend</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">No trend data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tracking Days</CardTitle>
                  <Activity className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Days tracked</p>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Start Tracking Your Mood
                </CardTitle>
                <CardDescription>
                  Begin your emotional wellness journey by recording your first mood entry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="flex justify-center space-x-2 mb-4">
                      <span className="text-4xl">😢</span>
                      <span className="text-4xl">😐</span>
                      <span className="text-4xl">🙂</span>
                      <span className="text-4xl">😊</span>
                      <span className="text-4xl">😄</span>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Track your daily emotions to discover patterns, understand triggers, and celebrate your growth.
                    </p>
                  </div>
                  <Link href="/journal/new">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                      <Plus className="h-5 w-5 mr-2" />
                      Record Your First Mood
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle>Why Track Your Mood?</CardTitle>
                <CardDescription>Discover the benefits of consistent mood tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Identify Patterns</h3>
                    <p className="text-sm text-gray-600">
                      Discover what activities, people, or situations affect your mood most.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Track Progress</h3>
                    <p className="text-sm text-gray-600">
                      See your emotional growth over time with detailed charts and insights.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Improve Wellbeing</h3>
                    <p className="text-sm text-gray-600">
                      Use insights to make positive changes and enhance your mental health.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
