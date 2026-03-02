import { cn } from "@/lib/cn";

export default function Card({ className, hover = true, as: Tag = "div", children, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
        hover && "transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_var(--accentGlow)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
