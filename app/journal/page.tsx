"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Calendar, Heart, FileText, Edit, Trash2, BookOpen } from "lucide-react"
import Link from "next/link"

interface JournalEntry {
  id: number
  title: string
  content: string
  mood_score: number
  word_count: number
  is_draft: boolean
  emotions: string[]
  created_at: string
  updated_at: string
}

export default function JournalPage() {
  const { user } = useUser()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [includeDrafts, setIncludeDrafts] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [includeDrafts])

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(searchTerm && { search: searchTerm }),
        ...(includeDrafts && { include_drafts: "true" }),
      })

      const response = await fetch(`/api/journal/entries?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      } else {
        console.error("Failed to fetch entries")
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    fetchEntries()
  }

  const handleDelete = async (entryId: number) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/journal/entries/${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter((entry) => entry.id !== entryId))
        alert("Entry deleted successfully!")
      } else {
        const errorData = await response.json()
        alert(`Failed to delete entry: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert("Failed to delete entry. Please try again.")
    }
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return "😊"
    if (score >= 6) return "🙂"
    if (score >= 4) return "😐"
    if (score >= 2) return "😔"
    return "😢"
  }

  const getMoodColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100"
    if (score >= 6) return "text-yellow-600 bg-yellow-100"
    if (score >= 4) return "text-orange-600 bg-orange-100"
    return "text-red-600 bg-red-100"
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Journal</h1>
        <Link href="/journal/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchTerm("")
                  fetchEntries()
                }}
              >
                Clear
              </Button>
            )}
          </form>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="include-drafts"
              checked={includeDrafts}
              onCheckedChange={(checked) => setIncludeDrafts(checked as boolean)}
            />
            <label htmlFor="include-drafts" className="text-sm font-medium">
              Include drafts
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{entries.filter((e) => !e.is_draft).length}</p>
                <p className="text-gray-600">Published Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{entries.filter((e) => e.is_draft).length}</p>
                <p className="text-gray-600">Draft Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {entries.length > 0
                    ? (entries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / entries.length).toFixed(1)
                    : "0"}
                </p>
                <p className="text-gray-600">Average Mood</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No entries found" : "No journal entries yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Start your mindfulness journey by creating your first entry"}
              </p>
              {!searchTerm && (
                <Link href="/journal/new">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className={`hover:shadow-md transition-shadow ${entry.is_draft ? "border-orange-200 bg-orange-50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      {entry.is_draft && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(entry.created_at)}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {entry.word_count} words
                      </span>
                      {entry.mood_score && (
                        <span className="flex items-center">
                          <span className="mr-1">{getMoodEmoji(entry.mood_score)}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood_score)}`}
                          >
                            {entry.mood_score}/10
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/journal/edit/${entry.id}`}>
                      <Button variant="ghost" size="sm" title="Edit entry">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {entry.content.substring(0, 200)}
                  {entry.content.length > 200 && "..."}
                </p>
                {entry.emotions && entry.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.emotions.map((emotion, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
