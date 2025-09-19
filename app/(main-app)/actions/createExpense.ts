"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { flattenValidationErrors } from "next-safe-action";
import { expenses, expense_shares, members } from "@/db/schema";
import { db } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const expenseSchema = z.object({
  title: z.string().min(1).max(50),
  amount: z.number().min(0.01),
  groupId: z.string().min(1),
  description: z.string().optional(),
  isEqual: z.boolean(),
  customShares: z.record(z.string(), z.string()).optional(),
  selectedMemberIds: z.array(z.string()).optional(),
});

export const createExpense = actionClient
  .inputSchema(expenseSchema, {
    handleValidationErrorsShape: async (ve) =>
      flattenValidationErrors(ve).fieldErrors,
  })
  .action(
    async ({
      parsedInput: {
        title,
        amount,
        groupId,
        isEqual,
        description,
        customShares,
        selectedMemberIds,
      },
    }) => {
      console.log("customShares", customShares);
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        redirect("/login");
      }

      // Validate amount
      if (amount <= 0) {
        return {
          isSuccess: false,
          message: "Amount must be greater than 0",
        };
      }

      // Get all members for this group
      const groupMembers = await db
        .select({
          id: members.id,
          user_id: members.user_id,
        })
        .from(members)
        .where(eq(members.group_id, groupId));

      if (groupMembers.length === 0) {
        return {
          isSuccess: false,
          message: "No members found in this group",
        };
      }

      // Create the expense
      const [newExpense] = await db
        .insert(expenses)
        .values({
          title,
          amount: amount.toString(),
          description,
          created_by: session.user.id,
          group_id: groupId,
          isEqual,
        })
        .returning();

      // Create expense shares
      if (isEqual) {
        // Equal split among all members or selected subset
        const memberSet = new Set(selectedMemberIds && selectedMemberIds.length > 0 ? selectedMemberIds : groupMembers.map((m) => m.id));
        const targetMembers = groupMembers.filter((m) => memberSet.has(m.id));
        if (targetMembers.length === 0) {
          return {
            isSuccess: false,
            message: "Please select at least one member",
          };
        }
        const shareAmount = amount / targetMembers.length;
        const shareEntries = targetMembers.map((member) => ({
          expense_id: newExpense.id,
          member_id: member.id,
          share: shareAmount.toFixed(2),
          paid: false,
        }));

        await db.insert(expense_shares).values(shareEntries);
      } else {
        // Custom split - only include selected members
        if (!selectedMemberIds || selectedMemberIds.length === 0) {
          return {
            isSuccess: false,
            message: "Please select at least one member for custom split",
          };
        }
        
        const customShareEntries = selectedMemberIds.map((memberId) => {
          const customAmount = parseFloat(customShares?.[memberId] || "0");
          return {
            expense_id: newExpense.id,
            member_id: memberId,
            share: customAmount.toFixed(2),
            paid: false,
          };
        });

        await db.insert(expense_shares).values(customShareEntries);
      }

      return {
        isSuccess: true,
        message: "Expense successfully created",
        expenseId: newExpense.id,
      };
    }
  );
