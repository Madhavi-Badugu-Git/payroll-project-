# Role-Based Access Control (RBAC) Implementation

## Overview

Implemented a comprehensive role-based access control system for the payroll
application.

## Database Schema

### Role Model

- `id`: Unique identifier
- `name`: Role name (e.g., 'admin', 'hr', 'manager', 'employee', 'user')
- `description`: Human-readable description
- `permissions`: Array of permission strings
- `isActive`: Boolean flag for soft delete
- `createdAt`, `updatedAt`: Timestamps

### UserRole Model

- `id`: Unique identifier
- `userId`: Foreign key to User
- `roleId`: Foreign key to Role
- `assignedAt`: When the role was assigned
- `assignedBy`: Who assigned the role (User ID)
- `isActive`: Boolean flag for soft delete
- Unique constraint on `[userId, roleId]`

## Default Roles Created

1. **admin** - Administrator with full system access
   - Permissions: `['*']` (wildcard for all permissions)

2. **hr** - Human Resources staff
   - Permissions:
     `['users:read', 'users:write', 'employees:read', 'employees:write', 'payroll:read']`

3. **manager** - Team manager
   - Permissions: `['attendance:read', 'leave:approve', 'employees:read']`

4. **employee** - Regular employee
   - Permissions: `['attendance:read', 'leave:create', 'payslips:read']`

5. **user** - Basic user access
   - Permissions: `['profile:read']`

## API Endpoints

### /api/roles

- `GET` - Get all roles or roles for a specific user
- `POST` - Create a new role (admin only)
- `PUT` - Update a role (admin only)
- `DELETE` - Deactivate a role (admin only)

### /api/user-roles

- `GET` - Get roles for a user
- `POST` - Assign role to user (admin only)
- `DELETE` - Remove role from user (admin only)

### /api/sync-user (Updated)

- Now includes user roles in the response
- Returns `roles` array with role names

## Authentication Integration

### NextAuth Configuration

- Updated to fetch user roles during login
- Stores roles in JWT token and session
- Session now includes `roles` array

### User Sync API

- Fetches user roles from database
- Returns roles in the response
- Maintains backwards compatibility

## Utility Functions

### roleUtils.ts

- `assignRoleToUser(userId, roleName)` - Assign role to user
- `removeRoleFromUser(userId, roleName)` - Remove role from user
- `getUserRoles(userId)` - Get all roles for user
- `userHasRole(userId, roleName)` - Check if user has specific role
- `createDefaultRoles()` - Create default system roles

### permissions.ts

- `userHasPermission(userId, permission)` - Check specific permission
- `getUserPermissions(userId)` - Get all permissions for user
- `isAdmin(userId)` - Check if user is admin
- `userHasAllPermissions(userId, permissions)` - Check multiple permissions
  (AND)
- `userHasAnyPermission(userId, permissions)` - Check multiple permissions (OR)

## Permission Constants

Defined in `PERMISSIONS` object:

- User management: `users:read`, `users:write`, `users:delete`
- Employee management: `employees:read`, `employees:write`, `employees:delete`
- Attendance: `attendance:read`, `attendance:write`, `attendance:approve`
- Leave: `leave:read`, `leave:create`, `leave:approve`, `leave:delete`
- Payroll: `payroll:read`, `payroll:write`, `payroll:process`
- Payslips: `payslips:read`, `payslips:generate`
- Promotions: `promotions:read`, `promotions:write`
- Profile: `profile:read`, `profile:write`
- System: `*` (wildcard for admin)

## Test User Setup

Created test user with:

- Email: sudhasri321@gmail.com
- Password: password123
- Roles: admin, employee
- Linked Employee: EMP001

## Security Features

- Role-based authorization on API endpoints
- Permission-based access control
- Soft delete for roles and user roles
- Audit trail with assignedBy and assignedAt fields
- Session-based role validation

## Usage Examples

### Check if user has permission

```typescript
import { userHasPermission } from '@/lib/permissions';

const canManageUsers = await userHasPermission(userId, 'users:write');
```

### Assign role to user

```typescript
import { assignRoleToUser } from '@/lib/roleUtils';

await assignRoleToUser(userId, 'employee');
```

### API Authorization

```typescript
import { userHasRole } from '@/lib/roleUtils';

const isAdmin = await userHasRole(session.user.id, 'admin');
if (!isAdmin) {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  );
}
```

## Migration Notes

- Schema updated with Role and UserRole models
- Database reset and recreated with new schema
- All existing data preserved through setup script
- Backwards compatibility maintained for existing APIs
