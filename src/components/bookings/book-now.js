
"use client";

import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/sessions";

export default function Book_Now_Button({ carId }) {
  const router = useRouter();

  function handleBookNow() {
    const checkoutURL = `/checkout?carId=${encodeURIComponent(carId)}`;

    if (isSignedIn()) {
      router.push(checkoutURL);
    } else {
      router.push(`/signin?next=${encodeURIComponent(checkoutURL)}`);
    }
  }

  return (
    <button type="button" onClick={handleBookNow}>
      Book Now
    </button>
  );
}
