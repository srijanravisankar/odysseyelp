"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type MetricCard = {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  accent: string
  chip?: string
}

type MetricsGridProps = {
  metrics: MetricCard[]
  className?: string
}

export function MetricsGrid({ metrics, className }: MetricsGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <Card key={metric.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={cn("rounded-full p-2", metric.accent)}>
                {metric.icon}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            {metric.chip && (
              <Badge variant="outline" className="mt-3 text-xs">
                {metric.chip}
              </Badge>
            )}
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </Card>
      ))}
    </div>
  )
}
