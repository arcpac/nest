export default async function HouseHoldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-screen px-50">{children}</div>;
}
