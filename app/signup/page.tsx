import { Toaster } from "sonner";
import SignupForm from "./components/SignupForm";
import Link from "next/link";

export default function SignupPage() {

  return (
    <main className="p-6 max-w-md mx-auto">
      <SignupForm />

    </main>
  );
}
