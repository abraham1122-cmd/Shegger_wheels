
  "use client"
   
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearSession } from "@/lib/sessions";


export default function SignOutPage(){

    const router = useRouter();

    useEffect(()=>{
        clearSession();
        router.replace("/");

    },[router]);
}