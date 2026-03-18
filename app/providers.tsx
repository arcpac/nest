"use client";

import { ApolloProvider } from "@apollo/client/react";
import { makeApolloClient } from "@/lib/apollo-client";

const client = makeApolloClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
