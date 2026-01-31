// Base types for expenses
export interface Expense {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  isEqual: boolean;
  created_by: string;
  createdAt: Date;
  isPaid: boolean;
}

export interface GroupExpenseShare {
  id: string;
  title: string;
  amount: string;
  description: string | null;
  isEqual: boolean;
  created_by: string;
  createdAt: Date;
  shareAmount: string | null;
  isPaid: boolean;
  memberIds: string[];
}

// Array type for multiple expenses
export type Expenses = Expense[];

// Database schema types (inferred from Drizzle schema)
export interface ExpenseFromDB {
  id: string;
  title: string;
  amount: string; // numeric from DB
  description: string | null;
  created_by: string;
  group_id: string;
  isEqual: boolean;
  created_at: Date;
}

// Expense share type for individual member shares
export interface ExpenseShare {
  id: string;
  expense_id: string;
  member_id: string;
  share: string; // numeric from DB
  paid: boolean;
  created_at: Date;
}

// Extended expense type with shares information
export interface ExpenseWithShares extends ExpenseFromDB {
  shares?: ExpenseShare[];
}

// Props types for components
export interface ExpenseProps {
  expense: Expense;
}

export interface ExpensesProps {
  expenses: Expenses;
}

// Form types for creating/editing expenses
export interface CreateExpenseForm {
  title: string;
  amount: string;
  description?: string;
  isEqual: boolean;
  group_id: string;
}

export interface UpdateExpenseForm extends Partial<CreateExpenseForm> {
  id: string;
}

// API response types
export interface ExpenseResponse {
  success: boolean;
  data?: Expense;
  error?: string;
}

export interface ExpensesResponse {
  success: boolean;
  data?: Expenses;
  error?: string;
}
