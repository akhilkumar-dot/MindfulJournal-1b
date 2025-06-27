"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, TrendingUp, Calendar, BarChart3, Activity, Plus } from "lucide-react"
import Link from "next/link"

export default function MoodTrackingPage() {
  const { user, isLoaded } = useUser()
  const [moodData, setMoodData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      // Simulate loading mood data
      setTimeout(() => {
        setMoodData([]) // Empty for new users
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
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracking</h1>
            <div className="flex space-x-4">
              <Button variant="outline" disabled>
                <Calendar className="h-4 w-4 mr-2" />
                Export Data
              </Button>
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
        {moodData.length > 0 ? (
          // Show mood tracking interface when data exists
          <div>
            {/* This would contain the full mood tracking interface */}
            <p>Mood tracking data would appear here...</p>
          </div>
        ) : (
          // Empty state for new users
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
