"use client"

import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Heart, Mic, TrendingUp, Calendar, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <SignedOut>
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">MindfulJournal</span>
              </div>
              <div className="flex space-x-4">
                <SignInButton>
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Your Personal Space for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  Mindful Reflection
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Transform your thoughts into insights with AI-powered journaling, mood tracking, and personalized growth
                analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need for mindful growth
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to support your journey of self-discovery and emotional well-being.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>AI-Powered Prompts</CardTitle>
                  <CardDescription>
                    Get personalized writing prompts that adapt to your mood and journaling patterns.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Advanced AI analyzes your entries to provide insights into your emotional patterns and growth.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Mic className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Voice Journaling</CardTitle>
                  <CardDescription>
                    Express your thoughts naturally with voice-to-text powered by Google Speech Recognition.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-red-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Mood Tracking</CardTitle>
                  <CardDescription>
                    Track your emotional well-being over time with detailed mood analytics and visualizations.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-orange-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Progress Analytics</CardTitle>
                  <CardDescription>
                    Visualize your journaling journey with comprehensive analytics and achievement tracking.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>
                    Set up reminders and sync with Google Calendar to maintain your mindfulness practice.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to begin your mindfulness journey?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Join thousands of users who have transformed their mental well-being through mindful journaling.
              </p>
              <SignUpButton>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MindfulJournal</span>
              </div>
              <div className="text-gray-400">© 2024 MindfulJournal. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </SignedOut>

      <SignedIn>
        {/* Redirect to dashboard for signed-in users */}
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <BookOpen className="h-6 w-6 text-purple-600" />
                <span>Welcome Back!</span>
              </CardTitle>
              <CardDescription>Ready to continue your mindfulness journey?</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard">
                <Button className="bg-purple-600 hover:bg-purple-700 w-full">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </div>
  )
}
