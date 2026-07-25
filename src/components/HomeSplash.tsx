"use client";

import { useState } from "react";
import { VolmiqSplash } from "@/components/VolmiqSplash";

/**
 * Landing intro overlay — finalized single-stroke ribbon animation.
 * Closes after autoCloseMs so the landing content can show.
 */
export function HomeSplash() {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <VolmiqSplash
      showReplay={false}
      autoCloseMs={4200}
      onDone={() => setShow(false)}
    />
  );
}
