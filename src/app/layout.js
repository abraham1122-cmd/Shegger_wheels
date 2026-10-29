


import "./globals.css";


export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "Drive Ethiopia | Car Rental",
    template: "%s | Drive Ethiopia",
  },

  description:
    "Find and rent cars in Ethiopia. Explore available vehicles, compare prices, and book your next journey.",

  openGraph: {
    title: "Shegge-Wheels Ethiopia | Car Rental",
    description:
      "Find and rent cars in Ethiopia. Explore vehicles and book your next journey.",
    siteName: "Visit Ethiopia",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Drive Ethiopia car rental",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Visit Ethiopia | Car Rental",
    description:
      "Find and rent cars in Ethiopia.",
    images: ["/images/og-image.jpg"],
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
