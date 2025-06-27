"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bell, Shield, Save, Eye, EyeOff, Mic } from "lucide-react"
import { CalendarIntegration } from "@/components/calendar-integration"

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    moodInsights: false,
    sentimentAlerts: true,
  })
  const [privacy, setPrivacy] = useState({
    dataEncryption: true,
    analyticsOptOut: false,
    shareProgress: false,
    voiceDataRetention: false,
  })
  const [voiceSettings, setVoiceSettings] = useState({
    autoTranscribe: true,
    language: "en-US",
    noiseReduction: true,
    saveRecordings: false,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="voice">Voice & AI</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Sarah" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Johnson" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="sarah@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself and your mindfulness journey..."
                    defaultValue="I'm passionate about mindfulness and personal growth. Journaling has become an essential part of my daily routine."
                  />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Journaling Reminder</Label>
                    <p className="text-sm text-muted-foreground">Get reminded to write in your journal each day</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReminder}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, dailyReminder: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Progress Report</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a summary of your week's journaling activity
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReport: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when you unlock new achievements</p>
                  </div>
                  <Switch
                    checked={notifications.achievements}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, achievements: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mood Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive AI-generated insights about your mood patterns
                    </p>
                  </div>
                  <Switch
                    checked={notifications.moodInsights}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, moodInsights: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sentiment Analysis Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about significant changes in your emotional patterns
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sentimentAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sentimentAlerts: checked }))}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reminder Time</Label>
                      <Select defaultValue="19:00">
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="19:00">7:00 PM</SelectItem>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Control how your data is handled and protected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>End-to-End Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt your journal entries for maximum security</p>
                  </div>
                  <Switch
                    checked={privacy.dataEncryption}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, dataEncryption: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Opt Out of Analytics</Label>
                    <p className="text-sm text-muted-foreground">Stop sharing your data with analytics services</p>
                  </div>
                  <Switch
                    checked={privacy.analyticsOptOut}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, analyticsOptOut: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Progress</Label>
                    <p className="text-sm text-muted-foreground">Allow others to view your progress</p>
                  </div>
                  <Switch
                    checked={privacy.shareProgress}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, shareProgress: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Voice Data Retention</Label>
                    <p className="text-sm text-muted-foreground">Keep voice recordings after transcription</p>
                  </div>
                  <Switch
                    checked={privacy.voiceDataRetention}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, voiceDataRetention: checked }))}
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice & AI Settings
                </CardTitle>
                <CardDescription>Configure voice input and AI analysis preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Transcribe Voice Input</Label>
                    <p className="text-sm text-muted-foreground">Automatically convert speech to text</p>
                  </div>
                  <Switch
                    checked={voiceSettings.autoTranscribe}
                    onCheckedChange={(checked) => setVoiceSettings((prev) => ({ ...prev, autoTranscribe: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Voice Recognition Language</Label>
                  <Select
                    value={voiceSettings.language}
                    onValueChange={(value) => setVoiceSettings((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="it-IT">Italian</SelectItem>
                      <SelectItem value="pt-BR">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Noise Reduction</Label>
                    <p className="text-sm text-muted-foreground">Reduce background noise during recording</p>
                  </div>
                  <Switch
                    checked={voiceSettings.noiseReduction}
                    onCheckedChange={(checked) => setVoiceSettings((prev) => ({ ...prev, noiseReduction: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Save Voice Recordings</Label>
                    <p className="text-sm text-muted-foreground">Keep audio files after transcription</p>
                  </div>
                  <Switch
                    checked={voiceSettings.saveRecordings}
                    onCheckedChange={(checked) => setVoiceSettings((prev) => ({ ...prev, saveRecordings: checked }))}
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Voice Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Preferences</CardTitle>
                <CardDescription>Control how AI analyzes your journal entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sentiment Analysis Frequency</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic (after 50+ words)</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                      <SelectItem value="always">Every entry</SelectItem>
                      <SelectItem value="never">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>AI Feedback Style</Label>
                  <Select defaultValue="supportive">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                      <SelectItem value="analytical">Analytical & Detailed</SelectItem>
                      <SelectItem value="brief">Brief & Concise</SelectItem>
                      <SelectItem value="questions">Question-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
