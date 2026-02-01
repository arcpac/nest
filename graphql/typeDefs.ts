// src/graphql/typeDefs.ts
import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

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
    type Query {
    group(groupId: ID!): Group
    }
`;
