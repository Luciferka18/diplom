import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60",
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
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-400/60",
        className
      )}
      {...props}
    />
  );
}
