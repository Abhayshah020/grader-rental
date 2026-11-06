
import type { Metadata } from "next";
import BookingForm from "@/components/booking-form";
import { MapPin, Phone, Clock3 } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Book Grader, Roller & Excavator Rental | Lahan, Siraha",

    description:
        "Request grader, road roller or excavator rental in Lahan, Siraha. Contact us for equipment availability, rental rates, project requirements and booking enquiries. Call 9702803911.",

    keywords: [
        "heavy equipment rental booking",
        "grader rental booking Siraha",
        "road roller rental booking",
        "excavator rental booking",
        "construction machinery booking Nepal",
        "grader rent contact Lahan",
        "roller rent contact Siraha",
        "excavator rent contact Lahan",
        "construction equipment quotation",
        "heavy equipment rental contact Nepal",
    ],

    alternates: {
        canonical: "/booking",
    },

    openGraph: {
        title: "Book Heavy Equipment Rental in Lahan, Siraha",
        description:
            "Request a grader, road roller or excavator for your next construction project. Contact our rental service in Lahan, Siraha.",
        url: "/booking",
        type: "website",
        images: [
            {
                url: "/grader-2.webp",
                width: 1200,
                height: 630,
                alt: "Heavy construction equipment rental booking in Siraha",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Equipment Rental Booking | Lahan, Siraha",
        description:
            "Submit a grader, roller or excavator rental enquiry for your construction project.",
        images: ["/grader-2.webp"],
    },
};

export default function BookingPage() {
    return (
        <main>
            <section className="relative overflow-hidden bg-[#f4f6f7] pt-12 pb-10 lg:pb-0">

                {/* Background image: mobile and tablet */}
                <div className="absolute inset-y-0 right-0 w-[60%] md:w-[42%] lg:hidden pointer-events-none">
                    <Image
                        src="/smiling-woman-low.webp"
                        alt="Booking grader roller excavator rental"
                        fill
                        priority
                        sizes="(max-width: 768px) 55vw, 42vw"
                        className="object-contain object-right-bottom opacity-25 sm:opacity-40"
                    />
                </div>

                <div className="container-wide relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">

                    <div className="w-full md:flex-1">
                        <p className="eyebrow">Booking & contact</p>

                        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">
                            Let's talk about your project.
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-[#637381]">
                            Request a grader, road roller or excavator, or send us a general
                            question. Share a few details and we will follow up directly.
                        </p>
                    </div>

                    {/* Desktop image */}
                    <div className="hidden lg:flex w-[360px] shrink-0 justify-end">
                        <Image
                            src="/smiling-woman-low.webp"
                            alt="Smiling engineer ready to assist"
                            width={380}
                            height={380}
                            priority
                            className="w-full h-auto object-contain"
                        />
                    </div>

                </div>
            </section>



            <section className="section-space">
                <div className="container-wide grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
                    <aside>
                        <p className="eyebrow">Contact details</p>
                        <h2 className="mt-3 text-2xl font-extrabold">
                            Speak with our rental service.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#637381] text-justify">
                            For availability, rates, transport and project requirements,
                            call us directly or submit the form. A booking request is not
                            a confirmed reservation until details are agreed with our team.
                        </p>

                        <div className="mt-8 space-y-6">
                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#805600]">
                                    <Phone size={19} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">
                                        Phone
                                    </p>
                                    <a href="tel:9702803911" className="mt-1 block text-lg font-extrabold">
                                        9702803911
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#805600]">
                                    <MapPin size={19} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">
                                        Location
                                    </p>
                                    <p className="mt-1 font-extrabold">
                                        Lahan, Siraha, Nepal
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="flex h-11 w-11 items-center justify-center border border-[#e5a928] text-[#805600]">
                                    <Clock3 size={19} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#71808a]">
                                        Availability
                                    </p>
                                    <p className="mt-1 font-extrabold">
                                        Please call to confirm
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-9 border-l-2 border-[#e5a928] bg-[#f7f9fa] p-5">
                            <p className="text-sm font-extrabold">
                                Need an immediate answer?
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[#637381]">
                                Call 9702803911 to discuss urgent requirements and upcoming work.
                            </p>
                            <a
                                href="tel:9702803911"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#94650d]"
                            >
                                Call the rental service <Phone size={15} />
                            </a>
                        </div>

                        <div className="mt-9 overflow-hidden border border-[#e5e9ed]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1705.2906447656565!2d86.48011285396322!3d26.721728297728042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ee9762d53151d3%3A0x490d4b4e51e5d8ea!2sGrader%2FRoller%2FExcavator%20Rental!5e1!3m2!1sen!2snp!4v1793948629302!5m2!1sen!2snp"
                                width="100%"
                                height="260"
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
                    </aside>

                    <BookingForm />
                </div>
            </section>
        </main>
    );
}
