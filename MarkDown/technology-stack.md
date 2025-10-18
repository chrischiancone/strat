# Technology Stack

## Complete Tech Stack Table

| Layer | Technology | Version | Purpose | Justification |
|-------|------------|---------|---------|---------------|
| **Frontend Framework** | Next.js | 14.x | Server/client rendering, routing | Industry standard, RSC support, Vercel integration |
| **UI Library** | React | 18.x | Component-based UI | Foundation for Next.js, hooks ecosystem |
| **Language** | TypeScript | 5.x | Type safety | Catch errors at compile time, better DX |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS | Rapid development, consistent design system |
| **Component Library** | shadcn/ui | latest | Pre-built accessible components | Built on Radix UI, customizable, copy-paste approach |
| **Form Management** | React Hook Form | 7.x | Complex form handling | Performance, validation integration |
| **Validation** | Zod | 3.x | Schema validation | Type inference, runtime safety |
| **Data Visualization** | Recharts | 2.x | Charts and graphs | React-native, declarative API |
| **Database** | PostgreSQL | 15.x | Primary data store | JSONB support, vector search (pgvector) |
| **BaaS Platform** | Supabase | latest | Backend infrastructure | Auth, RLS, auto-generated API, migrations |
| **Auth** | Supabase Auth | built-in | User authentication | Email/password, OAuth, RLS integration |
| **ORM** | Supabase Client | latest | Database access | Type-safe queries, RLS enforcement |
| **PDF Generation** | react-pdf | 3.x | Export to PDF | City Council reports, plan exports |
| **State Management** | React Context | built-in | Global state (minimal) | User session, theme, avoid Zustand unless needed |
| **HTTP Client** | fetch (native) | built-in | API calls | Server Actions preferred, fallback to fetch |
| **Date Handling** | date-fns | 2.x | Date manipulation | Lighter than moment.js |
| **Markdown** | react-markdown | 8.x | Render markdown comments | Comments, rich text display |
| **Icons** | Lucide React | latest | Icon library | Tree-shakeable, modern design |
| **Hosting** | Vercel | latest | Next.js hosting | Optimized for Next.js, edge functions |
| **CI/CD** | GitHub Actions | built-in | Automated testing, deployment | Free for public repos, Vercel integration |
| **Monitoring** | Vercel Analytics | built-in | Performance monitoring | Built-in, zero-config |
| **Error Tracking** | Sentry (optional) | latest | Error monitoring | Production error tracking |

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "recharts": "^2.10.0",
    "@react-pdf/renderer": "^3.1.14",
    "date-fns": "^2.30.0",
    "react-markdown": "^8.0.7",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0",
    "@playwright/test": "^1.40.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

---
