"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, CalendarCheck, MapPin } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "Grader Rental", href: "/grader" },
  { label: "Road Roller Rental", href: "/roller" },
  { label: "Excavator Rental", href: "/excavator" },
  { label: "Booking & Contact", href: "/booking" },
];

export default function MobileNavigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation-drawer"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center border border-[#e4e9ed] bg-white text-[#182b3a] lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[70] bg-[#101d28]/45 transition-opacity duration-300 lg:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[80] flex h-[100vh] h-[100dvh] w-[min(88vw,390px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex min-h-20 items-center justify-between border-b border-[#e8ecef] px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8791c]">Siraha, Nepal</p>
            <p className="mt-1 text-base font-extrabold text-[#182b3a]">Equipment Rental</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="flex h-10 w-10 items-center justify-center border border-[#e4e9ed] text-[#182b3a]">
            <X size={21} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-5" aria-label="Mobile navigation links">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#87939c]">Explore</p>
          <div className="flex flex-col">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#edf0f2] py-4 text-[15px] font-bold text-[#243746] transition-colors hover:text-[#a8791c]">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-3 border-t border-[#e8ecef] p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <a href="tel:9702803911" className="flex min-h-12 items-center justify-center gap-2 border border-[#d6dee3] font-bold text-[#182b3a]"><Phone size={17} /> 9702803911</a>
          <Link href="/booking" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center gap-2 bg-[#e5a928] font-extrabold text-[#182b3a]"><CalendarCheck size={17} /> Book a Machine</Link>
          <a href="https://maps.app.goo.gl/zRrgM4DAVTPntQRi9" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#64727c]"><MapPin size={15} /> View office on Google Maps</a>
        </div>
      </aside>
    </>
  );
}
