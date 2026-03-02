import { cn } from "@/lib/cn";

export default function Container({ className, size = "default", as: Tag = "div", children }) {
  const sizes = {
    narrow: "max-w-4xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  };

  return <Tag className={cn("mx-auto w-full px-4 sm:px-6", sizes[size] || sizes.default, className)}>{children}</Tag>;
}
