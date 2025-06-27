"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Download, Brain, Heart, Plus } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser()
  const [analyticsData, setAnalyticsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      // Simulate loading analytics data
      setTimeout(() => {
        setAnalyticsData([]) // Empty for new users
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
            <div className="flex space-x-4">
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export Report
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
        {/* Empty Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Sentiment Score</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">No data yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Entries</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Start writing to see trends</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emotional Balance</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">No analysis available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entries Analyzed</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started with Analytics */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Brain className="h-5 w-5 mr-2" />
              Unlock AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-blue-700">
              Start journaling to access advanced sentiment analysis, emotional patterns, and personalized insights
              powered by Google AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Sentiment Analysis</h3>
                <p className="text-xs text-gray-600">AI-powered emotional tone detection</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Pattern Recognition</h3>
                <p className="text-xs text-gray-600">Discover emotional trends over time</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Personalized Insights</h3>
                <p className="text-xs text-gray-600">Custom recommendations for growth</p>
              </div>
            </div>
            <Link href="/journal/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Start Generating Insights
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Empty State for Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Analytics Dashboard</CardTitle>
            <CardDescription>
              Advanced insights and patterns will appear here as you build your journaling practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Analytics Data Yet</h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Your personalized analytics dashboard will come to life as you write journal entries. We'll analyze
                  your emotional patterns, track sentiment trends, and provide AI-powered insights to support your
                  mindfulness journey.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                  <Brain className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-3">Google AI Analysis</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Advanced sentiment analysis using Google's Natural Language API to understand your emotional
                    patterns and provide meaningful insights.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Sentiment scoring and magnitude</li>
                    <li>• Entity recognition and themes</li>
                    <li>• Language sophistication tracking</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-lg mb-3">Growth Tracking</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Visualize your emotional journey with interactive charts, trend analysis, and personalized
                    recommendations for continued growth.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Mood trends and patterns</li>
                    <li>• Weekly and monthly insights</li>
                    <li>• Personalized recommendations</li>
                  </ul>
                </div>
              </div>

              <Link href="/journal/new">
                <Button className="bg-purple-600 hover:bg-purple-700 text-lg px-10 py-4">
                  <Brain className="h-5 w-5 mr-3" />
                  Start Your Analytics Journey
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
