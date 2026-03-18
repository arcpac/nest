import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/typeDefs";
import { resolvers } from "@/graphql/resolvers";
import { NextRequest } from "next/server";
import { makeContext } from "@/graphql/context";



const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => makeContext(req)
});

export { handler as GET, handler as POST };
