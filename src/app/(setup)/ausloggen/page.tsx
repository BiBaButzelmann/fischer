"use client";

import { signout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    signout().then((result) => {
      if (result.success) {
        router.push("/willkommen");
      } else {
        router.push("/uebersicht");
      }
    });
  }, [router]);

  return null;
}
