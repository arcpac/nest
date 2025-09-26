import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

import { redirect } from "next/navigation";
import GroupsView from "./components/GroupsView";

const GroupsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <GroupsView />;
};

export default GroupsPage;
