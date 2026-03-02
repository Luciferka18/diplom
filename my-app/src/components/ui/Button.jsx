import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border border-emerald-300/40 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 text-slate-950 shadow-[0_10px_28px_rgba(52,211,153,.35)] hover:brightness-105 hover:shadow-[0_14px_34px_rgba(34,211,238,.35)]",
  outline: "border border-white/20 bg-white/5 text-white hover:bg-white/12",
  ghost: "bg-transparent text-white/85 hover:bg-white/10 hover:text-white",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020] disabled:opacity-60 disabled:pointer-events-none",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    />
  );
}
