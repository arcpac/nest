"use client";

import { PropsWithChildren, useContext, useState, createContext } from "react";
import { createStore, StoreApi, useStore } from "zustand";
import { Group } from "./types";

type DataStore = {
  count: number;
  groups: Group[];
  totalDebt: string;
  totalActiveExpenses: number;
  add: () => void;
};

const DataContext = createContext<StoreApi<DataStore> | undefined>(undefined);

type DataProviderProps = PropsWithChildren<{
  initialCount: number;
  initialGroups: Group[];
  initialExpenseData: {
    totalDebt: string;
    totalActiveExpenses: number;
  };
}>;

export default function DataProvider({
  children,
  initialCount,
  initialGroups,
  initialExpenseData,
}: DataProviderProps) {
  const [store] = useState(() =>
    createStore<DataStore>((set) => ({
      count: initialCount,
      groups: initialGroups,
      totalDebt: initialExpenseData.totalDebt,
      totalActiveExpenses: initialExpenseData.totalActiveExpenses,
      add: () => set((state) => ({ count: state.count + 1 })),
    }))
  );

  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useDataStore<T>(selector: (state: DataStore) => T) {
  const store = useContext(DataContext);
  if (!store) {
    throw new Error("useDataStore must be used within a DataProvider");
  }
  return useStore(store, selector);
}
