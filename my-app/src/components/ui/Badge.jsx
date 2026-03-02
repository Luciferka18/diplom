import { cn } from "@/lib/cn";

export default function Badge({ className, children }) {
  return <span className={cn("inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85", className)}>{children}</span>;
}
