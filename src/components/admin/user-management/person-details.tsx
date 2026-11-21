"use client";

import { useEffect, useState } from "react";
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
import { tournamentRoleLabels } from "@/constants/constants";
import { ProfileWithName } from "@/db/types/profile";
import { tournamentRoles } from "@/db/types/role";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTournamentSlug } from "@/hooks/use-tournament-slug";
import { tournamentPath } from "@/lib/navigation";
import { getFullNameWithTitle } from "@/lib/participant";
import { cn } from "@/lib/utils";
import { DetailsLabel, DetailsSection } from "./details-section";
import { RatingsSection } from "./ratings";
import {
  TournamentRoles,
  useTournamentRoles,
} from "./tournament-roles-context";

const DESCRIPTION = "Kontakt, Rollen und Wertungen";

type Props = {
  name: string;
  profile: ProfileWithName;
};

export function PersonDetails({ name, profile }: Props) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const roles = useTournamentRoles(profile.id);
  const fullName = getFullNameWithTitle(
    roles.participant?.title ?? null,
    profile.firstName,
    profile.lastName,
  );

  const body = (
    <PersonDetailsBody name={fullName} profile={profile} roles={roles} />
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
            <DrawerTitle className="sr-only">{fullName}</DrawerTitle>
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
            <DialogTitle className="sr-only">{fullName}</DialogTitle>
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
  profile,
  roles,
}: {
  name: string;
  profile: ProfileWithName;
  roles: TournamentRoles;
}) {
  const slug = useTournamentSlug();
  const { participant } = roles;
  const roleLabels = tournamentRoles
    .filter((role) => roles[role] != null)
    .map((role) => tournamentRoleLabels[role]);

  return (
    <>
      <header className="space-y-1.5 border-b bg-muted px-5 py-5 pr-14 sm:px-6 sm:pr-14">
        <p className="text-lg font-semibold leading-tight tracking-tight">
          {name}
        </p>
        {participant ? (
          <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
            <span>{participant.chessClub}</span>
            {participant.nationality ? (
              <span>{participant.nationality}</span>
            ) : null}
            {participant.birthYear ? (
              <span className="whitespace-nowrap">
                Jg. {participant.birthYear}
              </span>
            ) : null}
          </p>
        ) : null}
        {roleLabels.length > 0 ? (
          <p className="text-sm">{roleLabels.join(", ")}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keine Rolle in diesem Turnier
          </p>
        )}
      </header>

      <div className="flex gap-2 overflow-x-auto border-b px-5 py-3 sm:px-6">
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${profile.email}`}>
            <Mail />
            Mail schreiben
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${profile.phoneNumber}`}>
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
            href={tournamentPath(
              slug,
              `/admin/logging?profileId=${profile.id}`,
            )}
          >
            <History />
            Verlauf
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 px-5 py-5 sm:px-6">
        {participant ? (
          <RatingsSection
            fideRating={participant.fideRating}
            dwzRating={participant.dwzRating}
            fideId={participant.fideId}
            dsbPersonId={participant.dsbPersonId}
          />
        ) : null}
        <DetailsSection title="Kontakt">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactValue
              label="E-Mail"
              value={profile.email}
              href={`mailto:${profile.email}`}
            />
            <ContactValue
              label="Telefon"
              value={profile.phoneNumber}
              href={`tel:${profile.phoneNumber}`}
            />
          </div>
        </DetailsSection>
      </div>
    </>
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
