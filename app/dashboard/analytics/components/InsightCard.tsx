import { Card, CardContent } from "@/components/ui/card"

interface InsightCardProps {
  title: string
  description: string
  category: string
  icon?: React.ReactNode
}

export function InsightCard({ title, description, category, icon }: InsightCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-indigo-100 p-2 mt-1">
            {icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{title}</h3>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                {category}
              </span>
            </div>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}