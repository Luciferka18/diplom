import { cn } from "@/lib/cn";

export default function Card({ className, hover = true, as: Tag = "div", children }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-white/12 bg-white/6 backdrop-blur-md p-5 shadow-[0_12px_34px_rgba(0,0,0,0.25)]",
        hover &&
          "transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/35 hover:shadow-[0_16px_42px_rgba(16,185,129,0.18)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
