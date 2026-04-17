"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function SosRedirectGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkActiveSos = () => {
      const activeSosId = localStorage.getItem("activeSosId");
      if (activeSosId && pathname !== "/dashboard") {
        router.replace("/dashboard");
      }
    };

    checkActiveSos();
    const interval = setInterval(checkActiveSos, 1000);
    window.addEventListener("storage", checkActiveSos);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", checkActiveSos);
    };
  }, [pathname, router]);

  return null;
}

