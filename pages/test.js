"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Button as NextUIButton } from "@nextui-org/react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function TestPage() {
  // Sample data for the bar chart
  const data = [
    {
      name: "Jan",
      total: 100,
    },
    {
      name: "Feb",
      total: 200,
    },
    {
      name: "Mar",
      total: 150,
    },
  ]

  // Update chart configuration with the blue colors
  const chartConfig = {
    total: {
      label: "Total Revenue",
      color: "#2563eb", // darker blue
    },
    secondary: {
      label: "Secondary",
      color: "#60a5fa", // lighter blue
    }
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} trigger="hover" />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}