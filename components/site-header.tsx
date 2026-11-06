
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone, HardHat, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const links = [
  ["Home", "/"],
  ["Grader", "/grader"],
  ["Roller", "/roller"],
  ["Excavator", "/excavator"],
  ["Booking & Contact", "/booking"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <header className="sticky z-[30] top-0 border-b border-[#e8ecef] bg-white/95 backdrop-blur">
      <div className="container-wide flex h-[78px] items-center justify-between gap-5">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#f2b638] text-[#182b3a]">
            <Image
              src="/navLogo.webp"
              alt="SIRAHA Logo"
              width={69}
              priority
              height={69}
              sizes="69px"
              quality={80}
              className="h-full w-full object-contain"
            />
          </span>

          <span className="leading-tight">
            <strong className=" text-[15px] font-extrabold tracking-tight">
              SIRAHA
            </strong>
            <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#52616b]">
              Grader Roller Rental Service
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] font-semibold text-[#425463] transition hover:text-[#805600]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:9702803911"
            className="flex items-center gap-2 text-sm font-bold"
          >
            <Phone size={16} />
            9702803911
          </a>

          <Link
            href="/booking"
            className="btn-primary !px-4 !py-3 text-sm"
          >
            Request a Booking
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
          className="p-2 lg:hidden"
        >
          {open ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile drawer and backdrop */}
      <div
        className={`fixed top-0 bottom-0 z-[1000] lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* Left-to-right sliding drawer */}
        <nav
          id="mobile-navigation"
          className={`
            absolute left-0 top-0 flex h-[100dvh] w-[100dvw] 
            flex-col overflow-y-auto bg-white shadow-2xl transition-transform 
            duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}
            `}
        >
          <div className="flex items-center align-center justify-between border-b border-[#edf0f2] px-5 py-5">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#f2b638] text-[#182b3a]">
                <Image
                  src="/navLogo.webp"
                  alt="SIRAHA Logo"
                  width={69}
                  priority
                  height={69}
                  sizes="69px"
                  quality={80}
                  className="h-full w-full object-contain"
                />
              </span>

              <span className="leading-tight">
                <strong className=" text-[15px] font-extrabold tracking-tight">
                  SIRAHA
                </strong>
                <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#52616b]">
                  Grader Roller Rental Service
                </span>
              </span>
            </Link>


            <button
              type="button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
              className="p-2 lg:hidden"
            >
              {open ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>

          <div className="flex-1 px-5 py-20">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[.15em] text-[#9aa5ad]">
              Navigation
            </p>
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-[#edf0f2] py-4 text-[15px] font-bold text-[#263b4b] transition-colors hover:text-[#805600]"
              >
                {label}
                <ArrowUpRight size={17} className="text-[#805600]" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
