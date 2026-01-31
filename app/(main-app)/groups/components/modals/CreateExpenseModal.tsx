"use client";

import * as React from "react";
import { CSSProperties, FunctionComponent, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import Select, { ClearIndicatorProps, MultiValue } from 'react-select';
import makeAnimated from 'react-select/animated';
import { CSSObject } from '@emotion/serialize';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddExpensePayload, useModalStore } from "@/app/stores/ModalProvider";
import { Member } from "@/app/types";
import { useAction } from "next-safe-action/hooks";
import { createExpense } from "@/app/(main-app)/actions/createExpense";
import { useParams, useRouter } from "next/navigation";

const CustomClearText: FunctionComponent = () => <>clear all</>;

type MemberOption = {
    value: string;
    label: string;
    member: Member;
};

const ClearIndicator = (props: ClearIndicatorProps<MemberOption, true>) => {
    const {
        children = <CustomClearText />,
        getStyles,
        innerProps: { ref, ...restInnerProps },
    } = props;
    return (
        <div
            {...restInnerProps}
            ref={ref}
            style={getStyles('clearIndicator', props) as CSSProperties}
        >
            <div style={{ padding: '0px 5px' }}>{children}</div>
        </div>
    );
};
const ClearIndicatorStyles = (
    base: CSSObject,
    state: ClearIndicatorProps<MemberOption>
): CSSObject => ({
    ...base,
    cursor: 'pointer',
    color: state.isFocused ? 'blue' : 'black',
});
export default function CreateExpenseModal() {
    const router = useRouter();

    const { isOpen, type, data, close } = useModalStore(
        useShallow((s) => ({
            isOpen: s.isOpen,
            type: s.type,
            data: s.data as AddExpensePayload,
            close: s.close,
        }))
    );
    const members = data?.members

    const open = isOpen && type === "add-expense";
    const params = useParams<{ id?: string | string[] }>();
    const groupId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<MemberOption[]>([]);
    const memberOptions: MemberOption[] = (members ?? []).map((member) => {
        const name = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();
        return {
            value: member.id,
            label: name,
            member,
        };
    });

    useEffect(() => {
        if (!open) return;
        setTitle("");
        setAmount("");
        setDescription("");
        setIsSubmitting(false);
    }, [open]);

    const canSubmit = title.trim().length > 0 && Number(amount) > 0 && !isSubmitting;

    const { execute: createExpenseAction } = useAction(createExpense, {
        onSuccess: ({ data }) => {
            debugger;
            setIsSubmitting(false);
            if (data?.isSuccess) {
                close();
                router.refresh();
            }
        },
        onError: () => {
            setIsSubmitting(false);
        },
    });

    const handleCreateExpense = () => {
        if (!groupId || isSubmitting) return;
        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
        debugger
        setIsSubmitting(true);

        const newSelectedMembers = selectedMembers.length
            ? selectedMembers.map((member) => member.value)
            : (members ?? []).map((member) => member.id);

        createExpenseAction({
            title: title.trim(),
            amount: parsedAmount,
            groupId,
            description: description.trim() ? description.trim() : undefined,
            isEqual: true,
            selectedMemberIds: newSelectedMembers
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="rounded">
                <DialogHeader>
                    <DialogTitle>New Expense</DialogTitle>
                    <DialogDescription>Add a simple expense to this group.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="expense-title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="expense-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Dinner at Cafe Roma"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-amount" className="text-sm font-medium">
                            Amount
                        </Label>
                        <Input
                            id="expense-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Select<MemberOption, true>
                            closeMenuOnSelect={false}
                            components={{ ClearIndicator }}
                            styles={{ clearIndicator: ClearIndicatorStyles }}
                            defaultValue={[]}
                            onChange={(value: MultiValue<MemberOption>) => setSelectedMembers([...value])}
                            isMulti
                            options={memberOptions}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Input
                            id="expense-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional notes"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={close} type="button">
                        Cancel
                    </Button>
                    <Button onClick={handleCreateExpense} disabled={!canSubmit} type="button">
                        {isSubmitting ? "Creating..." : "Create Expense"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
