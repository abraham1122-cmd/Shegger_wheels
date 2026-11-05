



"use client";

import { connection } from "next/server";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";



 async function DashboardRedirectContent() {

  await connection();

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

    </main>
  );
}

export default function DashboardRedirect(){

  return(
    <>
    <Suspense
     fallback={<p>loading..</p>}
     >

      <DashboardRedirectContent />
     </Suspense>

    
    
    </>
  );
}