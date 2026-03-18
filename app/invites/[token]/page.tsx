import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getInviteByToken } from "./invite.queries";
import AcceptInviteClient from "./ui/AcceptInviteClient";

async function getUserOptional() {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
}
type Props = {
    params: Promise<{ token: string }>;
};
export default async function InviteTokenPage({ params }: Props) {
    const { token } = await params;
    // 1) check invite IF still valid
    const inviteRes = await getInviteByToken(token);
    if (!inviteRes.ok) {
        return (
            <div className="mx-auto max-w-lg p-6">
                <h1 className="text-xl font-semibold">Invite link problem</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {inviteRes.reason === "expired"
                        ? "This invite link has expired."
                        : inviteRes.reason === "already_used"
                            ? "This invite link has already been used."
                            : "We couldn't find this invite."}
                </p>
                <div className="mt-6">
                    <Link className="underline" href="/login">
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    const invite = inviteRes.invite;
    const user = await getUserOptional();

    // 2) If not logged in
    if (!user) {
        const nextUrl = `/invites/${token}`;

        return (
            <div className="mx-auto max-w-lg p-6">
                <h1 className="text-xl font-semibold">You’ve been invited</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Invitation for <span className="font-medium text-foreground">{invite.email}</span>
                    {invite.groupName ? (
                        <>
                            to join <span className="font-medium text-foreground">{invite.groupName}</span>
                        </>
                    ) : null}
                </p>

                <div className="mt-6 flex flex-col gap-3">
                    <Link
                        className="rounded-md bg-black px-4 py-2 text-white text-center"
                        href={`/login?redirect=${encodeURIComponent(nextUrl)}`}
                    >
                        Sign in to accept
                    </Link>

                    <Link
                        className="rounded-md border px-4 py-2 text-center"
                        href={`/signup?email=${encodeURIComponent(invite.email)}&redirect=${encodeURIComponent(nextUrl)}`}
                    >
                        Create account
                    </Link>
                </div>

                <p className="mt-6 text-xs text-muted-foreground">
                    If you’re already signed in with a different email, sign out first and sign in as {invite.email}.
                </p>
            </div>
        );
    }

    // 3) Logged in -> render client component that calls acceptInvite
    return (
        <AcceptInviteClient
            token={token}
            invitedEmail={invite.email}
            groupName={invite.groupName ?? undefined}
            loggedInEmail={user.email ?? ""}
        />
    );
}
