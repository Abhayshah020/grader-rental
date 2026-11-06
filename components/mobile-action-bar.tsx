
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarCheck, Phone } from "lucide-react";

export default function MobileActionBar() {
  const [formFocused, setFormFocused] = useState(false);

  useEffect(() => {
    function handleFocusIn(event: FocusEvent) {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        target.closest("#booking-form") &&
        target.matches("input, textarea, select")
      ) {
        setFormFocused(true);
      }
    }

    function handleFocusOut() {
      // Wait for the next field to receive focus before restoring the bar.
      window.setTimeout(() => {
        const active = document.activeElement;

        const stillEditing =
          active instanceof HTMLElement &&
          active.closest("#booking-form") !== null &&
          active.matches("input, textarea, select");

        setFormFocused(stillEditing);
      }, 50);
    }

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Completely remove the component while filling in the form.
  if (formFocused) return null;

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-[40] grid grid-cols-2 gap-2 border-t border-[#e4e9ed] bg-white/95 px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(20,38,52,0.10)] backdrop-blur lg:hidden"
    >
      <a
        href="tel:9702803911"
        className="flex min-h-12 items-center justify-center gap-2 border border-[#d6dee3] bg-white px-3 text-sm font-extrabold text-[#182b3a]"
      >
        <Phone size={17} aria-hidden="true" />
        Call Now
      </a>

      <Link
        href="/booking#enquiry-heading"
        className="flex min-h-12 items-center justify-center gap-2 bg-[#e5a928] px-3 text-sm font-extrabold text-[#182b3a]"
      >
        <CalendarCheck size={17} aria-hidden="true" />
        Book Machine
      </Link>
    </nav>
  );
}