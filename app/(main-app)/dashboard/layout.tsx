import DataProvider from "@/app/DataProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
