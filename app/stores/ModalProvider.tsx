"use client"

import { PropsWithChildren, createContext, useContext, useState } from "react";
import { createStore, StoreApi } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

type ModalType = "pay-expense" | "add-expense" | "edit-expense" | null;

export type PayExpensePayload = {
    expense: {
        id: string;
        title?: string;
        yourShare: number | string;
    };
};

type ModalPayload = PayExpensePayload | unknown;

type ModalStore = {
    isOpen: boolean;
    type: ModalType;
    data?: ModalPayload;

    open: (type: Exclude<ModalType, null>, data?: ModalPayload) => void;
    close: () => void;
};

const ModalContext = createContext<StoreApi<ModalStore> | undefined>(undefined);

export default function ModalProvider({ children }: PropsWithChildren) {
    const [store] = useState(() =>
        createStore<ModalStore>((set) => ({
            isOpen: false,
            type: null,
            data: undefined,

            open: (type, data) => set({ isOpen: true, type, data }),
            close: () => set({ isOpen: false, type: null, data: undefined }),
        }))
    );

    return <ModalContext.Provider value={store}>{children}</ModalContext.Provider>;
}

export function useModalStore<T>(
    selector: (state: ModalStore) => T,
    equalityFn?: (a: T, b: T) => boolean
) {
    const store = useContext(ModalContext);
    if (!store) throw new Error("useModalStore must be used within a ModalProvider");
    return useStoreWithEqualityFn(store, selector, equalityFn);
}
