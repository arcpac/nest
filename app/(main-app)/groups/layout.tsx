import ModalProvider from "@/app/stores/ModalProvider";
import ModalOutlet from "./components/modals/ModalOutlet";
import { Toaster } from "@/components/ui/sonner";


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
