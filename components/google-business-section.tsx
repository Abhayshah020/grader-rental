import Image from "next/image";
import { ExternalLink, MapPin, Star } from "lucide-react";

const googleMapsUrl = "https://maps.app.goo.gl/zRrgM4DAVTPntQRi9";

export default function GoogleBusinessSection() {
  return (
    <>
      <section className="section-space"><div className="container-wide grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-end">

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#805600]">Find us on Google</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#182b3a] sm:text-3xl">Visit our business profile</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#637381]">View our office location, open our Google Business profile, and share your experience with other customers.</p>
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[#182b3a] px-5 text-sm font-bold text-white transition hover:bg-[#294354]">
            <MapPin size={17} /> View on Google Maps <ExternalLink size={14} />
          </a>
        </div>
        <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 self-start border border-[#e4e9ed] bg-white p-3 sm:self-center">
          <Image
            priority
            src="/google-business-qr.webp"
            alt="QR code for the business Google Maps profile"
            width={112}
            height={112}
            className="h-24 w-24 sm:h-28 sm:w-28"
          />
          <span className="max-w-32 text-sm font-bold leading-5 text-[#243746]">Scan to find our office <span className="mt-1 block text-xs font-medium text-[#58656e]">Google Maps profile</span></span>
        </a>
        <p className="text-xs leading-5 text-[#58656e] sm:col-span-2"><Star size={13} className="mr-1 inline-block -translate-y-px" /> After visiting, customers can leave a review from the Google Business profile.</p>
      </div></section>

    </>
  );
}
