# Code Formatting and Linting Setup

This document outlines the complete Prettier and ESLint configuration
implemented for the payroll application.

## ✅ Completed Setup

### 1. Prettier Configuration

**Installed packages:**

- `prettier` - Core formatting tool
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier
- `eslint-plugin-prettier` - Integrates Prettier as an ESLint rule

**Configuration files:**

- `.prettierrc.json` - Prettier formatting rules
- `.prettierignore` - Files/directories to exclude from formatting

**Key formatting rules:**

- 100 character line width
- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5 compatible)
- Semicolons enabled
- LF line endings

### 2. ESLint Integration

**Updated `eslint.config.mjs`:**

- Extended `prettier` config to avoid rule conflicts
- Added custom rule for unused variables (allows `_` prefix)
- Added ignore patterns for generated files (`src/generated/**/*`)

### 3. Package.json Scripts

Added the following npm scripts:

```json
{
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "format:staged": "prettier --write --ignore-unknown"
}
```

### 4. Git Hooks (Husky + lint-staged)

**Installed:**

- `husky` - Git hooks manager
- `lint-staged` - Run commands on staged files

**Pre-commit hook:**

- Automatically formats staged files with Prettier
- Runs ESLint on staged files
- Prevents commits with formatting/linting errors

**Configuration in `package.json`:**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write", "git add"],
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "git add"]
  }
}
```

### 5. VS Code Integration

**`.vscode/settings.json`:**

- Set Prettier as default formatter
- Enable format on save
- Enable format on paste
- ESLint auto-fix on save
- Organize imports on save

**`.vscode/extensions.json`:**

- Recommended extensions for team consistency
- Prettier, ESLint, Tailwind CSS, etc.

### 6. Fixed Lint Issues

**Resolved issues in source files:**

- Removed unused import `SignInButton` from Footer.tsx
- Fixed `prefer-const` issues in leaveUtils.ts and attendance route
- Prefixed unused variables with `_` (employees page, regularization route,
  etc.)
- Removed unused `getUserRoles` import from holidays page
- Prefixed unused helper function in edge-logger.ts

**Ignored generated files:**

- Added `src/generated/**/*` to ESLint ignore patterns
- This excludes Prisma generated files from linting

## 🚀 Usage

### Automatic Formatting

- **VS Code**: Files auto-format on save
- **Pre-commit**: Staged files auto-format before commit

### Manual Commands

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Git Workflow

1. Make code changes
2. Stage files: `git add .`
3. Commit: `git commit -m "message"`
4. Pre-commit hook automatically:
   - Formats staged files
   - Runs ESLint
   - Fails commit if there are unfixable issues

## ✅ Current Status

- **ESLint**: ✅ No warnings or errors
- **Prettier**: ✅ All files properly formatted
- **Git Hooks**: ✅ Working correctly
- **VS Code**: ✅ Auto-formatting enabled
- **Generated Files**: ✅ Properly ignored

## 📝 Notes

1. **Unused Variables**: Use `_` prefix for intentionally unused variables
   (e.g., `_unusedParam`)
2. **Generated Files**: Prisma and other generated files are automatically
   ignored
3. **Team Consistency**: VS Code settings ensure consistent formatting across
   team members
4. **Pre-commit Safety**: Git hooks prevent badly formatted code from being
   committed

## 🔧 Troubleshooting

**If formatting isn't working in VS Code:**

1. Install recommended extensions
2. Reload VS Code
3. Check that Prettier is set as default formatter

**If pre-commit hook fails:**

1. Run `npm run format` manually
2. Run `npm run lint:fix` if needed
3. Stage and commit again

**To skip hooks (emergency only):**

```bash
git commit --no-verify -m "emergency commit"
```
