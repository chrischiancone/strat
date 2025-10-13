import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Users,
  Target,
  PieChart,
  FileText,
  Clock,
  Shield,
  BarChart3,
  ArrowRight,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Temporarily disable auth check to test landing page
  // TODO: Re-enable auth check once we confirm landing page works
  
  // try {
  //   const supabase = createServerSupabaseClient()
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser()

  //   if (user) {
  //     redirect('/dashboard')
  //   }
  // } catch (error) {
  //   console.error('Supabase auth check failed:', error)
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Strat Plan</h1>
                <p className="text-xs text-gray-500">Strategic Planning System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            🏛️ Trusted by Municipal Governments
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Strategic Planning Made
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {' '}Simple
            </span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            Streamline your municipal strategic planning process with our comprehensive digital platform.
            Reduce planning time by 50% while improving collaboration and data quality.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Planning Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50%</div>
              <div className="text-sm text-gray-600">Reduction in Planning Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">3-Year</div>
              <div className="text-sm text-gray-600">Strategic Planning Cycles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Digital Collaboration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Real-time</div>
              <div className="text-sm text-gray-600">Budget Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for strategic planning
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              From SWOT analysis to budget validation, our platform handles every aspect of your planning process.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Cards */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-8 w-8 text-blue-600" />
                <CardTitle>Strategic Goals & Initiatives</CardTitle>
                <CardDescription>
                  Create and manage strategic goals with detailed initiatives, priorities, and measurable outcomes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-green-600" />
                <CardTitle>Budget Planning & Validation</CardTitle>
                <CardDescription>
                  Multi-year budget planning with real-time validation from Finance and automatic calculations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600" />
                <CardTitle>Collaborative Workflow</CardTitle>
                <CardDescription>
                  Real-time collaboration between departments, with comments, reviews, and approval workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Define KPIs, set targets, and track progress with automated reporting and dashboards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-cyan-600" />
                <CardTitle>SWOT & Environmental Analysis</CardTitle>
                <CardDescription>
                  Structured forms for SWOT analysis, environmental scanning, and benchmarking data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-red-600" />
                <CardTitle>Audit Trail & Security</CardTitle>
                <CardDescription>
                  Complete audit trail of all changes with role-based access controls and data security.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for every role in your organization
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-3 h-6 w-6 text-blue-600" />
                  Department Directors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Create comprehensive strategic plans
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Manage team collaboration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Track department performance
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-3 h-6 w-6 text-purple-600" />
                  City Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Review and approve all plans
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    City-wide budget overview
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Performance dashboards
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-3 h-6 w-6 text-green-600" />
                  Finance Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Validate department budgets
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Real-time budget analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Multi-year financial planning
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your strategic planning process?
          </h2>
          <p className="mt-6 text-xl text-blue-100">
            Join municipalities nationwide who have modernized their strategic planning with our platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 mx-auto">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              © 2024 Strategic Planning System. Built for Municipal Government Excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
