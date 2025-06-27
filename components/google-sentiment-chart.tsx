"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Heart, Brain } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"

interface GoogleSentimentData {
  documentSentiment: {
    magnitude: number
    score: number
  }
  sentences: Array<{
    text: {
      content: string
      beginOffset: number
    }
    sentiment: {
      magnitude: number
      score: number
    }
  }>
  entities: Array<{
    name: string
    type: string
    salience: number
    sentiment: {
      magnitude: number
      score: number
    }
  }>
  language: string
  date?: string
}

interface GoogleSentimentChartProps {
  data: GoogleSentimentData[]
  timeframe?: string
}

export function GoogleSentimentChart({ data, timeframe = "Last 7 days" }: GoogleSentimentChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Google Sentiment Analysis
          </CardTitle>
          <CardDescription>No sentiment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Start journaling to see your sentiment analysis</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate averages
  const avgScore = data.reduce((sum, entry) => sum + entry.documentSentiment.score, 0) / data.length
  const avgMagnitude = data.reduce((sum, entry) => sum + entry.documentSentiment.magnitude, 0) / data.length

  // Prepare data for charts
  const sentimentTrend = data.map((entry, index) => ({
    date: entry.date || `Day ${index + 1}`,
    score: entry.documentSentiment.score,
    magnitude: entry.documentSentiment.magnitude,
  }))

  // Sentiment distribution
  const sentimentDistribution = data.reduce(
    (acc, entry) => {
      if (entry.documentSentiment.score > 0.1) acc.positive++
      else if (entry.documentSentiment.score < -0.1) acc.negative++
      else acc.neutral++
      return acc
    },
    { positive: 0, neutral: 0, negative: 0 },
  )

  const distributionData = [
    { name: "Positive", value: sentimentDistribution.positive, color: "#10b981" },
    { name: "Neutral", value: sentimentDistribution.neutral, color: "#6b7280" },
    { name: "Negative", value: sentimentDistribution.negative, color: "#ef4444" },
  ]

  // Entity analysis
  const allEntities = data.flatMap((entry) => entry.entities || [])
  const entityCounts = allEntities.reduce(
    (acc, entity) => {
      acc[entity.name] = (acc[entity.name] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topEntities = Object.entries(entityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return "Positive"
    if (score < -0.1) return "Negative"
    return "Neutral"
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return "text-green-600 bg-green-50 border-green-200"
    if (score < -0.1) return "text-red-600 bg-red-50 border-red-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sentiment</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSentimentLabel(avgScore)}</div>
            <p className="text-xs text-muted-foreground">Score: {avgScore.toFixed(3)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emotional Intensity</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMagnitude.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average magnitude</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Language</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data[0]?.language?.toUpperCase() || "EN"}</div>
            <p className="text-xs text-muted-foreground">Detected language</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend</CardTitle>
            <CardDescription>Your emotional journey over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[-1, 1]} />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(3) : value,
                    name === "score" ? "Sentiment Score" : "Magnitude",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="magnitude"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall emotional patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Google Natural Language Analysis</CardTitle>
          <CardDescription>Advanced insights powered by Google's AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Sentiment Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sentiment Score</span>
                    <span>{avgScore.toFixed(3)}</span>
                  </div>
                  <Progress value={((avgScore + 1) / 2) * 100} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Range: -1.0 (negative) to 1.0 (positive)</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emotional Magnitude</span>
                    <span>{avgMagnitude.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(avgMagnitude * 25, 100)} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Indicates emotional intensity (0.0 to 4.0+)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Distribution Summary</h4>
              <div className="space-y-2">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="secondary">
                      {item.value} entries ({((item.value / data.length) * 100).toFixed(0)}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Analysis */}
      {topEntities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Entities & Themes</CardTitle>
            <CardDescription>Important topics and concepts identified by Google's entity recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Most Mentioned Entities</h4>
                <div className="space-y-2">
                  {topEntities.map((entity, index) => (
                    <div key={entity.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{entity.name}</span>
                      <Badge variant="secondary">{entity.count} mentions</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Entity Frequency</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topEntities.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google AI Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Google AI Insights</CardTitle>
          <CardDescription>Powered by Google's Natural Language Understanding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Analysis Features</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Document-level sentiment scoring</li>
                <li>• Sentence-by-sentence analysis</li>
                <li>• Entity recognition and sentiment</li>
                <li>• Language detection</li>
                <li>• Emotional magnitude measurement</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Understanding Your Data</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Positive scores indicate optimistic content</li>
                <li>• Higher magnitude shows stronger emotions</li>
                <li>• Entity analysis reveals key themes</li>
                <li>• Sentence analysis shows emotional flow</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
