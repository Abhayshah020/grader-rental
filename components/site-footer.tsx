import Link from "next/link";
import { MapPin, Phone, ArrowUpRight } from "lucide-react";

export default function SiteFooter() {
  return <footer className="border-t border-[#e5eaee] bg-[#f7f9fa]">
    <div className="container-wide grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><div className="text-lg font-extrabold tracking-tight">SIRAHA GRADER ROLLER RENTAL SERVICE</div>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[#637381]">Heavy construction machinery rental support for road works, earthmoving, site preparation and infrastructure projects in Lahan, Siraha and surrounding areas.</p>
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold"><MapPin size={16}/> Lahan, Siraha, Nepal</p></div>
      <div><h3 className="mb-4 text-sm font-extrabold">Our Equipment</h3><div className="grid gap-3 text-sm text-[#637381]"><Link href="/grader">Motor Grader Rental</Link><Link href="/roller">Road Roller Rental</Link><Link href="/excavator">Excavator Rental</Link></div></div>
      <div><h3 className="mb-4 text-sm font-extrabold">Get in touch</h3><a href="tel:9702803911" className="flex items-center gap-2 text-sm font-bold"><Phone size={16}/> 9702803911</a><Link href="/booking" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#94650d]">Booking & enquiries <ArrowUpRight size={15}/></Link><p className="mt-3 text-xs text-[#7b8992]">Please call to confirm machine availability, rental terms and site arrangements.</p></div>
    </div>
    <div className="border-t border-[#e5eaee] py-5"><div className="container-wide flex flex-col justify-between gap-2 text-xs text-[#7b8992] sm:flex-row"><span>© {new Date().getFullYear()} Siraha Grader Roller Rental Service. All rights reserved.</span><span>Lahan, Siraha, Nepal</span></div></div>
  </footer>;
}
