import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Phone, ShieldCheck, Clock3, HardHat, ClipboardCheck, Truck } from "lucide-react";
import MachineCard from "@/components/machine-card";
import GoogleBusinessSection from "@/components/google-business-section";
import Image from "next/image";

const machines = [
  { title: "Motor Grader", subtitle: "Precision road shaping", image: "/grader.webp", href: "/grader", description: "For road formation, surface levelling, shoulder shaping and preparing a consistent base for the next stage of construction." },
  { title: "Road Roller", subtitle: "Reliable compaction", image: "/roller.webp", href: "/roller", description: "For compacting soil, gravel and asphalt surfaces to support stronger, more even roads and project foundations." },
  { title: "Excavator", subtitle: "Earthmoving capability", image: "/excavator.webp", href: "/excavator", description: "For excavation, trenching, foundation work, loading, site clearing and a wide range of earthmoving tasks." }
];
const faqs = [
  ["Which machines are currently available for rent?", "We currently offer grader, road roller and excavator rental. Contact us to confirm the machine and dates available for your project."],
  ["Where is your rental service located?", "Our rental service is based in Lahan, Siraha. Contact us with your project location so we can discuss service arrangements."],
  ["How do I request a booking?", "Use the booking form on this website or call 9702803911. Share your machine requirement, rental dates and work location."],
  ["How is the rental price decided?", "Rental pricing can depend on the machine, duration, site location, transport and operating arrangements. Please contact us for a project-specific quotation."],
  ["Can I enquire before confirming a rental?", "Yes. You can choose General Contact in the form to ask questions before making a booking."]
];
export default function Home() {
  return <main>

    <section className="relative min-h-[620px] overflow-hidden bg-[#101f2b]">
      {/* Background image */}
      <Image
        src="/grader-2-low.webp"
        alt="Motor grader preparing a road surface"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[58%_center]"
      />

      {/* Image overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#101f2b]/95 via-[#101f2b]/75 to-[#101f2b]/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101f2b]/45 via-transparent to-[#101f2b]/10" />

      <div className="container-wide relative flex min-h-[620px] items-center py-20 sm:py-24">
        <div className="max-w-[690px] text-white">

          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-3">
            <span className="h-[2px] w-9 bg-[#f2bd4e]" />
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#f2bd4e]">
              Heavy Equipment Rental · Lahan, Siraha
            </p>
          </div>

          {/* Heading */}
          <h1 className="text-[35px] font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[64px]">
            Reliable Equipment for{" "}
            <span className="text-[#f2bd4e]">
              Every Road Project.
            </span>
          </h1>
          {/* Actions */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/booking#enquiry-heading"
              className="btn-primary inline-flex items-center gap-3 px-7 py-4"
            >
              Request a machine
              <ArrowRight size={18} />
            </Link>

            <a
              href="tel:9702803911"
              className="inline-flex items-center gap-3 border border-white/40 px-6 py-4 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
            >
              <Phone size={17} />
              9702803911
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/20 pt-6">
            <div>
              <p className="text-sm font-bold text-white">Multiple Equipment</p>
              <p className="mt-1 text-xs text-white/60">Grader · Roller · Excavator</p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Local Service</p>
              <p className="mt-1 text-xs text-white/60">Based in Lahan, Siraha</p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Project-Based Rental</p>
              <p className="mt-1 text-xs text-white/60">Discuss your requirements</p>
            </div>
          </div>

        </div>
      </div>
    </section>


    <section className="section-space"><div className="container-wide">
      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end"><div><p className="eyebrow">About our rental service</p><h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight sm:text-4xl">Practical equipment support for demanding construction work.</h2></div>
        <p className="text-[15px] leading-8 text-[#637381] text-justify">Construction schedules depend on having the right equipment at the right stage of a project. Siraha Grader Roller Rental Service connects contractors, builders and project teams with heavy machinery for essential site operations. Whether you are preparing a road, compacting a surface or carrying out excavation, tell us what the work requires and we will discuss the suitable rental arrangement.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {[["Local coordination", "Based in Lahan, with enquiries welcome from nearby project locations."], ["Clear communication", "Discuss the machine, dates, location and rental requirements directly."], ["Project-focused service", "Tell us about your work so we can understand the equipment needed."], ["Operator Provided", "All our machines are operated by trained professionals for safe and efficient use."]].map(([t, d], i) => <div key={t} className="border-t-2 border-[#e5a928] bg-[#f8fafb] p-6"><p className="text-xs font-bold text-[#805600]">0{i + 1}</p><h3 className="mt-4 text-xl font-extrabold">{t}</h3><p className="mt-3 text-sm leading-7 text-[#637381]">{d}</p></div>)}
      </div>
    </div></section>

    <GoogleBusinessSection />

    <section className="section-space bg-[#f7f9fa]"><div className="container-wide">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Our equipment</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Three essential machines. One local contact.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-[#637381]">Choose the equipment category that fits your site requirements. Each machine has a dedicated page with common applications and a direct booking route.</p></div><Link href="/booking" className="btn-outline shrink-0">Enquire about availability <ArrowRight size={16} /></Link></div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">{machines.map(m => <MachineCard key={m.href} {...m} />)}</div>
    </div></section>

    <section className="section-space"><div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-center">
      <div className="relative min-h-[390px] overflow-hidden bg-[#e9eef0]">
        <Image
          src="/grader-3.webp"
          alt="Motor grader levelling a rural road"
          className="absolute inset-0 h-full w-full object-cover"
          priority
          width={800}
          height={390}
        />
        <div className="absolute bottom-5 left-5 bg-white px-5 py-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#805600]">Serving from</p><p className="mt-1 text-xl font-extrabold">Lahan, Siraha</p></div></div>
      <div><p className="eyebrow">Why work with us</p><h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">A straightforward rental conversation from the first call.</h2><p className="mt-5 text-sm leading-7 text-[#637381]">Every site has its own conditions, access requirements and schedule. We keep the first step simple: explain the work, identify the machine and share the dates and location.</p>
        <div className="mt-7 grid gap-5">
          {[[ShieldCheck, "Discuss the right equipment", "Tell us the type of work and site conditions so we can discuss the most suitable machine."], [Clock3, "Plan around your schedule", "Share your expected start and end dates so availability can be checked."], [MapPin, "Share your project location", "Let us know where the machine is required, including access or transport considerations."], [Phone, "Talk directly with our team", "Call 9702803911 for questions, availability and rental discussions."]].map(([Icon, title, desc]: any) => <div key={title} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e5a928] text-[#805600]"><Icon size={19} /></span><div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#637381]">{desc}</p></div></div>)}
        </div>
      </div>
    </div></section>

    <section className="section-space bg-[#f7f9fa]"><div className="container-wide"><div className="max-w-2xl"><p className="eyebrow">Applications</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Equipment for the work happening on your site.</h2><p className="mt-4 text-sm leading-7 text-[#637381]">Our current rental categories support a range of construction and infrastructure activities. Actual suitability depends on machine configuration and site conditions.</p></div>
      <div className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {[[HardHat, "Road construction", "Road formation, shaping, levelling and preparation."], [Truck, "Earthmoving", "Moving and removing soil, trenching and bulk excavation."], [ClipboardCheck, "Site preparation", "Preparing building plots, work areas and project access."], [CheckCircle2, "Surface compaction", "Compacting suitable soil, aggregate and asphalt layers."], [MapPin, "Local infrastructure", "Support for local roads, drainage and civil works."], [Clock3, "Planned project work", "Rental requests for defined dates and project schedules."]].map(([Icon, t, d]: any) => <div key={t} className="border-b border-[#dfe6ea] pb-6"><Icon size={22} className="text-[#805600]" /><h3 className="mt-4 text-lg font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-[#637381]">{d}</p></div>)}
      </div>
    </div></section>

    <section className="section-space"><div className="container-wide">
      <div className="text-center"><p className="eyebrow">How to rent</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Four simple steps to get started.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#637381]">Share the essentials first. We will follow up to discuss availability and the practical details.</p></div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[["01", "Choose a machine", "Select grader, road roller or excavator based on your work."], ["02", "Share your dates", "Tell us when you need the machine and for how long."], ["03", "Provide the location", "Share your project site and any important access information."], ["04", "Confirm directly", "We will discuss availability, pricing, transport and rental terms with you."]].map(([n, t, d]) => <div key={n} className="relative border-t border-[#dce3e7] pt-6"><span className="text-3xl font-extrabold text-[#805600]">{n}</span><h3 className="mt-4 text-lg font-extrabold">{t}</h3><p className="mt-2 text-sm leading-7 text-[#637381]">{d}</p></div>)}</div>
    </div></section>

    <section className="section-space bg-[#f7f9fa]"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
      <div><p className="eyebrow">Frequently asked questions</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Before you make an enquiry.</h2><p className="mt-5 text-sm leading-7 text-[#637381]">Need a specific answer about your site or schedule? Call us and speak directly with the rental service.</p><a href="tel:9702803911" className="btn-outline mt-6"><Phone size={16} /> 9702803911</a></div>
      <div className="divide-y divide-[#dfe6ea] border-y border-[#dfe6ea]">{faqs.map(([q, a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-extrabold">{q}<span className="text-xl text-[#805600] group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-4 text-sm leading-7 text-[#637381]">{a}</p></details>)}</div>
    </div></section>

    <section className="bg-[#182b3a] py-16 text-white"><div className="container-wide flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f2bd4e]">Have a project coming up?</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">Tell us what your site needs. Let's discuss the right machine.</h2><p className="mt-4 text-sm text-white/70">Based in Lahan, Siraha · Grader · Roller · Excavator</p></div><div className="flex flex-wrap gap-3"><Link href="/booking" className="btn-primary">Make a booking enquiry <ArrowRight size={16} /></Link><a href="tel:9702803911" className="inline-flex items-center gap-2 border border-white/40 px-5 py-3 text-sm font-bold"><Phone size={16} /> Call now</a></div></div></section>
  </main>;
}
