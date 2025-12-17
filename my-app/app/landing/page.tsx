"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Brain,
  Globe,
  BotMessageSquare,
  Check,
  Calendar,
  TrendingUp,
  Zap,
  Shield
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted ? (theme === "dark" || resolvedTheme === "dark") : false

  const features = [
    {
      icon: <BotMessageSquare className="h-6 w-6" />,
      title: "AI-Powered Planning",
      description: "Chat with our AI assistant to create personalized itineraries in seconds using Yelp data.",
      color: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative Groups",
      description: "Plan trips together with friends and family. Share wishes, vote on places, and build consensus.",
      color: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Social Discovery",
      description: "Explore itineraries shared by the community. Like, comment, and save your favorites.",
      color: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Smart Organization",
      description: "Keep all your trips organized. Track drafts, published plans, and favorites in one place.",
      color: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Interactive Maps",
      description: "Visualize your journey with beautiful maps showing all your stops and routes.",
      color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track your travel planning activity with personalized insights and statistics.",
      color: "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
    }
  ]

  const benefits = [
    "Powered by Yelp's extensive business database",
    "AI-generated itineraries with real places",
    "Collaborative planning with friends",
    "Beautiful, intuitive interface",
    "Dark mode support",
    "Real-time map visualization"
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">The Odyssey Yelp</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl relative py-20 md:py-32 px-4">
        <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
          <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-primary/20 dark:to-primary/5" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Zap className="mr-1 h-3 w-3" />
            Powered by Yelp AI & Google Gemini
          </Badge>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Plan Your Perfect Trip
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              With AI Magic
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            Discover amazing places, create detailed itineraries, and collaborate with friends.
            Powered by Yelp&apos;s extensive database and cutting-edge AI.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 text-lg px-8 py-6" asChild>
              <Link href="/signup">
                <Sparkles className="h-5 w-5" />
                Start Planning Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            ✨ No credit card required • 🚀 Get started in 30 seconds
          </p>
        </div>
      </section>

      {/* Screenshot Showcase */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-2xl border bg-card p-2 shadow-2xl">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Image
                src={isDark ? "/app_dashboard_dark.png" : "/app_dashboard_light.png"}
                alt="The Odyssey Yelp Dashboard"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="mb-4 text-4xl font-bold">Everything You Need to Plan</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From AI-powered suggestions to collaborative planning, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Grid */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge variant="secondary" className="mb-4">App Preview</Badge>
            <h2 className="mb-4 text-4xl font-bold">Beautiful Interface</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience seamless travel planning with our intuitive design
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Chat Page */}
            <div className="group relative overflow-hidden rounded-xl border-2 bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src={isDark ? "/chat_page_dark.png" : "/chat_page_light.png"}
                  alt="AI Chat Interface"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold">AI Chat Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Natural conversation with AI to build your perfect itinerary
                </p>
              </div>
            </div>

            {/* Explore Page */}
            <div className="group relative overflow-hidden rounded-xl border-2 bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src={isDark ? "/explore_page_dark.png" : "/explore_page_light.png"}
                  alt="Explore Community"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Explore & Discover</h3>
                <p className="text-sm text-muted-foreground">
                  Browse community-shared itineraries and find inspiration
                </p>
              </div>
            </div>

            {/* My Space Page */}
            <div className="group relative overflow-hidden rounded-xl border-2 bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src={isDark ? "/my_space_page_dark.png" : "/my_space_page_light.png"}
                  alt="My Space Dashboard"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold">My Space</h3>
                <p className="text-sm text-muted-foreground">
                  Organize and manage all your travel plans in one place
                </p>
              </div>
            </div>

            {/* Groups Page */}
            <div className="group relative overflow-hidden rounded-xl border-2 bg-card shadow-lg transition-all hover:border-primary/50 hover:shadow-2xl">
              <div className="aspect-video relative">
                <Image
                  src={isDark ? "/group_page_dark.png" : "/group_page_light.png"}
                  alt="Group Planning"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold">Collaborative Groups</h3>
                <p className="text-sm text-muted-foreground">
                  Plan trips together with friends and family seamlessly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-10">
              <div className="mb-8 text-center">
                <Badge variant="secondary" className="mb-4">
                  <Shield className="mr-1 h-3 w-3" />
                  Why Choose Us
                </Badge>
                <h2 className="mb-4 text-3xl font-bold">Built for Travel Enthusiasts</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />

          <div className="relative">
            <Badge variant="secondary" className="mb-6">
              <Calendar className="mr-1 h-3 w-3" />
              Ready to start your journey?
            </Badge>

            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Start Planning Your Next Adventure
            </h2>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              Join thousands of travelers using AI to discover amazing places and create unforgettable experiences.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/signup">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              🎉 No credit card required • ⚡ Setup takes less than a minute
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto max-w-7xl border-t py-12 px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-semibold">The Odyssey Yelp</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2025 The Odyssey Yelp. Powered by Yelp & Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  )
}

