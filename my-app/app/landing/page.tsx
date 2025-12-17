"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HamsterLoader } from "@/components/ui/hamster-loader"
import {
  ArrowRight,
  Sparkles,
  MapPin,
  Users,
  Brain,
  Globe,
  BotMessageSquare,
  Check,
  Zap,
  Calendar
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Analytics Dashboard",
      description: "Track your travel planning with personalized insights",
      lightImage: "/app_dashboard_light.png",
      darkImage: "/app_dashboard_dark.png",
      details: [
        "Real-time statistics on your trips and favorites",
        "Personalized metrics showing published vs draft itineraries",
        "Group activity tracking and collaboration insights",
        "Tag performance analytics to see trending destinations"
      ]
    },
    {
      icon: <BotMessageSquare className="h-5 w-5" />,
      title: "AI-Powered Chat",
      description: "Natural conversation to build perfect itineraries",
      lightImage: "/chat_page_light.png",
      darkImage: "/chat_page_dark.png",
      details: [
        "Chat naturally with our AI assistant powered by Google Gemini",
        "Get personalized recommendations from Yelp's extensive database",
        "Interactive map shows all stops with routes in real-time",
        "Select specific places to highlight them on the map instantly"
      ]
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Explore Community",
      description: "Discover itineraries shared by travelers worldwide",
      lightImage: "/explore_page_light.png",
      darkImage: "/explore_page_dark.png",
      details: [
        "Browse published itineraries from the community",
        "Filter by hashtags and date posted to find inspiration",
        "Like, dislike, and comment on shared travel plans",
        "Sort by popularity, date, or number of stops"
      ]
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Collaborative Groups",
      description: "Plan trips together with friends and family",
      lightImage: "/group_page_light.png",
      darkImage: "/group_page_dark.png",
      details: [
        "Create groups and invite friends with secret codes",
        "Share wishlist items and vote on places together",
        "Real-time collaboration on itinerary planning",
        "Track group activity and see everyone's contributions"
      ]
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "My Space",
      description: "Your personal travel planning hub",
      lightImage: "/my_space_page_light.png",
      darkImage: "/my_space_page_dark.png",
      details: [
        "Organize all itineraries: published, favorites, and drafts",
        "Beautiful card-based layout with map thumbnails",
        "Quick actions to publish, favorite, or delete plans",
        "Search and filter your travel collection effortlessly"
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <HamsterLoader label="Loading The Odyssey Yelp..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
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
        <div className="mx-auto max-w-5xl text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
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

      {/* Hamster Loading Section */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <HamsterLoader label="Our AI is constantly working to find you the best travel experiences..." />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Google Gemini processes your requests
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Real Places</h3>
              <p className="text-sm text-muted-foreground">
                Verified businesses from Yelp&apos;s database
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Smart Routes</h3>
              <p className="text-sm text-muted-foreground">
                Optimized itineraries with maps
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="container mx-auto max-w-7xl py-20 px-4">
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="mb-4 text-4xl font-bold">Everything You Need</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Five powerful features to make travel planning effortless and fun
          </p>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid gap-12 lg:grid-cols-2 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
                  {feature.icon}
                  <span className="text-sm font-medium">Feature {index + 1}</span>
                </div>

                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary p-1 flex-shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dual Theme Screenshot */}
              <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="relative aspect-video rounded-xl border-2 shadow-2xl overflow-hidden group">
                  {/* Light theme image */}
                  <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-0">
                    <Image
                      src={feature.lightImage}
                      alt={`${feature.title} - Light theme`}
                      fill
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>

                  {/* Dark theme image */}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Image
                      src={feature.darkImage}
                      alt={`${feature.title} - Dark theme`}
                      fill
                      className="object-cover"
                      priority={index < 2}
                    />
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Hover to see dark theme
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-10">
            <div className="grid gap-8 md:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <p className="text-sm text-muted-foreground">Itineraries Created</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">50K+</div>
                <p className="text-sm text-muted-foreground">Places Discovered</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5K+</div>
                <p className="text-sm text-muted-foreground">Happy Travelers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto max-w-7xl py-20 px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-12 text-center shadow-2xl">
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

            <Button size="lg" className="gap-2 text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href="/signup">
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

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

