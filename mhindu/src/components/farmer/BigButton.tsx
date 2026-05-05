"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import React, { useCallback } from "react";

import { cn } from "@/lib/utils/cn";

interface BigButtonBaseProps {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  leftIcon?: LucideIcon;
  fullWidth?: boolean;
  voiceText?: string;
  children: React.ReactNode;
  className?: string;
}

export type BigButtonProps = BigButtonBaseProps &
  (
    | ({ as?: "button" } & React.ButtonHTMLAttributes<HTMLButtonElement>)
    | ({
        as: "a";
        href: string;
        target?: string;
        rel?: string;
      })
  );

const variantClasses: Record<
  NonNullable<BigButtonBaseProps["variant"]>,
  string
> = {
  primary:
    "bg-leaf-500 text-bone-100 active:bg-leaf-700 focus-visible:ring-leaf-700",
  secondary:
    "bg-bone-200 text-ink-900 active:bg-ink-100 focus-visible:ring-ink-700",
  danger:
    "bg-signal-danger text-bone-100 active:bg-earth-700 focus-visible:ring-earth-700",
};

const sharedClass = (
  variant: NonNullable<BigButtonBaseProps["variant"]>,
  fullWidth: boolean,
  className?: string,
) =>
  cn(
    "relative flex items-center justify-center gap-3",
    "h-14 min-h-14 px-6 rounded-[8px]",
    "text-base font-display font-semibold tracking-tight",
    "transition-colors duration-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    fullWidth && "w-full",
    variantClasses[variant],
    className,
  );

function Inner({
  loading,
  leftIcon: LeftIcon,
  children,
}: {
  loading: boolean;
  leftIcon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <>
      {loading ? (
        <Loader2 size={20} className="animate-spin shrink-0" aria-hidden />
      ) : LeftIcon ? (
        <LeftIcon size={20} className="shrink-0" aria-hidden />
      ) : null}
      <span>{children}</span>
    </>
  );
}

export function BigButton(props: BigButtonProps) {
  const {
    variant = "primary",
    loading = false,
    leftIcon,
    fullWidth = true,
    voiceText,
    children,
    className,
  } = props;

  const speak = useCallback(() => {
    if (
      voiceText &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      const utt = new SpeechSynthesisUtterance(voiceText);
      utt.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }
  }, [voiceText]);

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        onClick={speak}
        className={sharedClass(variant, fullWidth, className)}
      >
        <Inner loading={loading} leftIcon={leftIcon}>
          {children}
        </Inner>
      </a>
    );
  }

  const { as: _, onClick, disabled, ...rest } = props as BigButtonBaseProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    speak();
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={sharedClass(variant, fullWidth, className)}
    >
      <Inner loading={loading} leftIcon={leftIcon}>
        {children}
      </Inner>
    </button>
  );
}
