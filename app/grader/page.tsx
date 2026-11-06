import type { Metadata } from "next";
import MachinePage from "@/components/machine-page";

export const metadata: Metadata = {
    title: "Grader Rental in Lahan, Siraha | Motor Grader Rent Nepal",

    description:
        "Need a motor grader for road construction in Lahan, Siraha? Get grader rental for road levelling, grading, surface shaping and site preparation. Call 9702803911 for enquiries.",

    keywords: [
        "grader rental in Lahan",
        "grader rent in Siraha",
        "motor grader rental Nepal",
        "motor grader rent Lahan",
        "road grader rental",
        "road grading equipment",
        "road levelling machine rental",
        "road construction machinery rental",
        "grader hire Nepal",
        "heavy equipment rental Siraha",
    ],

    alternates: {
        canonical: "/grader",
    },

    openGraph: {
        title: "Motor Grader Rental in Lahan, Siraha",
        description:
            "Arrange motor grader rental for road formation, levelling, surface shaping and construction projects in Lahan, Siraha and surrounding areas.",
        url: "/grader",
        type: "website",
        images: [
            {
                url: "/grader-2.jpg",
                width: 1200,
                height: 630,
                alt: "Motor grader available for road construction rental",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Grader Rental in Lahan, Siraha",
        description:
            "Motor grader rental for road construction, grading and levelling projects in Siraha, Nepal.",
        images: ["/grader-2.jpg"],
    },
};

const graderServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Grader Rental in Lahan, Siraha",
    serviceType: "Motor Grader Rental",
    description:
        "Motor grader rental for road construction, road levelling, surface grading, road formation and site preparation in Lahan, Siraha and surrounding areas.",
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
                    __html: JSON.stringify(graderServiceSchema).replace(/</g, "\\u003c"),
                }}
            />

            <MachinePage
                machine="Grader"
                subtitle="Road grading & levelling"
                image="/grader-2.jpg"
                intro="Arrange motor grader rental for road formation, levelling, 
surface shaping and site preparation in Lahan, 
Siraha and nearby areas. Share your project details and required dates to discuss availability."
                uses={[
                    "Levelling and shaping gravel or earthen roads",
                    "Road formation and surface preparation",
                    "Shaping shoulders and side slopes where suitable",
                    "Preparing a level base for subsequent construction work",
                    "Maintenance and reshaping of unpaved access roads"
                ]}
                benefits={[
                    "Planned rental dates and project location",
                    "Discussion of access and working conditions",
                    "Project-specific rental and transport arrangements",
                    "Direct contact for availability and quotation"
                ]}
                note="A motor grader uses an adjustable blade to spread and shape material and produce a more even surface. 
The suitable approach depends on ground conditions, project specifications and the finish required."
            />
        </>
    )
}
