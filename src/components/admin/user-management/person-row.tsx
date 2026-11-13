import { ReactNode } from "react";

type Props = {
  name: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PersonRow({ name, meta, aside, actions, children }: Props) {
  return (
    <li className="flex items-start gap-3 px-3 py-3 sm:px-4">
      <div className="min-w-0 flex-1">
        <span className="font-medium">{name}</span>
        {meta ? (
          <div className="mt-0.5 space-y-0.5 text-sm text-muted-foreground">
            {meta}
          </div>
        ) : null}
      </div>
      {aside}
      {actions ? (
        <div className="-my-1.5 flex shrink-0 items-center gap-2">
          {actions}
        </div>
      ) : null}
      {children}
    </li>
  );
}

export function ContactLinks({
  email,
  phoneNumber,
}: {
  email?: string | null;
  phoneNumber?: string | null;
}) {
  if (!email && !phoneNumber) {
    return null;
  }

  return (
    <p className="flex min-w-0 flex-wrap gap-x-3 gap-y-0.5">
      {email ? (
        <a
          href={`mailto:${email}`}
          className="max-w-full truncate underline-offset-4 hover:text-foreground hover:underline"
        >
          {email}
        </a>
      ) : null}
      {phoneNumber ? (
        <a
          href={`tel:${phoneNumber}`}
          className="whitespace-nowrap underline-offset-4 hover:text-foreground hover:underline"
        >
          {phoneNumber}
        </a>
      ) : null}
    </p>
  );
}
