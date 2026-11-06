
import type { Metadata } from "next";
import MachinePage from "@/components/machine-page";

export const metadata: Metadata = {
    title: "Road Roller Rental in Lahan, Siraha | Roller Rent Nepal",

    description:
        "Looking for road roller rent in Lahan, Siraha? Arrange road roller rental for soil, gravel, aggregate and asphalt compaction. Call 9702803911 for availability and rental enquiries.",

    keywords: [
        "road roller rental in Lahan",
        "road roller rent in Siraha",
        "roller rental Nepal",
        "roller rent Lahan",
        "road compactor rental",
        "soil compaction equipment rental",
        "asphalt roller rental",
        "construction roller hire",
        "heavy equipment rental Siraha",
    ],

    alternates: {
        canonical: "/roller",
    },

    openGraph: {
        title: "Road Roller Rental in Lahan, Siraha",
        description:
            "Reliable road roller rental for road construction, soil compaction and surface preparation in Lahan, Siraha and nearby areas.",
        url: "/roller",
        type: "website",
        images: [
            {
                url: "/roller.jpg",
                width: 1200,
                height: 630,
                alt: "Road roller available for rental in Lahan, Siraha",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Road Roller Rental in Lahan, Siraha",
        description:
            "Arrange road roller rental for construction and compaction projects in Siraha, Nepal.",
        images: ["/roller.jpg"],
    },
};

const rollerServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Road Roller Rental in Lahan, Siraha",
    serviceType: "Road Roller Rental",
    description:
        "Road roller rental for road construction, soil compaction, aggregate compaction and suitable asphalt work.",
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
                    __html: JSON.stringify(rollerServiceSchema).replace(/</g, "\\u003c"),
                }}
            />
            
            <MachinePage
                machine="Road Roller"
                subtitle="Road & surface compaction"
                image="/roller.jpg"
                intro="Arrange road roller rental for compaction work on suitable soil, aggregate and asphalt surfaces. Contact our Lahan, Siraha rental service with your work location and schedule to discuss the right arrangement."
                uses={[
                    "Compaction of prepared road subgrade and base layers",
                    "Compacting gravel and aggregate surfaces",
                    "Compaction support during road construction",
                    "Suitable asphalt compaction tasks, depending on roller type",
                    "Levelling and compaction support on project access areas",
                ]}
                benefits={[
                    "Share the surface material and work area",
                    "Provide expected start and end dates",
                    "Discuss site access and transport requirements",
                    "Confirm machine availability and rental terms directly",
                ]}
                note="Roller type, drum configuration, operating weight and vibration settings matter. Please describe the surface and work stage so the equipment requirements can be discussed before booking."
            />
        </>
    );
}
