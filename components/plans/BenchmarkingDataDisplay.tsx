import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { BenchmarkingData } from '@/app/actions/strategic-plans'

interface BenchmarkingDataDisplayProps {
  data: BenchmarkingData
}

export function BenchmarkingDataDisplay({ data }: BenchmarkingDataDisplayProps) {
  const hasContent =
    data.peer_municipalities.length > 0 ||
    data.metrics.length > 0 ||
    data.key_findings.length > 0

  if (!hasContent) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmarking Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Peer Municipalities */}
          {data.peer_municipalities.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Peer Municipalities Compared
              </h3>
              <ul className="space-y-1">
                {data.peer_municipalities.map((municipality, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {municipality}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benchmarking Metrics */}
          {data.metrics.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Performance Comparison</h3>
              <div className="rounded-md border border-gray-200 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Metric</TableHead>
                      <TableHead className="w-[15%]">Current</TableHead>
                      <TableHead className="w-[15%]">Peer Avg</TableHead>
                      <TableHead className="w-[40%]">Gap Analysis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.metrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{metric.metric_name}</TableCell>
                        <TableCell>{metric.carrollton_current}</TableCell>
                        <TableCell>{metric.peer_average}</TableCell>
                        <TableCell className="text-sm">{metric.gap_analysis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Key Findings */}
          {data.key_findings.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Findings</h3>
              <ul className="space-y-2">
                {data.key_findings.map((finding, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {finding}
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
