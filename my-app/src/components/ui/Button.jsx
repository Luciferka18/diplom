import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border border-[color:var(--accent)] bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)] hover:border-[color:var(--accent-hover)]",
  outline: "border border-[color:var(--stroke)] bg-transparent text-[color:var(--text)] hover:bg-[color:var(--panel)]",
  ghost: "bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--panel)] hover:text-[color:var(--text)]",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4",
  lg: "h-12 px-6 text-base",
};

export default function Button({ className, variant = "primary", size = "md", as: Tag = "button", ...props }) {
  return (
    <Tag
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)] disabled:opacity-60 disabled:pointer-events-none",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    />
  );
}
