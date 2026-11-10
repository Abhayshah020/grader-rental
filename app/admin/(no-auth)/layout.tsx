import { redirectAuthenticatedAdmin } from "@/lib/auth/page-guard";

export default async function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await redirectAuthenticatedAdmin();

  return (
    <>
      {children}
    </>
  );
}
