import { Input } from "@/components/ui/input";
import React from "react";
import { getHouseholdId, getHouseholdMembers } from "../../../lib/houseHold";
import { RadioGroup } from "@/components/ui/radio-group";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clsx from "clsx";
import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";
import { ArrowBigLeft } from "lucide-react";
import MembersList from "./components/MembersList";
import HouseholdEditForm from "./components/HouseholdEditForm";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [household, members] = await Promise.all([
    getHouseholdId(id),
    getHouseholdMembers(id),
  ]);
  return (
    <>
      <HouseholdEditForm household={household} />
      <MembersList members={members} />
    </>
  );
}
