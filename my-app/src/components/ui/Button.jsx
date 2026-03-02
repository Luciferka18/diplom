import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90",
  outline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1020] disabled:opacity-60 disabled:pointer-events-none",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    />
  );
}
