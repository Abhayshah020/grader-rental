"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CustomerSupportWidget = dynamic(
    () => import("@/components/customer-support-widget"),
    {
        ssr: false,
    }
);

export default function CustomerSupportLoader() {
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        let timeoutId: number | undefined;
        let idleId: number | undefined;

        const loadWidget = () => setShouldLoad(true);

        if (typeof window.requestIdleCallback === "function") {
            idleId = window.requestIdleCallback(loadWidget, {
                timeout: 2500,
            });
        } else {
            timeoutId = window.setTimeout(loadWidget, 1500);
        }

        return () => {
            if (idleId !== undefined) {
                window.cancelIdleCallback(idleId);
            }

            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);
    if (!shouldLoad) return null;

    return <CustomerSupportWidget />;
}