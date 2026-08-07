import * as React from "react";
import { cn } from "@/lib/utils";

type Variante = "primary" | "accent" | "cta" | "outline" | "neutral" | "ghost";
type Tamano = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-sm rounded-lg font-medium " +
  "transition-[background-color,color,border-color,box-shadow,translate,scale] duration-200 " +
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const variantes: Record<Variante, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container shadow-sm",
  // Naranja del CTA del hero. Texto oscuro para cumplir contraste AA.
  accent: "bg-accent text-on-accent hover:bg-accent-hover shadow-sm",
  // CTA de cotización de la ficha técnica, tal como lo define Stitch.
  cta: "bg-on-tertiary-container text-on-tertiary-fixed hover:bg-tertiary-fixed-dim shadow-sm",
  outline: "border border-primary text-primary bg-transparent hover:bg-primary/5 shadow-sm",
  neutral:
    "bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant shadow-sm",
  ghost: "text-on-surface-variant hover:bg-surface-container-highest",
};

const tamanos: Record<Tamano, string> = {
  sm: "h-9 px-md text-label-technical font-mono",
  md: "h-11 px-md text-label-technical font-mono",
  lg: "h-12 px-lg text-headline-md",
};

interface Comun {
  variante?: Variante;
  tamano?: Tamano;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = Comun & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = Comun & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({
  variante = "primary",
  tamano = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variantes[variante], tamanos[tamano], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variante = "primary",
  tamano = "md",
  className,
  children,
  ...props
}: AnchorProps) {
  return (
    <a className={cn(base, variantes[variante], tamanos[tamano], className)} {...props}>
      {children}
    </a>
  );
}
