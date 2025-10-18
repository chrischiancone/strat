# Logging and Error Handling Migration Guide

This guide explains how to migrate from console.log statements and ad-hoc error handling to our new centralized logging and error handling system.

## Overview

We've implemented a comprehensive logging and error handling system with these components:

- **Logger** (`/lib/logger.ts`) - Centralized, structured logging
- **Error Handler** (`/lib/errorHandler.ts`) - Consistent error handling and user-friendly messages
- **Error Boundary** (`/components/ErrorBoundary.tsx`) - React error boundaries and UI components

## Quick Start

### 1. Replace Console Logging

**Before:**
```typescript
console.log('Loading user data')
console.error('Database error:', error)
```

**After:**
```typescript
import { logger } from '@/lib/logger'

logger.info('Loading user data', { userId, action: 'loadUser' })
logger.error('Database operation failed', { userId, table: 'users' }, error)
```

### 2. Upgrade Server Actions

**Before:**
```typescript
export async function getUsers() {
  try {
    const data = await supabase.from('users').select()
    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch users')
    }
    return data
  } catch (error) {
    console.error('Error:', error)
    return { error: 'Something went wrong' }
  }
}
```

**After:**
```typescript
import { logger } from '@/lib/logger'
import { createError, safeAsync } from '@/lib/errorHandler'

export async function getUsers() {
  const result = await safeAsync(async () => {
    logger.info('Fetching users', { action: 'getUsers' })
    
    const { data, error } = await supabase.from('users').select()
    if (error) {
      throw createError.database('Failed to fetch users', error)
    }
    
    logger.info('Users fetched successfully', { count: data.length })
    return data
  }, { action: 'getUsers' })
  
  if (!result.success) {
    throw new Error(result.error)
  }
  
  return result.data
}
```

### 3. Upgrade Client Components

**Before:**
```typescript
export function UserList() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  
  useEffect(() => {
    fetchUsers().catch(err => {
      console.error('Failed to load users:', err)
      setError('Failed to load users')
    })
  }, [])
  
  if (error) {
    return <div className="error">Error: {error}</div>
  }
  
  return <div>{/* component content */}</div>
}
```

**After:**
```typescript
import { handleError } from '@/lib/errorHandler'
import { AsyncError, Loading } from '@/components/ErrorBoundary'

export function UserList() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(err => {
        const errorMessage = handleError.client(err, {
          component: 'UserList',
          action: 'fetchUsers'
        })
        setError(errorMessage)
      })
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <Loading message="Loading users..." />
  if (error) return <AsyncError error={error} retry={() => window.location.reload()} />
  
  return <div>{/* component content */}</div>
}
```

## Logging Best Practices

### 1. Use Structured Context

Always provide meaningful context with your logs:

```typescript
// Good
logger.info('User action completed', {
  userId: user.id,
  action: 'createPlan',
  planId: newPlan.id,
  duration: performance.now() - startTime
})

// Bad
logger.info('User created a plan')
```

### 2. Choose Appropriate Log Levels

- **debug**: Development debugging information
- **info**: General application flow and successful operations
- **warn**: Potentially harmful situations that don't stop the application
- **error**: Error events that might still allow the application to continue

```typescript
logger.debug('Validating user input', { input })
logger.info('Plan created successfully', { planId, userId })
logger.warn('Deprecated API endpoint used', { endpoint, userId })
logger.error('Database connection failed', { database: 'primary' }, error)
```

### 3. Use Specialized Error Methods

```typescript
// Database errors
logger.dbError('insert user', error, { userId })

// Authentication errors  
logger.authError('Invalid session', { userId }, error)

// API errors
logger.apiError('/api/users', error, { method: 'POST' })
```

## Error Handling Patterns

### 1. Server Actions with handleError.server

```typescript
export async function createUser(input: CreateUserInput) {
  const result = await handleError.server(async () => {
    // Validation
    const validatedInput = schema.parse(input)
    
    // Business logic
    const user = await createUserInDatabase(validatedInput)
    
    logger.info('User created successfully', { userId: user.id })
    return { success: true, userId: user.id }
  }, { action: 'createUser', input: input.email })
  
  return result
}
```

### 2. Client Error Handling

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    const result = await createUser(data)
    if (!result.success) {
      setError(result.error)
      return
    }
    // Handle success
  } catch (error) {
    const errorMessage = handleError.client(error, {
      component: 'UserForm',
      action: 'submitUser'
    })
    setError(errorMessage)
  }
}
```

### 3. Form Validation Errors

```typescript
const validateForm = (data: FormData) => {
  try {
    return schema.parse(data)
  } catch (error) {
    const validationError = handleError.validation(error, {
      form: 'userForm'
    })
    setFieldError(validationError.field, validationError.message)
    return null
  }
}
```

## Error Boundaries

### 1. Page-Level Error Boundaries

Wrap your page components with error boundaries:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function UsersPage() {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <PageError 
          title="Failed to load users page"
          error={error.message}
          retry={() => window.location.reload()}
        />
      )}
    >
      <UserList />
    </ErrorBoundary>
  )
}
```

### 2. Component-Level Error Handling

Use AsyncError for async operation failures:

```typescript
import { AsyncError, Loading } from '@/components/ErrorBoundary'

if (loading) return <Loading />
if (error) return <AsyncError error={error} retry={refetch} />
```

## Migration Checklist

- [ ] Replace all `console.log/error/warn` with `logger` methods
- [ ] Add structured context to all log statements
- [ ] Wrap server actions with `safeAsync` or `handleError.server`
- [ ] Use `createError.*` factories for creating typed errors
- [ ] Replace generic error messages with user-friendly ones
- [ ] Add error boundaries to page components
- [ ] Use `AsyncError` and `Loading` components for async states
- [ ] Update form validation to use `handleError.validation`
- [ ] Add retry functionality where appropriate
- [ ] Test error scenarios to ensure proper logging and user experience

## Examples

See the updated files for complete examples:
- `app/actions/dashboard.ts` - Server action with logging
- `app/actions/users.ts` - CRUD operations with error handling
- `components/dashboard/DashboardContent.tsx` - Component error handling
- `components/ErrorBoundary.tsx` - Error UI components