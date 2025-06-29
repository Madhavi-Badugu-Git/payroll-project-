# Redux Store Documentation

This documentation explains how to use the Redux store for state management in
the payroll application.

## Overview

The Redux store is configured using Redux Toolkit and manages user
synchronization state centrally. The main purpose is to store the `userSync`
response and make it available throughout the application.

## Store Structure

```
src/store/
├── index.ts          # Store configuration
├── hooks.ts          # Typed Redux hooks
├── selectors.ts      # Selector functions
├── userSlice.ts      # User state slice
└── StoreProvider.tsx # Provider component
```

## Features

- **Centralized State Management**: User sync state is managed in Redux store
- **TypeScript Support**: Fully typed Redux setup with TypeScript
- **Automatic Sync**: User data is automatically synced when user loads
- **Error Handling**: Proper error states and retry logic
- **Employee Linking**: Stores linked employee information from sync response

## Usage

### 1. Accessing State in Components

```tsx
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectLinkedEmployee } from '@/store/selectors';

function MyComponent() {
  const user = useAppSelector(selectUser);
  const linkedEmployee = useAppSelector(selectLinkedEmployee);

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      {linkedEmployee && <p>Employee ID: {linkedEmployee.empId}</p>}
    </div>
  );
}
```

### 2. Using Selectors

Available selectors:

```tsx
// Basic selectors
selectUser(state); // User object
selectLinkedEmployee(state); // Linked employee object
selectUserSyncStatus(state); // Sync status (loading, error, synced)
selectLastSyncResult(state); // Complete sync response

// Computed selectors
selectUserDisplayName(state); // User's display name
selectEmployeeInfo(state); // Employee info (empId, name, designation)
selectIsUserLinkedToEmployee(state); // Boolean: is user linked to employee
selectRetryInfo(state); // Retry count and canRetry status
```

### 3. Using the Redux Hook

```tsx
import { useUserSyncRedux } from '@/hooks/useUserSyncRedux';

function UserProfile() {
  const {
    isLoading,
    isSynced,
    error,
    user,
    linkedEmployee,
    syncUser,
    retryCount,
    canRetry,
  } = useUserSyncRedux();

  if (isLoading) return <div>Syncing...</div>;
  if (error && !canRetry) return <div>Sync failed: {error}</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <p>
        Name: {user?.firstName} {user?.lastName}
      </p>
      <p>Email: {user?.email}</p>

      {linkedEmployee && (
        <div>
          <h3>Employee Details</h3>
          <p>Employee ID: {linkedEmployee.empId}</p>
          <p>Designation: {linkedEmployee.designation}</p>
        </div>
      )}

      {error && canRetry && (
        <button onClick={syncUser}>Retry Sync ({retryCount}/5)</button>
      )}
    </div>
  );
}
```

## State Shape

```typescript
interface UserState {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  user: User | null;
  linkedEmployee: LinkedEmployee | null;
  lastSyncResult: UserSyncResponse | null;
  retryCount: number;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface LinkedEmployee {
  id: string;
  empId: string;
  name: string;
  designation: string;
}
```

## Actions

The user slice provides these actions:

- `setSyncLoading(boolean)` - Set loading state
- `setSyncError(string | null)` - Set error state
- `setSyncSuccess(UserSyncResponse)` - Set successful sync data
- `setSyncFailed(string)` - Set sync failure with error message
- `resetSyncState()` - Reset all state to initial values
- `incrementRetryCount()` - Increment retry counter
- `resetRetryCount()` - Reset retry counter to 0

## Automatic Sync

The `UserSyncRedux` component is automatically included in the layout and
handles:

- Automatic user sync on application load
- Retry logic with exponential backoff
- State management in Redux store
- Debug logging in development mode

## Development Debugging

In development mode, the following functions are exposed on the window object:

```javascript
// Check current sync status
window.getUserSyncStatus();

// Manually trigger a sync retry
window.retryUserSync();
```

## Integration with Existing Code

The Redux store is designed to work alongside existing hooks. You can:

1. **Migrate existing components** to use Redux selectors instead of the
   `useUserSync` hook
2. **Use both approaches** - Redux for global state, hooks for
   component-specific state
3. **Access employee data easily** using `selectLinkedEmployee` instead of
   parsing user metadata

## Example: Employee ID Access

**Before (using hook):**

```tsx
const { user } = useUser();
const empId = user?.publicMetadata?.empId;
```

**After (using Redux):**

```tsx
const linkedEmployee = useAppSelector(selectLinkedEmployee);
const empId = linkedEmployee?.empId;
```

## Benefits

1. **Centralized State**: User data is available anywhere in the app
2. **Type Safety**: Full TypeScript support with proper typing
3. **Performance**: Reduced API calls through centralized sync
4. **Consistency**: Single source of truth for user data
5. **Debugging**: Better debugging with Redux DevTools
6. **Scalability**: Easy to extend with additional state slices

## Migration Guide

To migrate existing code to use Redux:

1. **Replace hook usage**:

   ```tsx
   // Old
   const { lastSyncResult } = useUserSync();
   const empId = lastSyncResult?.linkedEmployee?.empId;

   // New
   const linkedEmployee = useAppSelector(selectLinkedEmployee);
   const empId = linkedEmployee?.empId;
   ```

2. **Update employee ID access**:

   ```tsx
   // Old
   const { user } = useUser();
   const empId = user?.publicMetadata?.empId;

   // New
   const empId = useAppSelector(selectEmployeeInfo)?.empId;
   ```

3. **Simplify loading states**:

   ```tsx
   // Old
   const { isLoading, error } = useUserSync();

   // New
   const { isLoading, error } = useAppSelector(selectUserSyncStatus);
   ```

## Next Steps

You can extend the Redux store by:

1. Adding more slices for other application state
2. Adding middleware for API caching
3. Implementing state persistence
4. Adding more computed selectors for specific use cases
