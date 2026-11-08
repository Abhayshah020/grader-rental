import { AdminNavbar } from "@/components/admin-navbar";

export default function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
