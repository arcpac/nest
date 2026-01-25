import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ExpenseView from "./components/ExpenseView";
import { authOptions } from "@/lib/auth";
import { getUserExpenseShares } from "../actions/expenseList";


const ExpensePage = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/login");
    }
    const userId = session.user.id;

    const result = await getUserExpenseShares(userId);
    const { userExpenseShares } = result;
    return <ExpenseView userExpenseShares={userExpenseShares} />;

};

export default ExpensePage;
