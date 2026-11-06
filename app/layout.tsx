
import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MobileActionBar from "@/components/mobile-action-bar";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://graderrental.com";

const businessName = "Siraha Grader Roller Rental Service";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Grader, Roller & Excavator Rental in Lahan, Siraha | Siraha Rental Service",
    template: "%s | Siraha Grader Roller Rental Service",
  },

  description:
    "Looking for grader rent, road roller rent or excavator rental in Lahan, Siraha? Get reliable heavy equipment rental for road construction, land preparation and infrastructure projects. Call 9702803911.",

  applicationName: businessName,

  keywords: [
    // Primary keywords
    "grader rent",
    "grader rental",
    "road grader rental",
    "motor grader rental",
    "roller rent",
    "road roller rental",
    "excavator rent",
    "excavator rental",
    "heavy equipment rental",
    "used grader rent nepal",

    // Local SEO keywords
    "grader rent nepal near me",
    "grader rental in Lahan",
    "grader rent in Siraha",
    "roller rental in Lahan",
    "road roller rent in Siraha",
    "excavator rental in Lahan",
    "heavy equipment rental in Siraha",
    "construction equipment rental Nepal",
    "road construction equipment rental Nepal",

    // Service-related keywords
    "motor grader rent nepal",
    "construction equipment rent",
    "road construction machinery",
    "land leveling equipment rental",
    "infrastructure equipment rental",
    "construction machinery hire",
    "grader roller excavator hire",
    "earthmoving equipment rental",
    "road maintenance equipment rental",
  ],

  authors: [{ name: businessName }],

  creator: businessName,
  publisher: businessName,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: businessName,
    title:
      "Grader, Roller & Excavator Rental in Lahan, Siraha",
    description:
      "Reliable grader, road roller and excavator rental services for road construction and infrastructure projects in Lahan, Siraha and nearby areas. Contact us at 9702803911.",
    images: [
      {
        url: "/grader-2.webp",
        width: 1200,
        height: 630,
        alt: "Heavy motor grader available for rental in Lahan, Siraha",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Grader & Roller Rental Service | Lahan, Siraha",
    description:
      "Looking for grader rent, roller rent or excavator rental in Siraha? Contact us for equipment rental enquiries.",
    images: ["/grader-2.webp"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/whiteLogoGrader.svg", type: "image/svg+xml" },
    ],
    shortcut: "/whiteLogoGrader.svg",
    apple: "/whiteLogoGrader.png",
  },

  category: "business",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: businessName,
  description:
    "Grader, road roller and excavator rental services for road construction, land preparation and infrastructure projects in Lahan, Siraha, Nepal.",
  url: siteUrl,
  telephone: "+9779702803911",
  image: `${siteUrl}/grader-2.webp`,
  logo: `${siteUrl}/whiteLogoGrader.svg`,
  areaServed: [
    {
      "@type": "City",
      name: "Lahan",
    },
    {
      "@type": "AdministrativeArea",
      name: "Siraha",
    },
    {
      "@type": "Country",
      name: "Nepal",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahan",
    addressRegion: "Siraha",
    addressCountry: "NP",
  },
  knowsAbout: [
    "Motor grader rental",
    "Road roller rental",
    "Excavator rental",
    "Road construction machinery",
    "Land preparation equipment",
    "Heavy equipment rental",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+9779702803911",
    contactType: "customer service",
    areaServed: "NP",
    availableLanguage: ["English", "Nepali"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>

      <body>
        <SiteHeader />
        {children}
        <MobileActionBar />
        <SiteFooter />
        <Analytics/>
        <SpeedInsights />
      </body>
    </html>
  );
}
