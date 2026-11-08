
import MobileActionBar from "@/components/mobile-action-bar";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

import CustomerSupportLoader from "@/components/customer-support-loader";


export default function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
