"use client";

import dynamic from "next/dynamic";

const CustomerSupportWidget = dynamic(
    () => import("@/components/customer-support-widget"),
    {
        ssr: false,
    }
);

export default function CustomerSupportLoader() {
    return <CustomerSupportWidget />;
}