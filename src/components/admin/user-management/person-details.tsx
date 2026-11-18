"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, History, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";
import { tournamentPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const DESCRIPTION = "Kontakt, Rollen und Wertungen";

type Props = {
  name: string;
  subtitle?: ReactNode;
  roles: string[];
  email: string;
  phoneNumber: string;
  profileId: number;
  children?: ReactNode;
};

export function PersonDetails({
  name,
  subtitle,
  roles,
  email,
  phoneNumber,
  profileId,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const body = (
    <PersonDetailsBody
      name={name}
      subtitle={subtitle}
      roles={roles}
      email={email}
      phoneNumber={phoneNumber}
      profileId={profileId}
    >
      {children}
    </PersonDetailsBody>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="text-left font-medium underline-offset-4 after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring group-hover/person-row:underline"
      >
        {name}
      </button>
      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
          <DrawerContent>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Schließen"
                  className="absolute right-3 top-3 z-10 h-9 w-9"
                />
              }
            >
              <X className="h-4 w-4" />
            </DrawerClose>
            <DrawerTitle className="sr-only">{name}</DrawerTitle>
            <DrawerDescription className="sr-only">
              {DESCRIPTION}
            </DrawerDescription>
            <div
              data-base-ui-swipe-ignore
              className="min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              {body}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85dvh] max-w-xl gap-0 overflow-y-auto p-0">
            <DialogTitle className="sr-only">{name}</DialogTitle>
            <DialogDescription className="sr-only">
              {DESCRIPTION}
            </DialogDescription>
            {body}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function PersonDetailsBody({
  name,
  subtitle,
  roles,
  email,
  phoneNumber,
  profileId,
  children,
}: Props) {
  const slug = useTournamentSlug();

  return (
    <>
      <header className="space-y-1.5 border-b bg-muted px-5 py-5 pr-14 sm:px-6 sm:pr-14">
        <p className="text-lg font-semibold leading-tight tracking-tight">
          {name}
        </p>
        {subtitle ? (
          <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
        {roles.length > 0 ? (
          <p className="text-sm">{roles.join(", ")}</p>
        ) : null}
      </header>

      <div className="flex gap-2 overflow-x-auto border-b px-5 py-3 sm:px-6">
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${email}`}>
            <Mail />
            Mail schreiben
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${phoneNumber}`}>
            <Phone />
            Anrufen
          </a>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <Link
            href={tournamentPath(slug, `/admin/logging?profileId=${profileId}`)}
          >
            <History />
            Verlauf
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 px-5 py-5 sm:px-6">
        {children}
        <DetailsSection title="Kontakt">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactValue
              label="E-Mail"
              value={email}
              href={`mailto:${email}`}
            />
            <ContactValue
              label="Telefon"
              value={phoneNumber}
              href={`tel:${phoneNumber}`}
            />
          </div>
        </DetailsSection>
      </div>
    </>
  );
}

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

function ContactValue({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-1">
        <a
          href={href}
          className="truncate text-base font-medium underline-offset-4 hover:underline"
        >
          {value}
        </a>
        <CopyButton value={value} label={`${label} kopieren`} />
      </div>
      <DetailsLabel>{label}</DetailsLabel>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  const iconClassName =
    "col-start-1 row-start-1 h-3.5 w-3.5 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none";

  return (
    <button
      type="button"
      aria-label={copied ? "Kopiert" : label}
      title={copied ? "Kopiert" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-secondary hover:text-foreground active:scale-[0.97]"
    >
      <Copy
        className={cn(
          iconClassName,
          copied ? "scale-50 opacity-0" : "scale-100 opacity-100",
        )}
      />
      <Check
        className={cn(
          iconClassName,
          "text-foreground",
          copied ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
    </button>
  );
}
