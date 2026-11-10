import { AdminNavbar } from "@/components/admin-navbar";
import { requirePageAdmin } from "@/lib/auth/page-guard";

export default async function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePageAdmin();

  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
