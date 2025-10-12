import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import type { EnvironmentalScan } from '@/app/actions/strategic-plans'

interface EnvironmentalScanDisplayProps {
  scan: EnvironmentalScan | null
}

const CATEGORY_LABELS = {
  demographic_trends: 'Demographic Trends',
  economic_factors: 'Economic Factors',
  regulatory_changes: 'Regulatory/Legislative Changes',
  technology_trends: 'Technology Trends',
  community_expectations: 'Community Expectations',
}

const CATEGORY_COLORS = {
  demographic_trends: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  economic_factors: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  regulatory_changes: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
  technology_trends: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  community_expectations: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900' },
}

export function EnvironmentalScanDisplay({ scan }: EnvironmentalScanDisplayProps) {
  // Return null if scan is null/undefined
  if (!scan) {
    return null
  }

  const hasContent =
    (scan.demographic_trends?.length || 0) > 0 ||
    (scan.economic_factors?.length || 0) > 0 ||
    (scan.regulatory_changes?.length || 0) > 0 ||
    (scan.technology_trends?.length || 0) > 0 ||
    (scan.community_expectations?.length || 0) > 0

  if (!hasContent) {
    return null
  }

  type CategoryKey = keyof typeof CATEGORY_LABELS

  const categories: CategoryKey[] = [
    'demographic_trends',
    'economic_factors',
    'regulatory_changes',
    'technology_trends',
    'community_expectations',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environmental Scan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => {
            const items = scan[category] || []
            if (items.length === 0) return null

            const colors = CATEGORY_COLORS[category]

            return (
              <div
                key={category}
                className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}
              >
                <h3 className={`font-semibold ${colors.text} mb-3`}>
                  {CATEGORY_LABELS[category]}
                </h3>
                <ul className="space-y-3">
                  {items.map((item, index) => (
                    <li key={index} className={`text-sm ${colors.text}`}>
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-xs">•</span>
                        <div className="flex-1 prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <span className="leading-relaxed">{children}</span>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              a: ({ href, children }) => (
                                <a 
                                  href={href} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline break-words"
                                  title={href}
                                >
                                  {children}
                                </a>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {item}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
