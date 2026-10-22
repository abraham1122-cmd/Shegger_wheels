
import "./globals.css";

export const metadata = {
  title: "Good Journey | Car Rental",
  description:
    "Find a car that fits your plans with local car owners.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
