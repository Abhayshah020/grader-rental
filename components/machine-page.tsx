import Link from "next/link";
import { ArrowRight, CheckCircle2, Phone, MapPin, ClipboardList } from "lucide-react";
import BookingForm from "@/components/booking-form";
import Image from "next/image";

export default function MachinePage({ machine, subtitle, image, intro, uses, benefits, note }: {
    machine: string; subtitle: string; image: string; intro: string; uses: string[]; benefits: string[]; note: string;
}) {
    return <main>
        <section className="bg-[#f4f6f7]"><div className="container-wide grid min-h-[510px] gap-10 py-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-20">
            <div><p className="eyebrow">Heavy equipment rental · Lahan, Siraha</p><h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{machine} <span className="text-[#b17c17]">Rental Service</span></h1><p className="mt-6 text-base leading-8 text-[#637381] hidden md:block text-justify">{intro}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/booking" className="btn-primary">Enquire <ArrowRight size={16} /></Link><a href="tel:9702803911" className="btn-outline"><Phone size={16} /> 9702803911</a></div><p className="mt-5 text-xs text-[#71808a]">Availability, pricing and site arrangements are confirmed directly.</p></div>
            <div className="relative h-[330px] overflow-hidden bg-[#e4e9ec] sm:h-[420px]">
                <Image
                    src={image}
                    alt={`${machine} on a construction site`}
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={75}
                    className="machine-image"
                />

                <div className="absolute bottom-4 left-4 bg-white px-4 py-3"><p className="text-xs font-bold uppercase tracking-wider text-[#805600]">{subtitle}</p><p className="mt-1 text-sm font-extrabold">Siraha Grader Roller Rental Service</p></div></div>
        </div></section>
        <section className="section-space"><div className="container-wide grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div><p className="eyebrow">Machine applications</p><h2 className="mt-3 text-3xl font-extrabold">Where this machine can help.</h2><p className="mt-5 text-sm leading-7 text-[#637381] text-justify">The right equipment depends on the material, scale of work, access and required finish. Share your project details so the rental arrangement can be discussed clearly.</p><div className="mt-7 border-l-2 border-[#e5a928] bg-[#f8fafb] p-5 text-sm leading-7 text-[#637381] text-justify">{note}</div></div>
            <div className="grid gap-8 sm:grid-cols-2"><div><h3 className="text-lg font-extrabold">Common applications</h3><ul className="mt-5 space-y-4">{uses.map(x => <li key={x} className="flex gap-3 text-sm leading-6 text-[#637381]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#805600]" />{x}</li>)}</ul></div><div><h3 className="text-lg font-extrabold">Plan your rental</h3><ul className="mt-5 space-y-4">{benefits.map(x => <li key={x} className="flex gap-3 text-sm leading-6 text-[#637381]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#805600]" />{x}</li>)}</ul></div></div>
        </div></section>
        <section className="bg-[#f7f9fa] py-16"><div className="container-wide grid gap-8 md:grid-cols-3">{[["Tell us the task", "Explain what needs to be done and the approximate scale of work."], ["Share dates and location", "Provide your planned rental period and project site."], ["Confirm the arrangement", "Discuss availability, rate, transport, operator and working terms."]].map(([t, d], i) => <div key={t} className="border-t-2 border-[#e5a928] pt-5"><p className="text-xs font-bold text-[#805600]">STEP 0{i + 1}</p><h3 className="mt-3 text-xl font-extrabold">{t}</h3><p className="mt-2 text-sm leading-7 text-[#637381]">{d}</p></div>)}</div></section>

        <section className="section-space">
            <div className="container-wide grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
                <div>
                    <p className="eyebrow">
                        Request this machine
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold">
                        Planning work in Lahan, Madhesh pradhesh, Biratnagar,
                        Sindhuli or nearby?
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-[#637381]">
                        Send a booking request with your dates and location.
                        Our team can follow up to discuss availability and the details of your project.
                    </p>
                    <div className="mt-7 space-y-4 text-sm">
                        <p className="flex items-center gap-3">
                            <MapPin size={17} className="text-[#805600]" />
                            Lahan, Siraha, Nepal
                        </p>
                        <p className="flex items-center gap-3">
                            <Phone size={17} className="text-[#805600]" />
                            <a className="font-bold" href="tel:9702803911">
                                9702803911
                            </a>
                        </p>
                        <p className="flex items-center gap-3">
                            <ClipboardList size={17} className="text-[#805600]" />
                            Booking and general enquiries
                        </p>
                    </div>

                    <div className="mt-8 overflow-hidden border border-[#e5e9ed]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1705.2906447656565!2d86.48011285396322!3d26.721728297728042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ee9762d53151d3%3A0x490d4b4e51e5d8ea!2sGrader%2FRoller%2FExcavator%20Rental!5e1!3m2!1sen!2snp!4v1793948629302!5m2!1sen!2snp"
                            width="100%"
                            height="240"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            title="Grader Roller Excavator Rental location map"
                        />

                        <a
                            href="https://www.google.com/maps/@26.7217283,86.4801129,18z/data=!3m1!1e3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-[#f7f9fa] px-4 py-3 text-sm font-bold text-[#94650d] transition hover:bg-[#edf1f4]"
                        >
                            <MapPin size={16} />
                            View Satellite Location on Google Maps
                        </a>
                    </div>
                </div>
                <BookingForm
                    presetMachine={machine === "Road Roller" ? "Road Roller" : machine}
                />
            </div>
        </section>
    </main>;
}
