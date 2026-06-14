import { cn } from "@/lib/cn";

export default function Card({ className, hover = true, as: Tag = "div", children, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-[24px] border border-[color:var(--stroke)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow-sm)]",
        hover && "transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--stroke-strong)] hover:shadow-[var(--shadow-md)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
