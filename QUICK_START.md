# Strategic Planning System - Quick Start Guide

## 🎯 What We've Built

You now have a **complete database schema** for your municipal strategic planning application:

- ✅ **15 tables** covering the entire strategic planning lifecycle
- ✅ **Hybrid architecture**: Relational + JSONB for maximum flexibility
- ✅ **Row-level security** with department scoping
- ✅ **Comprehensive audit trails** for government accountability
- ✅ **Vector embeddings** ready for AI/RAG features
- ✅ **Sample data** from City of Carrollton Water & Field Services

## 📁 What's in This Project

```
/Stratic Plan/
├── docs/
│   ├── database-schema-overview.md    # Complete schema documentation
│   └── brainstorming-session-results.md  # Architecture decisions & rationale
├── supabase/
│   ├── migrations/
│   │   ├── 20250109000001_create_core_tables.sql
│   │   ├── 20250109000002_create_planning_tables.sql
│   │   ├── 20250109000003_create_supporting_tables.sql
│   │   ├── 20250109000004_create_system_tables.sql
│   │   ├── 20250109000005_enable_rls_policies.sql
│   │   └── 20250109000006_seed_data.sql
│   └── README.md                      # Database documentation & queries
└── Artifact/
    └── Info.md                        # Original strategic plan template
```

## 🚀 Next Steps (30 Minutes to Running System)

### Step 1: Install Supabase CLI (5 min)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Start Local Supabase (5 min)

```bash
# Navigate to project directory
cd "/Users/cchiancone/Desktop/Stratic Plan"

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase (Docker required)
supabase start
```

You'll see output like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**💾 Save these credentials!** You'll need them for Next.js.

### Step 3: Run Migrations (2 min)

```bash
# Apply all migrations and seed data
supabase db reset
```

This runs all 6 migration files in order and populates with sample data.

### Step 4: Explore Your Database (5 min)

Open **Supabase Studio**: http://localhost:54323

Navigate to:
- **Table Editor** → See all 15 tables
- **SQL Editor** → Run sample queries (see below)
- **Database** → Explore relationships

#### Sample Queries to Try

```sql
-- See the strategic plan
SELECT * FROM strategic_plans;

-- See all initiatives with their goals
SELECT
    i.initiative_number,
    i.name,
    i.priority_level,
    i.total_year_1_cost,
    sg.title as goal_title
FROM initiatives i
JOIN strategic_goals sg ON i.strategic_goal_id = sg.id;

-- Budget breakdown by funding source
SELECT
    funding_source,
    SUM(amount) as total
FROM initiative_budgets
GROUP BY funding_source;

-- All KPIs with targets
SELECT
    metric_name,
    baseline_value,
    year_1_target,
    year_2_target,
    year_3_target
FROM initiative_kpis;
```

### Step 5: Generate TypeScript Types (3 min)

```bash
# Generate types for Next.js
supabase gen types typescript --local > types/supabase.ts
```

### Step 6: Set Up Next.js Project (10 min)

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest stratic-plan-app --typescript --tailwind --app

cd stratic-plan-app

# Install Supabase client
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Copy the types file you generated
mkdir types
cp ../types/supabase.ts types/
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_step_2
```

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Step 7: Build Your First Page (10 min)

Create `app/plans/page.tsx`:

```typescript
import { supabase } from '@/lib/supabase'

export default async function PlansPage() {
  const { data: plans, error } = await supabase
    .from('strategic_plans')
    .select(`
      *,
      department:departments(name),
      start_year:fiscal_years!start_fiscal_year_id(year),
      end_year:fiscal_years!end_fiscal_year_id(year)
    `)

  if (error) {
    return <div>Error loading plans: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Strategic Plans</h1>
      <div className="grid gap-4">
        {plans?.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <p className="text-gray-600">{plan.department.name}</p>
                <p className="text-sm text-gray-500 mt-2">
                  FY{plan.start_year.year} - FY{plan.end_year.year}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                plan.status === 'active' ? 'bg-green-100 text-green-800' :
                plan.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {plan.status}
              </span>
            </div>
            {plan.executive_summary && (
              <p className="mt-4 text-gray-700">{plan.executive_summary}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Run the app:

```bash
npm run dev
```

Visit http://localhost:3000/plans and see your strategic plan! 🎉

## 📊 What You Can Build Next

### Immediate Features (1-2 weeks each)
1. **Initiative List & Detail Pages**
   - Display initiatives grouped by priority (NEEDS/WANTS/NICE_TO_HAVES)
   - Show financial breakdown, KPIs, milestones
   - Edit forms with JSONB field support

2. **Dashboard Overview**
   - Total budget by fiscal year
   - Initiative status summary
   - KPI progress charts (use Recharts)
   - At-risk initiatives alert

3. **Department Selection**
   - User login with Supabase Auth
   - Department assignment
   - RLS automatically filters data

### Advanced Features (2-4 weeks each)
4. **Budget Analysis Tools**
   - Scenario planning (100%/75%/50% funding)
   - Funding source breakdown
   - Cross-department comparisons

5. **Collaboration Features**
   - Comments on initiatives
   - Review workflow (draft → review → approved)
   - Real-time updates with Supabase Realtime

6. **AI-Powered Features**
   - Generate embeddings for plans/initiatives
   - Semantic search: "Find all infrastructure initiatives"
   - Q&A: "What's our total grant funding for FY2025?"
   - Comparative analysis: "How does this compare to Parks & Rec?"

## 📖 Key Resources

### Documentation
- **Schema Overview**: `docs/database-schema-overview.md` - Complete table reference
- **Database README**: `supabase/README.md` - Sample queries, best practices
- **Session Results**: `docs/brainstorming-session-results.md` - Architecture decisions

### Reference Files
- **Strategic Plan Template**: `Artifact/Info.md` - Original template structure
- **Sample Data**: `supabase/migrations/20250109000006_seed_data.sql` - Example plan

### External Docs
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [pgvector for RAG](https://github.com/pgvector/pgvector)

## 🆘 Troubleshooting

### Supabase won't start
```bash
# Make sure Docker is running
docker ps

# Reset Supabase
supabase stop
supabase start
```

### Migrations fail
```bash
# Check migration status
supabase migration list

# Force reset (⚠️ destroys data)
supabase db reset
```

### TypeScript errors in Next.js
```bash
# Regenerate types after schema changes
supabase gen types typescript --local > types/supabase.ts
```

### Can't see data in queries
- Check RLS policies - you need to be authenticated
- In development, you can disable RLS temporarily:
  ```sql
  ALTER TABLE initiatives DISABLE ROW LEVEL SECURITY;
  ```

## 🎓 Learning Path

1. **Week 1**: Database fundamentals
   - Explore tables in Supabase Studio
   - Run sample queries
   - Understand JSONB structure

2. **Week 2**: Basic CRUD operations
   - Build strategic plans list
   - Create/edit initiatives
   - Display KPIs and milestones

3. **Week 3**: Advanced queries
   - Budget aggregations
   - Cross-departmental reporting
   - Dependency visualization

4. **Week 4**: AI integration
   - Generate embeddings with OpenAI
   - Build semantic search
   - Implement Q&A over plans

## 🎯 Success Metrics

You'll know you're on track when:
- ✅ Local Supabase running with all tables populated
- ✅ Next.js app displays strategic plan from database
- ✅ TypeScript autocomplete works for database queries
- ✅ You can create a new initiative through UI
- ✅ Budget totals calculate correctly
- ✅ RLS policies properly filter by department

## 💡 Tips from the Brainstorming Session

1. **Start with one department**: Focus on Water & Field Services (already seeded)
2. **Use the template**: `Artifact/Info.md` is your UI specification
3. **Leverage JSONB**: Don't over-normalize complex template sections
4. **Test RLS early**: Ensure security works before building features
5. **Iterate on schema**: It's easy to add columns; migration files are version-controlled

## 🚀 Ready to Build?

You have everything you need:
- ✅ Complete database schema
- ✅ Sample data loaded
- ✅ Documentation and examples
- ✅ Clear next steps

**Start here**: Follow Step 1-7 above, then dive into building the initiative list page!

---

**Questions?** Review the detailed documentation in the `docs/` folder or check the `supabase/README.md` for database-specific help.

**Good luck building your municipal strategic planning system!** 🏛️
