


import CarsPageContent from "./carRent";

export const metadata = {
  title: "Check Available Cars on Markate",
  description:
    "Browse available rental cars in Ethiopia. Compare vehicles, prices, and pickup locations.",

  openGraph: {
    title: "Available Rental Cars | Drive Ethiopia",
    description:
      "Explore rental cars and find the right vehicle for your next trip.",
    images: ["/images/og-image.jpg"],
  },
};


export default function CarsPage(){

  return(
    <>
    <main>
      <CarsPageContent />
    </main>
    </>
  );
}