import { ReactNode } from "react";

type Props = {
  count: number;
  emptyMessage: string;
  description?: ReactNode;
  toolbar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
};

export function Roster({
  count,
  emptyMessage,
  description,
  toolbar,
  header,
  children,
}: Props) {
  return (
    <section className="space-y-3">
      {description || toolbar ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {description ? (
            <p className="max-w-prose text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
          {toolbar}
        </div>
      ) : null}
      {count === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          {header}
          <ul className="divide-y">{children}</ul>
        </div>
      )}
    </section>
  );
}
