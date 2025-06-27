"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Calendar, TrendingUp, Award, BookOpen, Plus } from "lucide-react"
import Link from "next/link"

export default function ProgressPage() {
  const { user, isLoaded } = useUser()
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      // Simulate loading progress data
      setTimeout(() => {
        setProgressData([]) // Empty for new users
        setLoading(false)
      }, 1000)
    }
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Progress & Achievements</h1>
            <div className="flex space-x-4">
              <Button variant="outline" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Set Goals
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
              <div className="text-2xl font-bold">0/10</div>
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
            <CardDescription>Track your mindfulness journey with detailed insights and achievements</CardDescription>
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
      </div>
    </div>
  )
}
