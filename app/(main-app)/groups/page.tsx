import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

import { getUserGroups } from "../dashboard/lib/groups";
import { redirect } from "next/navigation";
import GroupsView from "./components/GroupsView";

const GroupsPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { userGroups: groups, totalDebt } = await getUserGroups(
    session.user.id
  );

  console.log('groups', groups)

  return <GroupsView groups={groups} totalDebt={totalDebt} />;
};

export default GroupsPage;
