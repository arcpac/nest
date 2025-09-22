# Types Documentation

This directory contains all TypeScript type definitions for the Next.js application.

## File Structure

- `index.ts` - Main export file that re-exports all types
- `expense.ts` - Expense-related types and interfaces
- `common.ts` - Common types used across the application
- `next-auth.d.ts` - NextAuth type extensions

## Usage

Import types from the main index file:

```typescript
import { Expense, Expenses, User, Group } from '@/app/types';
```

## Type Categories

### Expense Types
- `Expense` - Single expense object
- `Expenses` - Array of expenses
- `ExpenseFromDB` - Database schema type for expenses
- `ExpenseShare` - Individual member share of an expense
- `ExpenseWithShares` - Expense with associated shares
- `CreateExpenseForm` - Form data for creating expenses
- `UpdateExpenseForm` - Form data for updating expenses

### Common Types
- `User` - User object
- `Group` - Group object
- `GroupWithCreator` - Group with creator information
- `Member` - Group member object
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Paginated API response
- `FormState` - Form validation state
- `Status` - Loading/status states

## Best Practices

1. **Centralized Types**: All types are defined in this directory and exported through `index.ts`
2. **Consistent Naming**: Use PascalCase for interfaces and types
3. **Generic Types**: Use generics for reusable types like `ApiResponse<T>`
4. **Database Alignment**: Types should align with your database schema
5. **Component Props**: Define specific prop types for components when needed

## Adding New Types

1. Create or update the appropriate file in this directory
2. Export the new types from `index.ts`
3. Update this README if adding new categories
4. Use the types consistently across your application
