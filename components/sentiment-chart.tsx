"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Heart } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface SentimentData {
  overall: "positive" | "neutral" | "negative"
  confidence: number
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
    disgust: number
  }
  keywords: string[]
}

interface SentimentChartProps {
  data: SentimentData[]
  timeframe?: string
}

export function SentimentChart({ data, timeframe = "Last 7 days" }: SentimentChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription>No sentiment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Start journaling to see your sentiment analysis</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate average emotions
  const avgEmotions = Object.keys(data[0].emotions).reduce(
    (acc, emotion) => {
      acc[emotion] =
        data.reduce((sum, entry) => sum + entry.emotions[emotion as keyof typeof entry.emotions], 0) / data.length
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare data for charts
  const emotionData = Object.entries(avgEmotions).map(([emotion, value]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: Math.round(value * 100),
    color: getEmotionColor(emotion),
  }))

  const sentimentDistribution = data.reduce(
    (acc, entry) => {
      acc[entry.overall] = (acc[entry.overall] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sentimentPieData = Object.entries(sentimentDistribution).map(([sentiment, count]) => ({
    name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    value: count,
    color: getSentimentColor(sentiment),
  }))

  // Get most common keywords
  const allKeywords = data.flatMap((entry) => entry.keywords)
  const keywordCounts = allKeywords.reduce(
    (acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data[data.length - 1]?.overall.charAt(0).toUpperCase() + data[data.length - 1]?.overall.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data[data.length - 1]?.confidence || 0) * 100)}% confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dominant Emotion</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emotionData.sort((a, b) => b.value - a.value)[0]?.emotion}</div>
            <p className="text-xs text-muted-foreground">
              {emotionData.sort((a, b) => b.value - a.value)[0]?.value}% intensity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">{timeframe}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emotion Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Breakdown</CardTitle>
            <CardDescription>Average emotional intensity in your entries</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={emotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Intensity"]} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall sentiment patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Emotion Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Emotion Analysis</CardTitle>
          <CardDescription>Breakdown of emotional patterns in your journal entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emotionData.map((emotion) => (
            <div key={emotion.emotion} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{emotion.emotion}</span>
                <span>{emotion.value}%</span>
              </div>
              <Progress value={emotion.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Themes</CardTitle>
          <CardDescription>Most frequently mentioned emotional themes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(([keyword, count]) => (
              <Badge key={keyword} variant="secondary" className="text-sm">
                {keyword} ({count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    joy: "#10b981",
    sadness: "#3b82f6",
    anger: "#ef4444",
    fear: "#f59e0b",
    surprise: "#8b5cf6",
    disgust: "#6b7280",
  }
  return colors[emotion] || "#8b5cf6"
}

function getSentimentColor(sentiment: string): string {
  const colors: Record<string, string> = {
    positive: "#10b981",
    neutral: "#6b7280",
    negative: "#ef4444",
  }
  return colors[sentiment] || "#6b7280"
}
