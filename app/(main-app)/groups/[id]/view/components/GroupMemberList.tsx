"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { addMember } from "@/app/(main-app)/actions/addMember";
interface GroupMemberProps {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    joined_at: Date;
}

type GroupMembers = {
    groupId: string;
    groupMembers: GroupMemberProps[];
}

const GroupMemberList = ({ groupId, groupMembers }: GroupMembers) => {
    const router = useRouter();
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { execute: addMemberAction } = useAction(addMember, {
        onSuccess: ({ data }) => {
            setIsSubmitting(false);
            if (data?.message) {
                setInviteStatus(data.message);
            }
            if (data?.isSuccess) {
                router.refresh();
            }
        },
        onError: () => {
            setIsSubmitting(false);
        },
    });

    const handleInvite = () => {
        const normalizedEmail = inviteEmail.trim().toLowerCase();
        if (!normalizedEmail || isSubmitting) {
            return;
        }

        setInviteStatus(null);
        setIsSubmitting(true);
        addMemberAction({ groupId, email: normalizedEmail });
        setInviteEmail("");
    };

    return (
        <div className="">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Group members
                        </span>
                        <form
                            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleInvite();
                            }}
                        >
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(event) => setInviteEmail(event.target.value)}
                                placeholder="member@email.com"
                                aria-label="Invite member email"
                                className="h-9 w-full sm:w-56"
                            />
                            <button
                                type="submit"
                                className="nest-button nest-button--outline"
                                disabled={isSubmitting || inviteEmail.trim().length === 0}
                            >
                                Invite member
                            </button>
                        </form>
                    </div>
                    {inviteStatus && (
                        <div className="px-2 pb-2 text-xs font-medium text-green-600" aria-live="polite">
                            {inviteStatus}
                        </div>
                    )}

                    <div className="hidden md:block">
                        <table className="min-w-full text-gray-900">
                            <thead className="rounded-lg text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                        Name
                                    </th>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                        </table>

                        <div className="max-h-[280px] overflow-y-auto rounded-b-lg bg-white">
                            <table className="min-w-full text-gray-900">
                                <tbody>
                                    {groupMembers.map((member) => {
                                        const fullName = member.first_name === null && member.last_name === null ? member.email : `${member.first_name} ${member.last_name}`
                                        return (
                                            <tr key={member.id} className="border-b last:border-none">
                                                <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                    {fullName}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                    Active
                                                </td>
                                            </tr>
                                        )
                                    }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* (Optional) Mobile view later */}
                </div>
            </div>
        </div>
    );
};

export default GroupMemberList;
