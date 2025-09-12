// // store/householdStore.ts
// import { create } from "zustand";

// type Household = {
//   id: string;
//   name: string;
// };

// type HouseholdState = {
//   households: Household[];
//   setHouseholds: (households: Household[]) => void;
//   addHousehold: (household: Household) => void;
//   removeHousehold: (id: string) => void;
// };

// export const useHouseholdStore = create<HouseholdState>((set) => ({
//   households: [],
//   setHouseholds: (households) => set({ households }),
//   addHousehold: (household) =>
//     set((state) => ({ households: [...state.households, household] })),
//   removeHousehold: (id) =>
//     set((state) => ({
//       households: state.households.filter((h) => h.id !== id),
//     })),
// }));

// export const useHouseholds = () =>
//   useHouseholdStore((state) => state.households);
