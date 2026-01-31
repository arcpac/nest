import { db } from "@/db";
import { groups } from "@/db/schema";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { desc } from "drizzle-orm";
import { gql } from "graphql-tag";

const typeDefs = gql`
  scalar DateTime

  type Group {
    id: ID!
    name: String!
    active: Boolean!
    created_by: ID!
    created_at: DateTime!
  }

  type Query {
    hello: String!
    testFetchGroups(limit: Int = 20): [Group!]!
  }
`;
const resolvers = {
    Query: {
      hello: () => "world",
  
      testFetchGroups: async (_: unknown, args: { limit?: number }) => {
        const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
  
        return db
          .select()
          .from(groups)
          .orderBy(desc(groups.created_at))
          .limit(limit);
      },
    },
  };

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
