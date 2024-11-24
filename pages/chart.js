import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart"
import { Card } from "@/components/ui/card"

export default function TestPage() {
  const data = [
    { month: "January", desktop: 100, mobile: 80 },
    { month: "February", desktop: 200, mobile: 150 },
    { month: "March", desktop: 150, mobile: 120 },
  ]

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "#2563eb",
    },
    mobile: {
      label: "Mobile",
      color: "#60a5fa",
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <Card className="w-full max-w-2xl p-6">
        <h2 className="mb-4 text-xl font-bold">Monthly Revenue</h2>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              trigger="hover"  // Add this line
              cursor={{ fill: 'transparent' }}  // Optional: removes the dark overlay on hover
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  )
}