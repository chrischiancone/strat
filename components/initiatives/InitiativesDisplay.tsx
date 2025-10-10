import { getInitiatives } from '@/app/actions/initiatives'
import { getStrategicGoals } from '@/app/actions/strategic-goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InitiativesDisplayProps {
  planId: string
}

export async function InitiativesDisplay({ planId }: InitiativesDisplayProps) {
  const [initiatives, goals] = await Promise.all([
    getInitiatives(planId),
    getStrategicGoals(planId),
  ])

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'NEED':
        return 'bg-red-100 text-red-800'
      case 'WANT':
        return 'bg-yellow-100 text-yellow-800'
      case 'NICE_TO_HAVE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'at_risk':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'deferred':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (initiatives.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Initiatives</h2>
        <p className="mt-2 text-sm text-gray-500">
          No initiatives defined yet. Edit the plan to add initiatives.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Initiatives</h2>
      <div className="space-y-6">
        {goals.map((goal) => {
          const goalInitiatives = initiatives.filter(
            (i) => i.strategic_goal_id === goal.id
          )

          if (goalInitiatives.length === 0) return null

          // Group by priority
          const needsInitiatives = goalInitiatives.filter(
            (i) => i.priority_level === 'NEED'
          )
          const wantsInitiatives = goalInitiatives.filter(
            (i) => i.priority_level === 'WANT'
          )
          const niceToHaveInitiatives = goalInitiatives.filter(
            (i) => i.priority_level === 'NICE_TO_HAVE'
          )

          return (
            <div
              key={goal.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Goal {goal.goal_number}: {goal.title}
              </h3>

              <div className="space-y-4">
                {/* NEEDS */}
                {needsInitiatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">
                      📌 NEEDS ({needsInitiatives.length})
                    </h4>
                    <div className="space-y-2">
                      {needsInitiatives.map((initiative) => {
                        const totalCost =
                          initiative.total_year_1_cost +
                          initiative.total_year_2_cost +
                          initiative.total_year_3_cost

                        return (
                          <Card key={initiative.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      className={getPriorityBadgeColor(
                                        initiative.priority_level
                                      )}
                                    >
                                      {initiative.priority_level}
                                    </Badge>
                                    <Badge
                                      className={getStatusBadgeColor(
                                        initiative.status
                                      )}
                                    >
                                      {formatStatus(initiative.status)}
                                    </Badge>
                                  </div>
                                  <CardTitle className="text-base">
                                    {initiative.initiative_number}:{' '}
                                    {initiative.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {initiative.responsible_party && (
                                      <span>
                                        Responsible: {initiative.responsible_party}
                                      </span>
                                    )}
                                    {totalCost > 0 && (
                                      <span className="ml-2">
                                        • Total Cost: ${totalCost.toLocaleString()}
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {initiative.description && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Description
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.description}
                                  </p>
                                </div>
                              )}
                              {initiative.rationale && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Rationale
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.rationale}
                                  </p>
                                </div>
                              )}
                              {initiative.expected_outcomes &&
                                initiative.expected_outcomes.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                      Expected Outcomes
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1">
                                      {initiative.expected_outcomes.map(
                                        (outcome, index) => (
                                          <li
                                            key={index}
                                            className="text-sm text-gray-600"
                                          >
                                            {outcome}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* WANTS */}
                {wantsInitiatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                      💡 WANTS ({wantsInitiatives.length})
                    </h4>
                    <div className="space-y-2">
                      {wantsInitiatives.map((initiative) => {
                        const totalCost =
                          initiative.total_year_1_cost +
                          initiative.total_year_2_cost +
                          initiative.total_year_3_cost

                        return (
                          <Card key={initiative.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      className={getPriorityBadgeColor(
                                        initiative.priority_level
                                      )}
                                    >
                                      {initiative.priority_level}
                                    </Badge>
                                    <Badge
                                      className={getStatusBadgeColor(
                                        initiative.status
                                      )}
                                    >
                                      {formatStatus(initiative.status)}
                                    </Badge>
                                  </div>
                                  <CardTitle className="text-base">
                                    {initiative.initiative_number}:{' '}
                                    {initiative.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {initiative.responsible_party && (
                                      <span>
                                        Responsible: {initiative.responsible_party}
                                      </span>
                                    )}
                                    {totalCost > 0 && (
                                      <span className="ml-2">
                                        • Total Cost: ${totalCost.toLocaleString()}
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {initiative.description && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Description
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.description}
                                  </p>
                                </div>
                              )}
                              {initiative.rationale && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Rationale
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.rationale}
                                  </p>
                                </div>
                              )}
                              {initiative.expected_outcomes &&
                                initiative.expected_outcomes.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                      Expected Outcomes
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1">
                                      {initiative.expected_outcomes.map(
                                        (outcome, index) => (
                                          <li
                                            key={index}
                                            className="text-sm text-gray-600"
                                          >
                                            {outcome}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* NICE TO HAVES */}
                {niceToHaveInitiatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2">
                      ⭐ NICE TO HAVES ({niceToHaveInitiatives.length})
                    </h4>
                    <div className="space-y-2">
                      {niceToHaveInitiatives.map((initiative) => {
                        const totalCost =
                          initiative.total_year_1_cost +
                          initiative.total_year_2_cost +
                          initiative.total_year_3_cost

                        return (
                          <Card key={initiative.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      className={getPriorityBadgeColor(
                                        initiative.priority_level
                                      )}
                                    >
                                      {initiative.priority_level}
                                    </Badge>
                                    <Badge
                                      className={getStatusBadgeColor(
                                        initiative.status
                                      )}
                                    >
                                      {formatStatus(initiative.status)}
                                    </Badge>
                                  </div>
                                  <CardTitle className="text-base">
                                    {initiative.initiative_number}:{' '}
                                    {initiative.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1">
                                    {initiative.responsible_party && (
                                      <span>
                                        Responsible: {initiative.responsible_party}
                                      </span>
                                    )}
                                    {totalCost > 0 && (
                                      <span className="ml-2">
                                        • Total Cost: ${totalCost.toLocaleString()}
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {initiative.description && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Description
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.description}
                                  </p>
                                </div>
                              )}
                              {initiative.rationale && (
                                <div>
                                  <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                    Rationale
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {initiative.rationale}
                                  </p>
                                </div>
                              )}
                              {initiative.expected_outcomes &&
                                initiative.expected_outcomes.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-sm text-gray-700 mb-1">
                                      Expected Outcomes
                                    </h5>
                                    <ul className="list-disc list-inside space-y-1">
                                      {initiative.expected_outcomes.map(
                                        (outcome, index) => (
                                          <li
                                            key={index}
                                            className="text-sm text-gray-600"
                                          >
                                            {outcome}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
