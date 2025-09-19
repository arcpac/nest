"use client";
import { PropsWithChildren, useContext, useState } from "react";
import { createStore, StoreApi, useStore } from "zustand";
import { createContext } from "react";

type DataStore = {
  count: number;
  totalDebt: string;
  totalActiveExpenses: number;
  add: () => void;
};

const DataContext = createContext<StoreApi<DataStore> | undefined>(undefined);

type DataProviderProps = PropsWithChildren & {
  initialCount: number;
  initialExpenseData: {
    totalDebt: string;
    totalActiveExpenses: number;
  };
};

export default function DataProvider({
  children,
  initialCount,
  initialExpenseData,
}: DataProviderProps) {
  const [store] = useState(() =>
    createStore<DataStore>((set) => ({
      count: initialCount,
      ...initialExpenseData,
      add: () => set((state) => ({ count: state.count + 1 })),
    }))
  );

  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useDataStore<T>(selector: (state: DataStore) => T) {
  const store = useContext(DataContext);
  if (!store) {
    throw new Error("Missing Missin");
  }
  return useStore(store, selector);
}

export const useData = () => useDataStore((state) => state.count);
