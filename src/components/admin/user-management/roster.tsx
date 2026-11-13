import { ReactNode } from "react";

type Props = {
  count: number;
  emptyMessage: string;
  description?: ReactNode;
  children: ReactNode;
};

export function Roster({ count, emptyMessage, description, children }: Props) {
  return (
    <section className="space-y-3">
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {count === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border">
          {children}
        </ul>
      )}
    </section>
  );
}
