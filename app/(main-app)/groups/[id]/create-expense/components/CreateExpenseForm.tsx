"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createExpense } from "@/app/(main-app)/actions/createExpense";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  joined_at: Date;
}

interface CreateExpenseFormProps {
  groupId: string;
  members: Member[];
}

export default function CreateExpenseForm({
  groupId,
  members,
}: CreateExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "selected" | "custom">("equal");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [customSplitMemberIds, setCustomSplitMemberIds] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { execute: handleCreateExpense } = useAction(createExpense, {
    onSuccess({ data }) {
      if (data.isSuccess) {
        toast("Expense created", {
          description: "Redirecting to group view...",
          icon: <CircleCheck className="text-green-500" />,
        });
        router.push(`/groups/${groupId}/view`);
      }
    },
    onError({ error }) {
      console.error("Error creating expense:", error);
    },
  });

  const handleCustomShareChange = (memberId: string, value: string) => {
    setCustomShares((prev) => ({
      ...prev,
      [memberId]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter expense title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description (optional)"
            />
          </div>

          <div className="space-y-4">
            <Label>Split Type</Label>
            <RadioGroup
              value={splitType}
              onValueChange={(value) => setSplitType(value as "equal" | "selected" | "custom")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="split-equal" />
                <Label htmlFor="split-equal">Equal split among all members</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="split-selected" />
                <Label htmlFor="split-selected">Selected member/s</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="split-custom" />
                <Label htmlFor="split-custom">Custom split</Label>
              </div>
            </RadioGroup>
          </div>

          {splitType === "selected" && (
            <div className="space-y-3">
              <Label>Select members to split equally</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map((member) => {
                  const name = member.first_name && member.last_name
                    ? `${member.first_name} ${member.last_name}`
                    : `${member.email}`;
                  const checked = selectedMemberIds.includes(member.id);
                  return (
                    <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedMemberIds((prev) =>
                            e.target.checked
                              ? [...prev, member.id]
                              : prev.filter((id) => id !== member.id)
                          );
                        }}
                      />
                      <span>{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {splitType === "custom" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Select members for custom split</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((member) => {
                    const name = member.first_name && member.last_name
                      ? `${member.first_name} ${member.last_name}`
                      : `${member.email}`;
                    const checked = customSplitMemberIds.includes(member.id);
                    return (
                      <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={(e) => {
                            setCustomSplitMemberIds((prev) =>
                              e.target.checked
                                ? [...prev, member.id]
                                : prev.filter((id) => id !== member.id)
                            );
                            // Clear custom share when unchecking member
                            if (!e.target.checked) {
                              setCustomShares((prev) => {
                                const newShares = { ...prev };
                                delete newShares[member.id];
                                return newShares;
                              });
                            }
                          }}
                        />
                        <span>{name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {customSplitMemberIds.length > 0 && (
                <div className="space-y-4">
                  <Label>Custom Shares</Label>
                  <div className="space-y-2">
                    {customSplitMemberIds.map((memberId) => {
                      const member = members.find(m => m.id === memberId);
                      if (!member) return null;
                      return (
                        <div key={member.id} className="flex flex-wrap items-center space-x-2">
                          <Label htmlFor={`share-${member.id}`} className="w-32">
                            {member.first_name && member.last_name
                              ? `${member.first_name} ${member.last_name}`
                              : `${member.email}`}
                          </Label>
                          <Input
                            id={`share-${member.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={customShares[member.id] || ""}
                            onChange={(e) =>
                              handleCustomShareChange(member.id, e.target.value)
                            }
                            placeholder="0.00"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              onClick={() => {
                const isEqual = splitType !== "custom";
                handleCreateExpense({
                  title,
                  amount: parseFloat(amount) || 0,
                  description: description || undefined,
                  isEqual,
                  groupId,
                  customShares: splitType === "custom" ? customShares : {},
                  selectedMemberIds: splitType === "selected" ? selectedMemberIds : splitType === "custom" ? customSplitMemberIds : [],
                });
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Expense"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/groups/${groupId}/view`)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
