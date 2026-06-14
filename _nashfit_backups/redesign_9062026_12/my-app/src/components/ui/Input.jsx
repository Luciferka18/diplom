import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)]",
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
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-[color:var(--accent)]",
        className
      )}
      {...props}
    />
  );
}
