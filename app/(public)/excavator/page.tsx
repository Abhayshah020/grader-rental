import type { Metadata } from "next";
import MachinePage from "@/components/machine-page";

export const metadata: Metadata = {
    title: "Excavator Rental in Lahan, Siraha | Excavator Rent Nepal",

    description:
        "Looking for excavator rent in Lahan, Siraha? Arrange excavator rental for earthmoving, trenching, foundation excavation and site preparation. Call 9702803911 for availability.",

    keywords: [
        "excavator rental in Lahan",
        "excavator rent in Siraha",
        "excavator rental Nepal",
        "excavator hire Lahan",
        "earthmoving equipment rental",
        "excavation machine rental",
        "foundation excavation equipment",
        "trenching equipment rental",
        "construction excavator hire",
        "heavy machinery rental Siraha",
    ],

    alternates: {
        canonical: "/excavator",
    },

    openGraph: {
        title: "Excavator Rental in Lahan, Siraha",
        description:
            "Excavator rental for earthmoving, trenching, foundation excavation and site preparation projects in Lahan, Siraha and nearby areas.",
        url: "/excavator",
        type: "website",
        images: [
            {
                url: "/excavator.webp",
                width: 1200,
                height: 630,
                alt: "Excavator available for earthmoving and construction rental",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Excavator Rental in Lahan, Siraha",
        description:
            "Arrange excavator rental for construction, earthmoving and excavation work in Siraha, Nepal.",
        images: ["/excavator.webp"],
    },
};


const excavatorServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Excavator Rental in Lahan, Siraha",
    serviceType: "Excavator Rental",
    description:
        "Excavator rental for earthmoving, trenching, foundation excavation, material loading and construction site preparation in Lahan, Siraha and surrounding areas.",
    areaServed: {
        "@type": "AdministrativeArea",
        name: "Siraha, Nepal",
    },
    provider: {
        "@type": "LocalBusiness",
        name: "Siraha Grader Roller Rental Service",
        telephone: "+9779702803911",
    },
};

export default function Page() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(excavatorServiceSchema).replace(/</g, "\\u003c"),
                }}
            />
            <MachinePage
                machine="Excavator"
                subtitle="Excavation & earthmoving"
                image="/excavator.webp"
                intro="Arrange excavator rental for earthmoving, trenching, foundation excavation, 
       loading and site preparation. Tell us the work type, 
       site conditions and required rental dates in Lahan, Siraha or surrounding areas."
                uses={[
                    "General excavation and earthmoving",
                    "Trenching for suitable drainage and utility works",
                    "Foundation and building-site excavation",
                    "Loading excavated material where site conditions allow",
                    "Site clearing and shaping"
                ]}
                benefits={[
                    "Describe excavation depth and approximate volume",
                    "Share ground conditions and access constraints",
                    "Confirm project location and working dates",
                    "Discuss bucket, machine size, transport and operator arrangements"
                ]}
                note="Excavator size, reach, bucket capacity and ground conditions affect suitability. 
       Include the approximate depth, material and site access details in your enquiry where possible."
            />
        </>
    )
}