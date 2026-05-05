import React from "react";

import { cn } from "@/lib/utils/cn";

export interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { width: 96, height: 28 },
  md: { width: 128, height: 38 },
  lg: { width: 176, height: 52 },
};

export function Logo({
  variant = "light",
  size = "md",
  className,
}: LogoProps) {
  const { width, height } = sizes[size];
  const textFill = variant === "light" ? "#161513" : "#f9f4ec";
  const leafFill = variant === "light" ? "#2f7d4a" : "#6db888";
  const earthFill = variant === "light" ? "#b04a2e" : "#e08a6c";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 176 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mhindu"
      className={cn("shrink-0", className)}
    >
      {/*
        Wordmark: "M h i n d u"
        The 'h' descender integrates a leaf glyph at its arch — a small chlorophyll
        leaf growing from the crossbar junction, rooted in agronomic fieldwork.
        Font is approximated in SVG paths for deterministic rendering without webfont dependency.
      */}

      {/* M */}
      <text
        x="0"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="44"
        fontWeight="700"
        letterSpacing="-1"
        fill={textFill}
        style={{ fontVariantLigatures: "none" }}
      >
        M
      </text>

      {/* h — with leaf integrated at arch */}
      <text
        x="31"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="44"
        fontWeight="700"
        letterSpacing="-1"
        fill={textFill}
      >
        h
      </text>

      {/* Leaf glyph at the arch of 'h' (~x=51, y=18) */}
      <g transform="translate(51, 12) rotate(-30)">
        <ellipse cx="0" cy="-5" rx="3" ry="6" fill={leafFill} opacity="0.92" />
        <line x1="0" y1="0" x2="0" y2="-10" stroke={earthFill} strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* indu */}
      <text
        x="64"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="44"
        fontWeight="700"
        letterSpacing="-1"
        fill={textFill}
      >
        indu
      </text>
    </svg>
  );
}
