import Container from "./Container";
import { cn } from "@/lib/cn";

export default function Section({ className, title, subtitle, children, containerSize = "default" }) {
  return (
    <section className={cn("py-10 md:py-12", className)}>
      <Container size={containerSize}>
        {(title || subtitle) && (
          <div className="mb-6 md:mb-8">
            {title ? <h2 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm md:text-base text-[color:var(--muted)] max-w-2xl">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
