import { cn } from "@/lib/cn";

export default function Container({ className, size = "default", as: Tag = "div", children }) {
  const sizes = {
    narrow: "max-w-4xl",
    default: "max-w-[1180px]",
    wide: "max-w-[1380px]",
  };

  return <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size] || sizes.default, className)}>{children}</Tag>;
}
