import { cn } from "@/lib/cn";

export default function Card({ className, hover = true, as: Tag = "div", children }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_12px_30px_rgba(0,0,0,0.22)]",
        hover && "transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30",
        className
      )}
    >
      {children}
    </Tag>
  );
}
