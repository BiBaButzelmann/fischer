import { ReactNode } from "react";

type Props = {
  count: number;
  emptyMessage: string;
  description?: ReactNode;
  search?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function RosterEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

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
  search,
  toolbar,
  children,
}: Props) {
  return (
    <section className="space-y-3">
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {search || toolbar ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {search ? <div className="sm:w-72">{search}</div> : null}
          {toolbar ? <div className="sm:ml-auto">{toolbar}</div> : null}
        </div>
      ) : null}
      {count === 0 ? <RosterEmpty>{emptyMessage}</RosterEmpty> : children}
    </section>
  );
}
