import { ReactNode } from "react";

export function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <h3 className="flex items-center gap-4 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-primary">
        <span className="shrink-0">{title}</span>
        <span aria-hidden className="h-px flex-1 bg-primary/35" />
      </h3>
      {children}
    </section>
  );
}

export function DetailsLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}
