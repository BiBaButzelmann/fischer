"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "@/actions/page-view";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname && lastLoggedPath.current !== pathname) {
      lastLoggedPath.current = pathname;
      void logPageView(pathname);
    }
  }, [pathname]);

  return null;
}
