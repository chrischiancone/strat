# Comprehensive User Document - Chris Chiancone

## System Environment

### Operating System & Shell
- **Platform**: macOS (MacOS)
- **Shell**: zsh version 5.9
- **Home Directory**: `/Users/cchiancone`
- **Current Working Directory**: `/Users/cchiancone/Desktop/Stratic Plan`

### Development Tools
- **Node.js**: v24.2.0 (installed via Homebrew at `/opt/homebrew/bin/node`)
- **npm**: v11.3.0 (installed via Homebrew at `/opt/homebrew/bin/npm`)
- **Git**: v2.50.1 (Apple Git-155)
- **Docker**: v28.4.0, build d8eb465
- **Package Manager**: Homebrew (evidenced by `/opt/homebrew/bin/` paths)

## Development Preferences & Philosophy

### Technology Stack Preferences
Based on your existing rule and project analysis, you prefer:

- **Open Source & Free Solutions**: Exclusively using open source tools and platforms
- **Complete Development Infrastructure**: Building comprehensive development platforms with:
  - Monorepo management capabilities
  - Frontend/backend frameworks
  - Database solutions
  - Container orchestration
  - CI/CD pipelines
  - Authentication systems
  - Monitoring tools
  - Market data integration

### Current Tech Stack (Stratic Plan Project)
- **Frontend Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript 5.3.3
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **UI Framework**: shadcn/ui (Radix UI components + Tailwind CSS)
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS 3.4.1 with custom animations
- **Charts/Visualization**: Recharts
- **Testing**: Playwright, Vitest, React Testing Library
- **Development Tools**: ESLint, Prettier, Critters

## Current Project: Strategic Planning System

### Project Overview
You're developing a **Strategic Planning System** - a modern web application for municipal government strategic planning with comprehensive features including:

- Multi-year fiscal planning
- Goal and initiative tracking
- Budget allocation management
- KPI monitoring and reporting
- User authentication and authorization
- Document management with attachments
- Activity logging and audit trails

### Project Structure & Architecture
The project follows the **BMad (Business Model-Driven Development)** methodology with:

- **App Directory Structure**: Next.js 14 app router pattern
- **Component Organization**: Modular components with auth, layout, and UI separation
- **Database Schema**: 15 main tables with Row-Level Security (RLS) policies
- **Documentation-Driven Development**: 
  - PRD documents in `/docs/prd/`
  - Architecture docs in `/docs/architecture/`
  - Epic organization in `/docs/epics/`
  - User stories in `/stories/`

### Development Workflow & Tools

#### BMad Framework Integration
- **Core Configuration**: `.bmad-core/core-config.yaml` with markdown exploder enabled
- **Agent Teams**: Defined team structures (fullstack, minimal IDE, etc.)
- **Development Agents**: Specialized roles (architect, dev, PM, QA, UX expert)
- **Automated Workflows**: Task execution, checklist management, story creation

#### Custom Scripts & Automation
- **AI CLI Integration**: Custom AI scripts for testing, summary, and research
- **CSS Fix Automation**: Automated CSS debugging and fixing
- **Upload Testing**: File upload testing capabilities
- **Development Debugging**: Comprehensive logging system

### Environment Configuration

#### Local Development Setup
- **Supabase Local**: Running on `http://127.0.0.1:54321`
- **App Port**: `http://localhost:3001` (non-standard port)
- **API Keys**: Integrated with Perplexity and Claude APIs for AI assistance

#### Security & Content Policy
- **CSP Configuration**: Development-specific policies allowing local Supabase connections
- **Production Security**: Strict CSP policies for production deployment
- **Authentication**: Supabase Auth with email/password system

## Development Patterns & Practices

### Code Organization
- **TypeScript-First**: Strict typing with custom type definitions
- **Component-Based Architecture**: React functional components with hooks
- **Server Actions**: Next.js server actions for backend logic
- **Form Validation**: Schema-based validation with Zod

### UI/UX Patterns
- **Design System**: shadcn/ui for consistent component library
- **Responsive Design**: Tailwind CSS for mobile-first responsive layouts
- **Accessibility**: Radix UI for accessible component primitives
- **User Feedback**: Toast notifications with Sonner

### Data Management
- **Database-First**: PostgreSQL with Supabase for backend services
- **Real-time Updates**: Supabase real-time subscriptions
- **File Handling**: Supabase storage for attachments and documents
- **Export Capabilities**: PDF generation and Excel export functionality

## Project Context & Documentation

### Business Domain
- **Municipal Government**: Local government strategic planning
- **Multi-Year Planning**: Fiscal year management and budgeting
- **Stakeholder Management**: Department-based user roles and permissions
- **Compliance**: Audit trails and activity logging for government requirements

### Development Status
Based on file timestamps and structure, this appears to be an active project with:
- Recent development activity (files modified October 2024)
- Iterative improvements (multiple fix and enhancement files)
- Testing infrastructure in place
- Documentation actively maintained

### Integration Points
- **Email**: Nodemailer for notifications
- **File Processing**: XLSX for Excel file handling
- **Markdown**: React-markdown for rich text content
- **PDF Generation**: React-PDF for report generation

## Development Environment Considerations

### Performance Optimizations
- **CSS Optimization**: Disabled in development to prevent style loss
- **Webpack Configuration**: Custom webpack config for Supabase compatibility
- **Module Resolution**: Fallback configurations for server-side rendering

### Development Challenges Addressed
- **CSS Hot Reload Issues**: Custom scripts to fix CSS problems during development
- **Supabase Local Development**: Configured for local development with Docker
- **TypeScript Compilation**: Optimized build configuration for large project

## Recommendations for Future Development

### Infrastructure Enhancements
1. **Monorepo Setup**: Consider migrating to monorepo structure for better code organization
2. **CI/CD Pipeline**: Implement automated testing and deployment pipeline
3. **Monitoring**: Add application monitoring and error tracking
4. **Performance**: Implement performance monitoring and optimization

### Development Process Improvements
1. **Code Standards**: Formalize coding standards documentation
2. **Testing Strategy**: Expand test coverage and implement integration tests
3. **Documentation**: Continue maintaining comprehensive technical documentation
4. **Security**: Regular security audits and dependency updates

---

*Document Generated: October 13, 2024*  
*Last Updated: Based on project analysis and system inspection*