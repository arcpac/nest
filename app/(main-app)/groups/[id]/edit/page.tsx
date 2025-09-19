import React from "react";

import MembersList from "./components/MembersList";
import GroupEditForm from "./components/GroupEditForm";
import { getGroupWithMembers } from "@/app/(main-app)/actions/groups";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const result = await getGroupWithMembers(id);
  if (!result) return <></>;
  const { group, members } = result;
  return (
    <div>
      <GroupEditForm group={group} />
      <MembersList members={members} />
    </div>
  );
}
