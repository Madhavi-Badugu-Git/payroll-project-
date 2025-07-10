# Tests

This folder contains all test scripts for the payroll application.

## Test Files

- `test-auth-*.mjs` - Authentication and authorization tests
- `test-employee*.mjs` - Employee management tests
- `test-permissions.mjs` - Role-based access control tests
- `test-roles.mjs` - Role management tests
- `test-session*.mjs` - Session management tests
- `test-sync*.mjs` - User sync API tests
- `test-user*.mjs` - User management tests
- `test-hours-calc.mjs` - Working hours calculation tests
- `test-timezone-fix.mjs` - Timezone handling tests

## Running Tests

To run any test file:

```bash
node tests/test-[name].mjs
```

Example:

```bash
node tests/test-permissions.mjs
```
