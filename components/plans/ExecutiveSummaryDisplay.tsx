import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'

interface ExecutiveSummaryDisplayProps {
  summary: string | null
}

export function ExecutiveSummaryDisplay({ summary }: ExecutiveSummaryDisplayProps) {
  // Return null if summary is null/undefined or empty
  if (!summary || summary.trim().length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Executive Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-gray-700">{children}</h3>,
              h4: ({ children }) => <h4 className="text-sm font-medium mb-2 text-gray-600">{children}</h4>,
              p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
              ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700 leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-4 italic text-gray-700 rounded-r">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-6 border-gray-300" />,
              code: ({ children, className }) => {
                const isInline = !className
                return isInline ? (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4">
                    <code className="text-gray-800">{children}</code>
                  </pre>
                )
              },
              // Handle links
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {summary}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}