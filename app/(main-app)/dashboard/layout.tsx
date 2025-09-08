export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 container">{children}</div>
    </div>
  );
}
