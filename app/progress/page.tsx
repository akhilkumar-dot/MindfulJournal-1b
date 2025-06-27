"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, TrendingUp, Award, BookOpen, Plus, RefreshCw, Flame, Star } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface ProgressStats {
  current_streak: number
  longest_streak: number
  total_entries: number
  total_words: number
  avg_words_per_entry: number
  completion_rate: number
  achievements_unlocked: number
  days_journaled: number
  first_entry_date: string
  monthly_progress: Array<{ month: string; entries: number; words: number }>
  weekly_activity: Array<{ day: string; entries: number }>
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
  category: string
}

export default function ProgressPage() {
  const { user, isLoaded } = useUser()
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProgressData = async () => {
    try {
      setLoading(true)

      // Sync user first
      await fetch("/api/user/sync", { method: "POST" })

      // Fetch stats and entries
      const [statsResponse, entriesResponse] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/journal/entries?limit=1000"),
      ])

      if (statsResponse.ok && entriesResponse.ok) {
        const { stats } = await statsResponse.json()
        const { entries } = await entriesResponse.json()

        calculateProgressStats(stats, entries)
        calculateAchievements(stats, entries)
      }
    } catch (error) {
      console.error("Error fetching progress data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProgressStats = (stats: any, entries: any[]) => {
    // Calculate monthly progress
    const monthlyData: { [key: string]: { entries: number; words: number } } = {}
    const weeklyData: { [key: string]: number } = {}

    entries.forEach((entry) => {
      const date = new Date(entry.created_at)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      const dayKey = date.toLocaleDateString("en-US", { weekday: "short" })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entries: 0, words: 0 }
      }
      monthlyData[monthKey].entries++
      monthlyData[monthKey].words += entry.word_count || 0

      weeklyData[dayKey] = (weeklyData[dayKey] || 0) + 1
    })

    const monthlyProgress = Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6) // Last 6 months

    const weeklyActivity = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      entries: weeklyData[day] || 0,
    }))

    // Calculate completion rate (entries this month vs days in month)
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const entriesThisMonth = entries.filter((entry) => {
      const entryDate = new Date(entry.created_at)
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
    }).length

    const completionRate = Math.round((entriesThisMonth / daysInMonth) * 100)

    // Calculate longest streak
    const sortedEntries = entries
      .map((entry) => new Date(entry.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    let longestStreak = 0
    let currentStreakCalc = 1

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1])
      const currDate = new Date(sortedEntries[i])
      const diffTime = currDate.getTime() - prevDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentStreakCalc++
      } else {
        longestStreak = Math.max(longestStreak, currentStreakCalc)
        currentStreakCalc = 1
      }
    }
    longestStreak = Math.max(longestStreak, currentStreakCalc)

    setProgressStats({
      current_streak: stats.current_streak || 0,
      longest_streak: longestStreak,
      total_entries: stats.total_entries || 0,
      total_words: stats.total_words || 0,
      avg_words_per_entry: stats.avg_words_per_entry || 0,
      completion_rate: completionRate,
      achievements_unlocked: 0, // Will be calculated in achievements
      days_journaled: sortedEntries.length,
      first_entry_date: entries.length > 0 ? entries[entries.length - 1].created_at : "",
      monthly_progress: monthlyProgress,
      weekly_activity: weeklyActivity,
    })
  }

  const calculateAchievements = (stats: any, entries: any[]) => {
    const totalEntries = stats.total_entries || 0
    const currentStreak = stats.current_streak || 0
    const totalWords = stats.total_words || 0

    const achievementsList: Achievement[] = [
      {
        id: "first_entry",
        title: "First Steps",
        description: "Write your first journal entry",
        icon: "✍️",
        unlocked: totalEntries >= 1,
        progress: Math.min(totalEntries, 1),
        target: 1,
        category: "Writing",
      },
      {
        id: "week_warrior",
        title: "Week Warrior",
        description: "Maintain a 7-day journaling streak",
        icon: "🔥",
        unlocked: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        target: 7,
        category: "Consistency",
      },
      {
        id: "reflection_rookie",
        title: "Reflection Rookie",
        description: "Write 10 journal entries",
        icon: "📝",
        unlocked: totalEntries >= 10,
        progress: Math.min(totalEntries, 10),
        target: 10,
        category: "Writing",
      },
      {
        id: "month_master",
        title: "Month Master",
        description: "Journal for 30 consecutive days",
        icon: "🏆",
        unlocked: currentStreak >= 30,
        progress: Math.min(currentStreak, 30),
        target: 30,
        category: "Consistency",
      },
      {
        id: "wordsmith",
        title: "Wordsmith",
        description: "Write 10,000 total words",
        icon: "📚",
        unlocked: totalWords >= 10000,
        progress: Math.min(totalWords, 10000),
        target: 10000,
        category: "Writing",
      },
      {
        id: "century_club",
        title: "Century Club",
        description: "Write 100 journal entries",
        icon: "💯",
        unlocked: totalEntries >= 100,
        progress: Math.min(totalEntries, 100),
        target: 100,
        category: "Milestone",
      },
    ]

    const unlockedCount = achievementsList.filter((a) => a.unlocked).length
    setAchievements(achievementsList)

    // Update achievements count in progress stats
    if (progressStats) {
      setProgressStats((prev) => (prev ? { ...prev, achievements_unlocked: unlockedCount } : null))
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      fetchProgressData()
    }
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case "Writing":
        return <BookOpen className="h-4 w-4" />
      case "Consistency":
        return <Flame className="h-4 w-4" />
      case "Milestone":
        return <Trophy className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Progress & Achievements</h1>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={fetchProgressData}>
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {progressStats && progressStats.total_entries > 0 ? (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats.current_streak} days</div>
                  <p className="text-xs text-muted-foreground">Longest: {progressStats.longest_streak} days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats.total_entries}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(progressStats.avg_words_per_entry)} avg words
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressStats.completion_rate}%</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {achievements.filter((a) => a.unlocked).length}/{achievements.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Unlocked</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Monthly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Your journaling activity over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressStats.monthly_progress}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Bar dataKey="entries" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Activity Pattern</CardTitle>
                  <CardDescription>Which days you journal most often</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressStats.weekly_activity}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Bar dataKey="entries" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Achievements
                </CardTitle>
                <CardDescription>Track your milestones and unlock new achievements as you progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className={`p-1 rounded ${achievement.unlocked ? "bg-green-100" : "bg-gray-100"}`}>
                            {getAchievementIcon(achievement.category)}
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <div className="text-green-600">
                            <Award className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <h3 className={`font-semibold mb-1 ${achievement.unlocked ? "text-green-800" : "text-gray-700"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.target}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.target) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journey Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Journaling Journey</CardTitle>
                <CardDescription>A summary of your mindfulness practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{progressStats.days_journaled}</div>
                    <p className="text-sm text-gray-600">Days Journaled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(progressStats.total_words / 1000)}K
                    </div>
                    <p className="text-sm text-gray-600">Words Written</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {progressStats.first_entry_date
                        ? Math.ceil(
                            (new Date().getTime() - new Date(progressStats.first_entry_date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )
                        : 0}
                    </div>
                    <p className="text-sm text-gray-600">Days Since Start</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Empty state
          <>
            {/* Empty Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 days</div>
                  <p className="text-xs text-muted-foreground">Start your streak today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Write your first entry</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0/6</div>
                  <p className="text-xs text-muted-foreground">Unlocked</p>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Card */}
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Trophy className="h-5 w-5 mr-2" />
                  Begin Your Achievement Journey
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Start journaling to unlock achievements and track your personal growth milestones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                    <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">First Entry</h3>
                    <p className="text-xs text-gray-600">Complete your first journal entry</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Week Warrior</h3>
                    <p className="text-xs text-gray-600">Maintain a 7-day streak</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                    <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-sm">Reflection Rookie</h3>
                    <p className="text-xs text-gray-600">Write 10 journal entries</p>
                  </div>
                </div>
                <Link href="/journal/new">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Start Your Journey
                    <Plus className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Empty State for Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress Story</CardTitle>
                <CardDescription>
                  Track your mindfulness journey with detailed insights and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Data Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Your progress charts, achievement timeline, and growth insights will appear here as you continue
                      journaling.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Track Your Streaks</h4>
                      <p className="text-sm text-gray-600">
                        See your consistency improve with daily journaling streaks and milestone celebrations.
                      </p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Unlock Achievements</h4>
                      <p className="text-sm text-gray-600">
                        Earn badges and rewards as you reach personal growth milestones and journaling goals.
                      </p>
                    </div>
                  </div>

                  <Link href="/journal/new">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Start Building Progress
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
