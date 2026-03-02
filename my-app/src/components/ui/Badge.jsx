import { cn } from "@/lib/cn";

export default function Badge({ className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-1 text-xs font-semibold text-[color:var(--text)]",
        className
      )}
    >
      {children}
    </span>
  );
}
