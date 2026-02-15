"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { addMember } from "@/app/(main-app)/actions/addMember";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { inviteMember, resendInvite } from "@/app/(main-app)/actions/inviteMember";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { removeMember } from "@/lib/server/removeMember";
import { useModalStore } from "@/app/stores/ModalProvider";

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
};

const GroupMemberList = ({ groupId, groupMembers }: GroupMembers) => {
    const router = useRouter();

    const [isManageMode, setIsManageMode] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showSendFailDialog, setShowSendFailDialog] = useState(false);
    const [failedPayload, setFailedPayload] = useState<{ groupId: string; email: string } | null>(null);
    const openModal = useModalStore((modalStore) => modalStore.open)

    const trimmedEmail = inviteEmail.trim();

    const isEmailValid = useMemo(() => {
        if (!trimmedEmail) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    }, [trimmedEmail]);

    const { execute: inviteEmailHandler } = useAction(inviteMember, {
        onExecute: () => {
            setIsSubmitting(true);
            setInviteStatus(null);
            toast.loading("Adding member...", { id: "add-member" });
        },
        onSuccess: ({ data }) => {
            setIsSubmitting(false);

            if (!data.isSuccess && data.type === 'send-invite') {
                setFailedPayload({ groupId: data.groupId, email: data.email });
                setShowSendFailDialog(true);

            }

            if (data?.isSuccess) {
                toast.success(data.message ?? "Invite send.", { id: "add-member" });
                setInviteEmail("");
                router.refresh();


                return;
            }
            toast.error(data?.message ?? "Unable to add member.", {
                id: "add-member",
            });

        },
        onError: ({ error }: any) => {
            setIsSubmitting(false);
            // 1) Rate limit from handleServerError (recommended shape)
            const serverError = error?.serverError;
            if (serverError?.code === "RATE_LIMIT") {
                toast.error(
                    serverError.message ?? "Too many requests. Please slow down.",
                    {
                        id: "add-member",
                    },
                );
                return;
            }

            // 2) Zod / inputSchema validation errors (field errors)
            const validationEmailError =
                error?.validationErrors?.email?.[0] ||
                error?.validationErrors?.fieldErrors?.email?.[0];

            if (validationEmailError) {
                toast.error(validationEmailError, { id: "add-member" });
                return;
            }

            // 3) Generic fallback
            toast.error("Something went wrong. Please try again.", {
                id: "add-member",
            });
        },
    });

    const { execute: resend } = useAction(resendInvite, {
        onExecute: () => {
            setIsSubmitting(true);
        },
        onSuccess: ({ data }) => {
            if (data?.isSuccess) {
                toast.success(data.message ?? "Invite re-sent.");
                setShowSendFailDialog(false);
                setFailedPayload(null);
                return;
            }
            setIsSubmitting(false)
            toast.error(data?.message ?? "Failed to resend invite.");
        },
        onError: () => toast.error("Failed to resend invite."),
    });

    const handleAddMember = () => {
        if (!trimmedEmail) {
            toast.error("Please enter an email address.");
            return;
        }
        if (!isEmailValid) {
            toast.error("Please enter a valid email address.");
            return;
        }
        inviteEmailHandler({ groupId, email: trimmedEmail });
    };

    return (
        <div className="">
            <AlertDialog open={showSendFailDialog} onOpenChange={setShowSendFailDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Email failed to send</AlertDialogTitle>
                        <AlertDialogDescription>
                            The invite was created, but we couldn’t send the email. You can resend now or cancel and try later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowSendFailDialog(false);
                                setFailedPayload(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (!failedPayload) return;
                                resend({ groupId: failedPayload.groupId, email: failedPayload.email });
                            }}
                        // disabled={resendStatus === "executing"}
                        >
                            Resend
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Group members
                            </span>
                            <span className="text-xs tracking-wide text-gray-500 cursor-pointer hover:underline" onClick={() => setIsManageMode((prev) => !prev)}>
                                Manage Members
                            </span>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(event) => setInviteEmail(event.target.value)}
                                placeholder="member@email.com"
                                aria-label="Invite member email"
                                className="h-9 w-full sm:w-56"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (!isSubmitting) handleAddMember();
                                    }
                                }}
                            />

                            <Button
                                type="button"
                                onClick={handleAddMember}
                                disabled={isSubmitting || !trimmedEmail || !isEmailValid}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Add member"
                                )}
                            </Button>
                        </div>
                    </div>

                    {inviteStatus && (
                        <div
                            className="px-2 pb-2 text-xs font-medium text-green-600"
                            aria-live="polite"
                        >
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
                                    {isManageMode && (
                                        <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                            Action
                                        </th>
                                    )}
                                </tr>
                            </thead>
                        </table>

                        <div className="max-h-[280px] overflow-y-auto rounded-b-lg bg-white">
                            <table className="min-w-full text-gray-900">
                                <tbody>
                                    {groupMembers.map((member) => {
                                        const fullName =
                                            member.first_name === null && member.last_name === null
                                                ? member.email
                                                : `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

                                        return (
                                            <tr key={member.id} className="border-b last:border-none">
                                                <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                    {fullName}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                    Active
                                                </td>

                                                {isManageMode && (
                                                    <td className="whitespace-nowrap">

                                                        <span className="tracking-wide text-gray-500 cursor-pointer hover:underline" onClick={() => openModal('remove-member', { groupId: groupId, userId: member.user_id })}>
                                                            Remove
                                                        </span>

                                                    </td>
                                                )
                                                }
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* (Optional) Mobile view later */}
                </div>
            </div>
        </div >
    );
};

export default GroupMemberList;
