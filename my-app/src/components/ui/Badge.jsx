import { cn } from "@/lib/cn";

export default function Badge({ className, children, tone = "neutral" }) {
  const tones = {
    neutral: "border-[color:var(--stroke)] bg-[color:var(--panel-2)] text-[color:var(--text-soft)]",
    accent: "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]",
    warm: "border-[color:var(--warm-border)] bg-[color:var(--warm-soft)] text-[color:var(--warm)]",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold", tones[tone] || tones.neutral, className)}>
      {children}
    </span>
  );
}
