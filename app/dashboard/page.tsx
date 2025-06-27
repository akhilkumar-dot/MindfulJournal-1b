"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Heart, TrendingUp, Sparkles, Plus, Calendar, Flame, RefreshCw } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface UserStats {
  total_entries: number
  avg_mood: number
  current_streak: number
  total_words: number
  avg_words_per_entry: number
  recent_avg_mood: number
  month_entries: number
  mood_trend: Array<{ date: string; avg_mood: number }>
}

interface JournalEntry {
  id: number
  title: string
  content: string
  mood_score: number
  created_at: string
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  useEffect(() => {
    const syncUserAndFetchData = async () => {
      try {
        // Sync user with database
        await fetch("/api/user/sync", { method: "POST" })

        // Fetch user stats and recent entries
        const [statsResponse, entriesResponse, promptResponse] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/journal/entries?limit=3"),
          fetch("/api/prompts/generate"),
        ])

        if (statsResponse.ok) {
          const { stats } = await statsResponse.json()
          setStats(stats)
        }

        if (entriesResponse.ok) {
          const { entries } = await entriesResponse.json()
          setRecentEntries(entries)
        }

        if (promptResponse.ok) {
          const { prompt } = await promptResponse.json()
          setCurrentPrompt(prompt)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      syncUserAndFetchData()
    }
  }, [user])

  const generateNewPrompt = async () => {
    setIsGeneratingPrompt(true)
    try {
      const response = await fetch("/api/prompts/generate", { method: "POST" })
      if (response.ok) {
        const { prompt } = await response.json()
        setCurrentPrompt(prompt)
      }
    } catch (error) {
      console.error("Error generating new prompt:", error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const [statsResponse, entriesResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/journal/entries?limit=3"),
      ])

      if (statsResponse.ok) {
        const { stats } = await statsResponse.json()
        setStats(stats)
      }

      if (entriesResponse.ok) {
        const { entries } = await entriesResponse.json()
        setRecentEntries(entries)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData =
    stats?.mood_trend?.map((item, index) => ({
      day: `Day ${index + 1}`,
      mood: Number.parseFloat(item.avg_mood.toString()),
    })) || []

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName || "Friend"}!</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/journal/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            Welcome back, {user?.firstName || "Friend"}! ☀️
          </h2>
          <p className="text-gray-600">
            {stats?.current_streak > 0
              ? `You're on a ${stats.current_streak}-day journaling streak. Keep up the amazing work!`
              : "Ready to start your mindfulness journey today?"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Streak</CardTitle>
              <Flame className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.current_streak || 0} days</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.current_streak === 0 ? "Start your streak today!" : "+1 from yesterday"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.total_entries || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.total_entries > 0 ? `${stats.total_words || 0} total words` : "Start writing today"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Mood</CardTitle>
              <Heart className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.avg_mood ? `${Number.parseFloat(stats.avg_mood.toString()).toFixed(1)}/10` : "-"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.recent_avg_mood && stats.avg_mood
                  ? `${(stats.recent_avg_mood - stats.avg_mood).toFixed(1)} from last week`
                  : "Track your mood to see trends"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.month_entries || 0} entries</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.month_entries > 0 ? "Great progress!" : "Start your monthly goal"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Prompt Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Trend Chart */}
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <CardTitle>Mood Trend (Last 7 Days)</CardTitle>
              </div>
              <CardDescription>Track your emotional journey over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis
                        domain={[0, 10]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Start journaling to see your mood trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Prompt */}
          <Card className="bg-white border border-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 opacity-60"></div>

            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Today's Prompt</CardTitle>
                    <CardDescription className="text-sm text-gray-600">AI-generated just for you</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateNewPrompt}
                  disabled={isGeneratingPrompt}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingPrompt ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 shadow-sm">
                <blockquote className="text-gray-800 text-lg leading-relaxed font-medium">
                  "{currentPrompt || "Loading your personalized prompt..."}"
                </blockquote>
              </div>

              <Link href="/journal/new" className="block">
                <Button
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Writing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Entries</CardTitle>
                <Link href="/journal">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.content.substring(0, 100)}...</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(entry.created_at).toLocaleDateString()}</p>
                    </div>
                    {entry.mood_score && (
                      <div className="text-2xl">
                        {entry.mood_score >= 8
                          ? "😊"
                          : entry.mood_score >= 6
                            ? "🙂"
                            : entry.mood_score >= 4
                              ? "😐"
                              : "😔"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
