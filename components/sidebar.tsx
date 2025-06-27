"use client"

import { useUser, SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, BookOpen, Heart, TrendingUp, Settings, Download, LogOut, Brain, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Entry", href: "/journal/new", icon: Plus },
  { name: "My Journal", href: "/journal", icon: BookOpen },
  { name: "Mood Tracking", href: "/mood", icon: Heart },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { user } = useUser()
  const pathname = usePathname()

  // Don't show sidebar on landing page
  if (pathname === "/") {
    return null
  }

  const handleExport = async () => {
    try {
      // Show loading state
      const exportButton = document.querySelector("[data-export-button]") as HTMLButtonElement
      if (exportButton) {
        exportButton.disabled = true
        exportButton.textContent = "Exporting..."
      }

      const response = await fetch("/api/journal/export", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Export failed")
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = "mindfulness-journal-export.json"

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Show success message
      alert("Your journal data has been exported successfully!")
    } catch (error) {
      console.error("Export failed:", error)
      alert(`Export failed: ${error instanceof Error ? error.message : "Please try again."}`)
    } finally {
      // Reset button state
      const exportButton = document.querySelector("[data-export-button]") as HTMLButtonElement
      if (exportButton) {
        exportButton.disabled = false
        exportButton.textContent = "Export Data"
      }
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MindfulJournal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start h-10 px-3 ${
                  isActive ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-9 px-3 text-gray-700 hover:bg-gray-100"
            onClick={handleExport}
            data-export-button
          >
            <Download className="h-4 w-4 mr-3" />
            Export Data
          </Button>

          <SignOutButton>
            <Button
              variant="ghost"
              className="w-full justify-start h-9 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}
