"use client";

import Image from "next/image";

import { useMediaQuery } from "@/lib/use-media-query";

/**
 * The looping vial carousel behind the hero.
 *
 * The poster is always rendered and is what LCP measures, so the video never
 * sits on the critical path. The <video> itself mounts only on a wide viewport
 * with motion allowed, which means phones and reduced-motion readers never
 * request the file at all.
 *
 * The source clip is deliberately composed with an empty centre (measured at
 * luma 5/255) for type to sit in.
 */
export function HeroVideo() {
  const wide = useMediaQuery("(min-width: 768px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const play = wide && !reducedMotion;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/hero/vials-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover scale-[1.02] object-center"
      />

      {play && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/hero/vials-poster.webp"
          className="absolute inset-0 h-full w-full object-cover scale-[1.02] object-center"
        >
          <source src="/hero/vials-loop.webm" type="video/webm" />
          <source src="/hero/vials-loop.mp4" type="video/mp4" />
        </video>
      )}

      {/* Pool of darkness under the type. The ring's hole is already near-black,
          but this lets the headline breathe past its inner edge safely. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 48%, rgb(5 7 12 / 0.92) 0%, rgb(5 7 12 / 0.78) 42%, rgb(5 7 12 / 0.25) 72%, transparent 100%)",
        }}
      />
      {/* Blend the frame edges into the page so it reads as lighting, not as a
          video element bolted onto the top of the document. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, transparent 18%, transparent 62%, var(--bg) 100%), linear-gradient(to right, var(--bg) 0%, transparent 14%, transparent 86%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
