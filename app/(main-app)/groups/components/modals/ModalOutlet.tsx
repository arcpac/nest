'use client'

import React from "react";
import PayExpenseModal from "./PayExpenseModal";
import CreateExpenseModal from "./CreateExpenseModal";
import DeleteExpensesModal from "./DeleteExpensesModal";
import EditExpenseModal from "./EditExpenseModal";
import { useDataStore } from "@/app/DataProvider";
import { useShallow } from "zustand/react/shallow";
import { useModalStore } from "@/app/stores/ModalProvider";

const ModalOutlet = () => {
    const { type } = useModalStore(
        useShallow((s) => ({
            type: s.type,
        }))
    );
    return (
        <>
            {type === 'pay-expense' && <PayExpenseModal />}
            {type === 'add-expense' && <CreateExpenseModal />}
            {type === 'edit-expense' && <EditExpenseModal />}
            {type === 'delete-expenses' && <DeleteExpensesModal />}
        </>
    );
}

export default ModalOutlet
