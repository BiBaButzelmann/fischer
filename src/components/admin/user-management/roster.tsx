import { ReactNode } from "react";

type Props = {
  count: number;
  emptyMessage: string;
  description?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function RosterList({
  header,
  children,
}: {
  header?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {header}
      <ul className="divide-y">{children}</ul>
    </div>
  );
}

export function Roster({
  count,
  emptyMessage,
  description,
  toolbar,
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
          {toolbar ? <div className="sm:ml-auto">{toolbar}</div> : null}
        </div>
      ) : null}
      {count === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </section>
  );
}
