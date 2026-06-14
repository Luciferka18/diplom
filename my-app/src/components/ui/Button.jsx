import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-xs)] hover:border-[color:var(--accent-hover)] hover:bg-[color:var(--accent-hover)]",
  secondary:
    "border border-[color:var(--warm)] bg-[color:var(--warm)] text-white shadow-[var(--shadow-xs)] hover:border-[color:var(--warm-hover)] hover:bg-[color:var(--warm-hover)]",
  outline:
    "border border-[color:var(--stroke)] bg-[color:var(--panel)] text-[color:var(--text)] shadow-[var(--shadow-xs)] hover:border-[color:var(--stroke-strong)] hover:bg-[color:var(--panel-2)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--panel-2)] hover:text-[color:var(--text)]",
  danger:
    "border border-[color:var(--danger)] bg-[color:var(--danger)] text-white hover:brightness-95",
};

const sizes = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
};

export default function Button({ className, variant = "primary", size = "md", as: Tag = "button", ...props }) {
  return (
    <Tag
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:color-mix(in_srgb,var(--accent)_20%,transparent)] disabled:pointer-events-none disabled:opacity-55",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    />
  );
}
