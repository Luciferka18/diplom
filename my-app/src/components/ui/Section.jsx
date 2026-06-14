import Container from "./Container";
import { cn } from "@/lib/cn";

export default function Section({ className, title, subtitle, eyebrow, children, containerSize = "default" }) {
  return (
    <section className={cn("py-12 md:py-16 lg:py-20", className)}>
      <Container size={containerSize}>
        {(eyebrow || title || subtitle) && (
          <div className="mb-7 max-w-3xl md:mb-10">
            {eyebrow ? <div className="nf-eyebrow mb-3">{eyebrow}</div> : null}
            {title ? <h2 className="text-3xl font-bold tracking-[-0.045em] text-[color:var(--text)] md:text-5xl">{title}</h2> : null}
            {subtitle ? <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)] md:text-lg">{subtitle}</p> : null}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
