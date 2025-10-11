import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SwotAnalysis } from '@/app/actions/strategic-plans'

interface SwotAnalysisDisplayProps {
  swot: SwotAnalysis
}

export function SwotAnalysisDisplay({ swot }: SwotAnalysisDisplayProps) {
  const hasContent =
    swot.strengths.length > 0 ||
    swot.weaknesses.length > 0 ||
    swot.opportunities.length > 0 ||
    swot.threats.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SWOT Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Strengths */}
          {swot.strengths.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-semibold text-green-900 mb-3">Strengths</h3>
              <ul className="space-y-2">
                {swot.strengths.map((item, index) => (
                  <li key={index} className="text-sm text-green-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {swot.weaknesses.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-semibold text-red-900 mb-3">Weaknesses</h3>
              <ul className="space-y-2">
                {swot.weaknesses.map((item, index) => (
                  <li key={index} className="text-sm text-red-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opportunities */}
          {swot.opportunities.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Opportunities</h3>
              <ul className="space-y-2">
                {swot.opportunities.map((item, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Threats */}
          {swot.threats.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="font-semibold text-orange-900 mb-3">Threats</h3>
              <ul className="space-y-2">
                {swot.threats.map((item, index) => (
                  <li key={index} className="text-sm text-orange-800">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
