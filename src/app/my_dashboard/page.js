

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/signin?next=%2Fmy-dashboard");
      return;
    }

    switch (session.role) {
      case "renter":
        router.replace("/dashboard");
        break;

      case "owner":
        router.replace("/owner/dashboard");
        break;

      case "admin":
        router.replace("/admin");
        break;

      default:
        router.replace("/signin");
    }
  }, [router]);

  return (
    <main className="dashboard-loading">
      {/* <p>Redirecting to your dashboard...</p> */}
    </main>
  );
}