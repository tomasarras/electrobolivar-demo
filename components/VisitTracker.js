"use client";

import { useEffect } from "react";

const SESSION_FLAG = "mercadobolivar_visit_tracked";

export default function VisitTracker() {
  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return;
    window.sessionStorage.setItem(SESSION_FLAG, "1");
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
