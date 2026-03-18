// src/graphql/typeDefs.ts
import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  type DashboardSummary {
    totalDebt: Float!
  }

  type User {
    id: ID!
    email: String!
  }

  type Member {
    id: ID!
    user_id: ID!
    group_id: ID!
    first_name: String
    last_name: String
    email: String!
    joined_at: DateTime!
    user: User
  }

  type Group {
    id: ID!
    name: String!
    active: Boolean!
    created_by: ID!
    created_at: DateTime!
    members: [Member!]!
  }
  type Expense {
    id: ID!
    title: String!
    amount: Float!        
    description: String
    myShare: Float!
    isEqual: Boolean!
    created_by: ID!
    created_at: DateTime!
    isPaid: Boolean!
    expenseShareId: ID
  }
  type Query {
    group(groupId: ID!): Group
    getGroups(limit: Int = 20): [Group!]!
    getGroupExpenses(groupId: ID!, limit: Int = 20): [Expense!]!
    userExpenseShares(userId: ID!, limit: Int = 10): [Expense!]!
    dashboardSummary: DashboardSummary!
  }

  type PayResult {
    isSuccess: Boolean!
    message: String
    updatedCount: Int!
  }

  type Mutation {
    payExpenseShares(expenseIds: [ID!]!): PayResult!
  }
`;
