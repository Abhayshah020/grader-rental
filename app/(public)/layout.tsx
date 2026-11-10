
import MobileActionBar from "@/components/mobile-action-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

import CustomerSupportLoader from "@/components/customer-support-loader";
import { redirectAuthenticatedAdmin } from "@/lib/auth/page-guard";


export default async function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await redirectAuthenticatedAdmin();
  
  return (
    <>
      <SiteHeader />
      {children}
      <MobileActionBar />
      <SiteFooter />
      <CustomerSupportLoader />
    </>
  );
}
