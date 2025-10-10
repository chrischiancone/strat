import { getStrategicGoals } from '@/app/actions/strategic-goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GoalsDisplayProps {
  planId: string
}

export async function GoalsDisplay({ planId }: GoalsDisplayProps) {
  const goals = await getStrategicGoals(planId)

  if (goals.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Strategic Goals</h2>
        <p className="mt-2 text-sm text-gray-500">
          No goals defined yet. Edit the plan to add strategic goals.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Strategic Goals
      </h2>
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    Goal {goal.goal_number}: {goal.title}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {goal.city_priority_alignment}
                    </Badge>
                    {goal.initiative_count !== undefined && goal.initiative_count > 0 && (
                      <span className="text-xs">
                        • {goal.initiative_count} initiative
                        {goal.initiative_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-600">{goal.description}</p>
              </div>

              {/* SMART Objectives */}
              {goal.objectives && goal.objectives.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">
                    SMART Objectives
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {goal.objectives.map((objective, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Measures */}
              {goal.success_measures && goal.success_measures.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">
                    Success Measures
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {goal.success_measures.map((measure, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
