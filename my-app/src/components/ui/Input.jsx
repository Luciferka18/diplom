import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60",
        className
      )}
      {...props}
    />
  );
}
