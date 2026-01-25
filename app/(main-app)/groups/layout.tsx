import { getUserId } from "@/lib/auth";
import DataProvider from "@/app/DataProvider";
import { getUserGroups } from "../actions/groups";
import ModalProvider from "@/app/stores/ModalProvider";
import ModalOutlet from "./components/modals/ModalOutlet";


export default async function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ModalProvider>
      <ModalOutlet />
      {children}
    </ModalProvider>
  );
}
