# Comprehensive Full Stack Application Development Guide

> **About This File**: This CLAUDE.md file is automatically loaded into Claude Code's context for every session. It defines project-wide standards, development workflows, and agent behaviors. Per Anthropic's best practices, keep this file focused on essential standards that guide development—common bash commands, core files, code style guidelines, testing instructions, and project-specific patterns.

## Critical: Context Management

**Per Claude Code Best Practices**:
- Use `/clear` frequently between tasks to maintain focus and prevent context pollution
- This file is automatically loaded—do not re-read it manually
- Load additional files only when actively needed for the current task
- Use subagents early for complex problems to preserve main context

## Table of Contents
1. [Architecture Principles](#architecture-principles)
2. [Frontend Development](#frontend-development)
3. [Backend Development](#backend-development)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security](#security)
7. [Testing Strategy](#testing-strategy)
8. [Performance Optimization](#performance-optimization)
9. [DevOps & CI/CD](#devops--cicd)
10. [Code Quality & Standards](#code-quality--standards)
11. [Documentation](#documentation)
12. [Error Handling & Logging](#error-handling--logging)
13. [Monitoring & Observability](#monitoring--observability)
14. [Accessibility](#accessibility)
15. [Internationalization](#internationalization)

---

## Claude Code Integration

### Project Structure for Claude Code
```
.claude/
├── commands/           # Slash commands (use with /command-name)
│   ├── agents/        # Agent persona definitions
│   ├── BMad/tasks/    # BMad Method task workflows
│   ├── design-principles.md
│   ├── brand-styles.md
│   └── shadcn-review.md
└── design-review-agent.md

.bmad-core/            # BMad Method core resources
├── agents/            # Agent definitions
├── tasks/             # Executable workflows
├── checklists/        # Quality checklists
├── data/              # Reference data
└── utils/             # Utility workflows
```

### Tool Usage Guidelines

**Per Anthropic Tool Use Best Practices**:

1. **Parallel Tool Execution**: When tool calls are independent (e.g., reading multiple files), execute them simultaneously in a single message
2. **Sequential Tool Execution**: When downstream operations depend on upstream results, chain tools with dependencies clearly stated
3. **Tool Selection**: Choose the most appropriate tool for each operation:
   - **Read**: For viewing file contents
   - **Edit**: For precise string replacements
   - **Write**: For new files or complete rewrites
   - **Bash**: For terminal operations (git, npm, docker)
   - **Grep**: For content search across files
   - **Glob**: For file pattern matching

4. **Error Handling**: When tools fail, analyze the error and either retry with corrections or request user clarification for missing parameters

### Explore-Plan-Code Pattern

**Per Anthropic Engineering Guidelines**, structure complex tasks as:

1. **Explore**: Read relevant files without making changes
2. **Plan**: Create explicit implementation plan (use extended thinking when beneficial)
3. **Code**: Implement solution incrementally
4. **Verify**: Test changes and confirm success
5. **Commit**: Use git with clear, conventional commit messages

---

## Design Principles
- Comprehensive design checklist in `.claude/commands/design-principles.md`
- Brand style guide in `.claude/commands/brand-styles.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**
1. **Identify what changes** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `.claude/commands/design-principles.md` and `.claude/commands/brand-styles.md`
4. **Validate feature alignment** - Verify changes align with their specific requirements
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) using `mcp__playwright__browser_take_screenshot`
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`
8. **Snapshot for context** - Use `mcp__playwright__browser_snapshot` for accessibility tree analysis

---

### Comprehensive Design Review
Invoke the `/design-review-agent` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing

### Git Workflow Integration

**Per Anthropic's Claude Code Best Practices**, leverage git integration throughout development:

**Commit Workflow**:
1. Claude automatically incorporates recent git history for context-aware commit messages
2. Use conventional commit format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
3. Always run tests before committing
4. Use `gh` CLI for GitHub operations (PRs, issues, code review)

**Common Git Operations**:
```bash
# Status and diff analysis
git status && git diff

# Stage and commit with message
git add . && git commit -m "feat(auth): implement user authentication"

# Create pull request with gh CLI
gh pr create --title "Feature: User Authentication" --body "Implementation details..."

# Implement code review comments
gh pr checkout <number>
# Make changes
git commit -am "fix: address code review feedback"
git push
```

**Branch Strategy**:
- Create feature branches from main/develop
- Use descriptive branch names: `feature/user-auth`, `fix/login-bug`
- For parallel tasks, consider `git worktree` with multiple Claude instances

---

## Architecture Principles

### 1. Separation of Concerns
- **Frontend**: UI/UX, client-side state management, user interactions
- **Backend**: Business logic, data processing, API endpoints
- **Database**: Data persistence, relationships, constraints
- **Infrastructure**: Deployment, scaling, monitoring

### 2. SOLID Principles
- **Single Responsibility**: Each module/class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Many specific interfaces > one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### 3. Design Patterns
- **MVC/MVP/MVVM**: Model-View separation
- **Repository Pattern**: Abstract data access layer
- **Service Layer**: Business logic encapsulation
- **Factory Pattern**: Object creation abstraction
- **Observer Pattern**: Event-driven architecture
- **Middleware Pattern**: Request/response processing pipeline

### 4. Microservices vs Monolith
- **Monolith**: Start here for MVP, easier to develop/debug
- **Microservices**: Consider when scaling, team size, or domain boundaries require it
- **Hybrid**: Monolith with clear module boundaries (modular monolith)

### 5. Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear domain boundaries
- **Aggregates**: Consistency boundaries
- **Value Objects**: Immutable domain concepts
- **Entities**: Mutable domain objects with identity
- **Domain Events**: Important business occurrences

---

## Frontend Development

### 1. Framework Selection
- **React**: Component-based, large ecosystem, TypeScript support
- **Next.js**: React framework with SSR/SSG, routing, API routes
- **Vue.js**: Progressive framework, gentle learning curve
- **Angular**: Enterprise-grade, full-featured framework
- **Svelte**: Compile-time optimization, minimal runtime

### 2. State Management
- **Local State**: Component-level (`useState`, `useReducer`)
- **Context API**: Shared state across component tree
- **Redux/Zustand**: Global state management
- **React Query/SWR**: Server state management, caching
- **Jotai/Recoil**: Atomic state management

### 3. Component Architecture
```typescript
// Component Structure
components/
  ├── ui/              # Reusable UI components (buttons, inputs)
  ├── features/        # Feature-specific components
  ├── layouts/         # Layout components
  └── providers/       # Context providers

// Component Best Practices
- Single Responsibility
- Composition over Inheritance
- Props Interface Definition
- Default Props
- Error Boundaries
- Memoization when needed
```

### 4. TypeScript Best Practices
```typescript
// Strict Type Checking
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true
}

// Type Definitions
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Generic Types
function useApi<T>(endpoint: string): [T | null, boolean, Error | null] {
  // Implementation
}
```

### 5. Styling Approaches
- **CSS Modules**: Scoped styles, no conflicts
- **Styled Components**: CSS-in-JS, dynamic styling
- **Tailwind CSS**: Utility-first, rapid development
- **Sass/SCSS**: Preprocessing, variables, mixins
- **CSS-in-JS**: Runtime styling (emotion, styled-components)

### 6. Performance Optimization
- **Code Splitting**: Route-based, component-based
- **Lazy Loading**: React.lazy(), dynamic imports
- **Memoization**: React.memo(), useMemo(), useCallback()
- **Virtual Scrolling**: Large lists rendering
- **Image Optimization**: Next/Image, WebP format, lazy loading
- **Bundle Analysis**: webpack-bundle-analyzer

### 7. Accessibility (a11y)
- **Semantic HTML**: Proper element usage
- **ARIA Attributes**: When semantic HTML isn't enough
- **Keyboard Navigation**: Tab order, focus management
- **Screen Reader Support**: Alt text, labels, descriptions
- **Color Contrast**: WCAG AA compliance (4.5:1 ratio)
- **Testing**: axe-core, Lighthouse, manual testing

### 8. Form Handling
- **Validation**: Client-side + server-side
- **Libraries**: React Hook Form, Formik, Zod
- **Error Messages**: Clear, actionable feedback
- **Accessibility**: Proper labels, error associations
- **Progressive Enhancement**: Works without JavaScript

---

## Backend Development

### 1. Language & Framework Selection
- **Node.js/Express**: JavaScript ecosystem, fast development
- **Python/Django/FastAPI**: Rapid development, data science integration
- **Java/Spring Boot**: Enterprise-grade, strong typing
- **Go**: High performance, concurrency, microservices
- **Rust**: Memory safety, performance-critical applications
- **C#/.NET**: Enterprise applications, Windows ecosystem

### 2. API Design Principles
- **RESTful**: Resource-based URLs, HTTP methods, status codes
- **GraphQL**: Flexible queries, single endpoint, type system
- **gRPC**: High performance, streaming, type safety
- **WebSockets**: Real-time bidirectional communication

### 3. REST API Best Practices
```
# URL Structure
GET    /api/v1/users           # List users
GET    /api/v1/users/:id       # Get user
POST   /api/v1/users           # Create user
PUT    /api/v1/users/:id       # Update user (full)
PATCH  /api/v1/users/:id       # Update user (partial)
DELETE /api/v1/users/:id       # Delete user

# HTTP Status Codes
200 OK              # Success
201 Created         # Resource created
204 No Content      # Success, no body
400 Bad Request     # Client error
401 Unauthorized    # Authentication required
403 Forbidden       # Authorization failed
404 Not Found       # Resource doesn't exist
409 Conflict        # Resource conflict
422 Unprocessable   # Validation error
500 Internal Error  # Server error
503 Service Unavailable # Service down
```

### 4. Request/Response Patterns
```typescript
// Request Validation
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

// Response Format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 5. Authentication & Authorization
- **JWT**: Stateless authentication, token-based
- **OAuth 2.0**: Third-party authentication
- **Session-based**: Server-side sessions
- **API Keys**: Service-to-service authentication
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control

### 6. Error Handling
```typescript
// Custom Error Classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Log unexpected errors
  logger.error(err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

### 7. Input Validation & Sanitization
- **Validation**: Schema validation (Zod, Joi, Yup)
- **Sanitization**: Remove dangerous content
- **Type Checking**: Runtime type validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Output encoding, CSP headers

### 8. Caching Strategies
- **Redis**: In-memory caching, session storage
- **CDN**: Static asset caching
- **Application Cache**: In-memory cache (Node-cache)
- **Database Query Cache**: Reduce DB load
- **Cache Invalidation**: TTL, event-based invalidation

---

### shadcn/ui Components

**Project-Specific Component Library**:
- Modern component library built on Radix UI primitives
- Components located in `src/components/ui/`
- Tailwind CSS v4 with CSS variables for theming
- Lucide React icons throughout
- Use MCP shadcn tools for component discovery and usage examples:
  - `mcp__shadcn__search_items_in_registries` - Find components
  - `mcp__shadcn__view_items_in_registries` - View implementation details
  - `mcp__shadcn__get_item_examples_from_registries` - Get usage examples
  - `mcp__shadcn__get_add_command_for_items` - Get installation command

**Before adding new shadcn components**, always:
1. Search for existing similar components using MCP tools
2. Review examples to understand usage patterns
3. Check design-principles.md for component usage guidelines
4. Verify compatibility with project theme variables

---

## Database Design

### 1. Database Selection
- **PostgreSQL**: Relational, ACID, JSON support, extensible
- **MySQL/MariaDB**: Widely used, good performance
- **MongoDB**: Document-based, flexible schema
- **Redis**: Key-value, caching, pub/sub
- **Elasticsearch**: Full-text search, analytics

### 2. Schema Design Principles
- **Normalization**: Reduce redundancy (3NF typically sufficient)
- **Denormalization**: Strategic redundancy for performance
- **Indexing**: Primary keys, foreign keys, frequently queried columns
- **Constraints**: NOT NULL, UNIQUE, CHECK, FOREIGN KEY
- **Naming Conventions**: Consistent, descriptive names

### 3. Migration Strategy
```sql
-- Migration Files
migrations/
  ├── 001_create_users_table.sql
  ├── 002_add_email_index.sql
  └── 003_add_soft_delete.sql

-- Version Control
-- Rollback Support
-- Environment-specific migrations
```

### 4. Query Optimization
- **Indexes**: Analyze query patterns, add appropriate indexes
- **Query Analysis**: EXPLAIN, query profiling
- **Connection Pooling**: Reuse database connections
- **Batch Operations**: Reduce round trips
- **Avoid N+1 Queries**: Use joins, eager loading

### 5. Data Integrity
- **Transactions**: ACID properties
- **Foreign Keys**: Referential integrity
- **Check Constraints**: Data validation at DB level
- **Unique Constraints**: Prevent duplicates
- **Soft Deletes**: Preserve data, mark as deleted

---

## API Design

### 1. Versioning
```
/api/v1/users
/api/v2/users

# Headers
Accept: application/vnd.api+json;version=1
```

### 2. Rate Limiting
```typescript
// Express Rate Limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 3. API Documentation
- **OpenAPI/Swagger**: Standard API documentation
- **Postman Collections**: API testing, documentation
- **GraphQL Schema**: Self-documenting
- **Code Comments**: Inline documentation

### 4. Request/Response Middleware
- **CORS**: Cross-origin resource sharing
- **Compression**: gzip, brotli
- **Request Logging**: Request/response logging
- **Request ID**: Trace requests across services
- **Timing**: Response time tracking

---

## Security

### 1. Authentication Security
- **Password Hashing**: bcrypt, argon2 (never plain text)
- **Password Policies**: Minimum length, complexity
- **Multi-Factor Authentication**: TOTP, SMS, email
- **Session Management**: Secure cookies, expiration
- **Token Security**: JWT expiration, refresh tokens

### 2. Authorization
- **Principle of Least Privilege**: Minimum required permissions
- **Role-Based Access Control (RBAC)**: Roles and permissions
- **Resource-Level Authorization**: Check ownership
- **API Key Management**: Rotation, expiration

### 3. Data Protection
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS/SSL (HTTPS)
- **PII Handling**: Encrypt sensitive data
- **Data Masking**: Hide sensitive data in logs
- **GDPR Compliance**: Right to deletion, data portability

### 4. Security Headers
```typescript
// Security Headers Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 5. Vulnerability Prevention
- **Dependency Scanning**: npm audit, Snyk, Dependabot
- **SQL Injection**: Parameterized queries, ORM
- **XSS**: Input sanitization, output encoding
- **CSRF**: CSRF tokens, SameSite cookies
- **Input Validation**: Whitelist approach

---

## Testing Strategy

**Claude Code Testing Pattern**: Follow Test-Driven Development (TDD) approach:
1. Write tests first and confirm they fail
2. Implement code incrementally
3. Run tests after each change
4. Refactor with confidence knowing tests pass
5. Use IDE diagnostic tools (`mcp__ide__getDiagnostics`) to catch issues early

### 1. Testing Pyramid
```
        /\
       /  \      E2E Tests (Few)
      /____\
     /      \    Integration Tests (Some)
    /________\
   /          \  Unit Tests (Many)
  /____________\
```

**Test Execution with Claude Code**:
```bash
# Run tests with watch mode during development
npm test -- --watch

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests with coverage
npm test -- --coverage

# Check IDE diagnostics for errors
# (Claude Code can access via mcp__ide__getDiagnostics)
```

### 2. Unit Testing
```typescript
// Jest/Vitest Example
describe('UserService', () => {
  it('should create a user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
  
  it('should throw error for duplicate email', async () => {
    await expect(
      userService.create({ email: 'existing@example.com' })
    ).rejects.toThrow('Email already exists');
  });
});
```

### 3. Integration Testing
- **API Testing**: Test endpoints with real database
- **Database Testing**: Test queries, transactions
- **External Services**: Mock external APIs
- **Test Containers**: Isolated test environments

### 4. End-to-End Testing
- **Playwright**: Cross-browser, reliable
- **Cypress**: Developer-friendly, time-travel debugging
- **Selenium**: Mature, widely supported
- **Test Scenarios**: Critical user flows

### 5. Test Coverage
- **Target**: 80%+ coverage for critical paths
- **Tools**: Istanbul, c8, Jest coverage
- **Focus**: Business logic, not implementation details
- **CI Integration**: Fail builds below threshold

### 6. Test Data Management
- **Fixtures**: Reusable test data
- **Factories**: Generate test data
- **Seeding**: Database seeding for tests
- **Cleanup**: Reset state between tests

---

## Performance Optimization

### 1. Frontend Performance
- **Code Splitting**: Route-based, component-based
- **Tree Shaking**: Remove unused code
- **Minification**: Reduce bundle size
- **Compression**: gzip, brotli
- **CDN**: Static asset delivery
- **Lazy Loading**: Images, components, routes
- **Memoization**: Prevent unnecessary re-renders

### 2. Backend Performance
- **Caching**: Redis, in-memory cache
- **Database Optimization**: Indexes, query optimization
- **Connection Pooling**: Reuse connections
- **Async Processing**: Background jobs, queues
- **Load Balancing**: Distribute traffic
- **Horizontal Scaling**: Multiple instances

### 3. Database Performance
- **Indexes**: Strategic index creation
- **Query Optimization**: Analyze slow queries
- **Connection Pooling**: Manage connections efficiently
- **Read Replicas**: Distribute read load
- **Partitioning**: Large table partitioning
- **Archiving**: Move old data to archive

### 4. Monitoring & Profiling
- **APM**: Application Performance Monitoring
- **Profiling**: Identify bottlenecks
- **Metrics**: Response times, error rates
- **Alerts**: Set up performance alerts

---

## DevOps & CI/CD

### 1. Version Control
- **Git Flow**: Feature branches, releases
- **Conventional Commits**: Standardized commit messages
- **Branch Protection**: Require reviews, checks
- **Semantic Versioning**: MAJOR.MINOR.PATCH

### 2. CI/CD Pipeline
```yaml
# GitHub Actions Example
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: ./deploy.sh
```

### 3. Containerization
```dockerfile
# Multi-stage Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 4. Infrastructure as Code
- **Terraform**: Cloud infrastructure provisioning
- **CloudFormation**: AWS infrastructure
- **Kubernetes**: Container orchestration
- **Docker Compose**: Local development

### 5. Environment Management
```
.env.development
.env.staging
.env.production

# Never commit .env files
# Use secrets management (AWS Secrets Manager, Vault)
```

---

## Code Quality & Standards

### 1. Linting & Formatting
```json
// ESLint Configuration
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}

// Prettier Configuration
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 2. Code Review Process
- **Pull Request Template**: Standardized PR format
- **Review Checklist**: Code quality, tests, documentation
- **Automated Checks**: Linting, tests, build
- **Approval Requirements**: At least one approval

### 3. Documentation Standards
- **README**: Project overview, setup, usage
- **API Documentation**: Endpoint documentation
- **Code Comments**: Explain why, not what
- **Architecture Decision Records (ADRs)**: Document decisions

### 4. Git Workflow
```bash
# Feature Branch Workflow
git checkout -b feature/user-authentication
git commit -m "feat: add user authentication"
git push origin feature/user-authentication

# Commit Message Format
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## Documentation

### 1. Code Documentation
```typescript
/**
 * Creates a new user account
 * 
 * @param userData - User registration data
 * @param userData.email - User email address (must be unique)
 * @param userData.password - User password (min 8 characters)
 * @param userData.name - User full name
 * @returns Promise resolving to created user object
 * @throws {ValidationError} If input validation fails
 * @throws {ConflictError} If email already exists
 * 
 * @example
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'secure123',
 *   name: 'John Doe'
 * });
 */
async function createUser(userData: CreateUserData): Promise<User> {
  // Implementation
}
```

### 2. API Documentation
- **OpenAPI/Swagger**: Standard API documentation
- **Postman Collections**: Interactive API testing
- **Example Requests**: cURL, JavaScript examples
- **Response Schemas**: Document response formats

### 3. Architecture Documentation
- **System Diagrams**: Architecture overview
- **Data Flow**: Request/response flows
- **Database Schema**: ER diagrams
- **Deployment Diagrams**: Infrastructure layout

---

## Error Handling & Logging

### 1. Error Handling Strategy
```typescript
// Error Types
class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string>) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super(401, 'UNAUTHORIZED', 'Authentication required');
  }
}
```

### 2. Logging Best Practices
```typescript
// Structured Logging
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log Levels
logger.error('Error occurred', { error, userId, requestId });
logger.warn('Warning message', { context });
logger.info('Info message', { data });
logger.debug('Debug message', { details });
```

### 3. Error Tracking
- **Sentry**: Error tracking and monitoring
- **Log Aggregation**: ELK stack, Datadog, CloudWatch
- **Alerting**: Set up alerts for critical errors

---

## Monitoring & Observability

### 1. Metrics
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User actions, conversions
- **Infrastructure Metrics**: CPU, memory, disk
- **Custom Metrics**: Domain-specific metrics

### 2. Logging
- **Structured Logging**: JSON format, consistent structure
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Context**: Include request ID, user ID, timestamp
- **Log Aggregation**: Centralized log management

### 3. Tracing
- **Distributed Tracing**: Trace requests across services
- **OpenTelemetry**: Standard observability framework
- **Performance Tracing**: Identify bottlenecks

### 4. Health Checks
```typescript
// Health Check Endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      externalApi: await checkExternalApi()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

---

## Accessibility

### 1. WCAG Guidelines
- **Level A**: Minimum requirements
- **Level AA**: Recommended (target this)
- **Level AAA**: Enhanced (aspirational)

### 2. Implementation
- **Semantic HTML**: Use proper elements
- **ARIA**: When semantic HTML isn't enough
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Test with NVDA, JAWS, VoiceOver
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Visible focus indicators

### 3. Testing
- **Automated**: axe-core, Lighthouse
- **Manual**: Keyboard navigation, screen reader testing
- **User Testing**: Test with real users

---

## Internationalization

### 1. i18n Setup
```typescript
// i18n Configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: require('./locales/en.json') },
    es: { translation: require('./locales/es.json') }
  },
  lng: 'en',
  fallbackLng: 'en'
});
```

### 2. Best Practices
- **Externalize Strings**: No hardcoded text
- **Pluralization**: Handle singular/plural forms
- **Date/Time Formatting**: Locale-aware formatting
- **Number Formatting**: Currency, decimals
- **RTL Support**: Right-to-left languages

---

## Additional Best Practices

### 1. Environment Variables
```bash
# .env.example (commit this)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
API_KEY=your-api-key

# Never commit actual .env files
# Use secrets management in production
```

### 2. Feature Flags
```typescript
// Feature Flag System
const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  betaFeatures: process.env.FEATURE_BETA === 'true'
};

if (features.newDashboard) {
  // New dashboard code
}
```

### 3. Graceful Degradation
- **Progressive Enhancement**: Works without JavaScript
- **Fallbacks**: Provide alternatives when features fail
- **Error Boundaries**: Catch and handle errors gracefully

### 4. Code Organization
```
src/
├── components/      # Reusable components
├── features/        # Feature modules
├── hooks/          # Custom hooks
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript types
├── constants/      # Constants
└── config/         # Configuration
```

---

## Checklist for New Features

- [ ] Requirements documented
- [ ] API design reviewed
- [ ] Database schema designed
- [ ] Security considerations addressed
- [ ] Tests written (unit, integration, E2E)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Accessibility checked
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Monitoring configured
- [ ] Deployment plan created

---

## Resources

### Learning
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Tools
- **Linting**: ESLint, Prettier
- **Testing**: Jest, Vitest, Playwright, Cypress
- **Monitoring**: Sentry, Datadog, New Relic
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins

---

## Common Project Commands

**Per Anthropic Best Practices**: Document common bash commands for quick reference.

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

### Claude Code Specific Commands
```bash
# Clear Claude context between tasks
/clear

# List available subagents
/agents

# Invoke design review subagent
/design-review-agent

# Check shadcn components
/shadcn-review

# Review latest modules
/new_modules
```

### Git Commands
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Check status and staged changes
git status && git diff --cached

# Commit with conventional format
git commit -m "type(scope): description"

# Push and create PR
git push -u origin feature/your-feature-name
gh pr create --title "Title" --body "Description"
```

### MCP Tools Reference
```bash
# Playwright browser automation
mcp__playwright__browser_navigate
mcp__playwright__browser_snapshot
mcp__playwright__browser_take_screenshot
mcp__playwright__browser_console_messages

# shadcn component management
mcp__shadcn__search_items_in_registries
mcp__shadcn__view_items_in_registries
mcp__shadcn__get_item_examples_from_registries

# IDE diagnostics
mcp__ide__getDiagnostics
```

---

## Conclusion

This guide provides a comprehensive foundation for building best-in-class full stack applications. Remember:

1. **Start Simple**: Don't over-engineer early
2. **Iterate**: Build, measure, learn, improve
3. **Security First**: Never compromise on security
4. **Test Thoroughly**: Tests save time in the long run
5. **Document Well**: Future you will thank you
6. **Monitor Everything**: You can't improve what you don't measure
7. **Stay Updated**: Technology evolves rapidly

Adapt these practices to your specific project needs and team context. The best practices are those that work for your team and deliver value to your users.

