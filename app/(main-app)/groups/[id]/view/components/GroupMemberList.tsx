import React from "react";


interface GroupMemberProps {
    id: string;
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    joined_at: Date;
}

type GroupMembers = {
    groupMembers: GroupMemberProps[]
}

const GroupMemberList = ({ groupMembers }: GroupMembers) => {
    return (
        <div className="">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 md:p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Group members
                        </span>
                    </div>

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

                        {/* Scroll container for body */}
                        <div className="max-h-[280px] overflow-y-auto rounded-b-lg bg-white">
                            <table className="min-w-full text-gray-900">
                                <tbody>
                                    {groupMembers.map((member) => (
                                        <tr key={member.id} className="border-b last:border-none">
                                            <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                {member.first_name} {member.last_name}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-5 text-sm sm:pl-6">
                                                Active
                                            </td>
                                        </tr>
                                    ))}
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
