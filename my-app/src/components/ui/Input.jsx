import { cn } from "@/lib/cn";

const shared =
  "w-full rounded-[14px] border border-[color:var(--stroke)] bg-[color:var(--elevated)] px-3.5 py-3 text-[color:var(--text)] shadow-[var(--shadow-xs)] outline-none transition placeholder:text-[color:var(--muted2)] hover:border-[color:var(--stroke-strong)] focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60";

export function Input({ className, ...props }) {
  return <input className={cn(shared, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(shared, "min-h-28 resize-y", className)} {...props} />;
}
