"use client";

import { createContext, ReactNode, useContext } from "react";
import { ParticipantWithProfileAndGroup } from "@/db/types/participant";
import { RolesData } from "@/db/types/role";

export type TournamentRoles = Partial<Omit<RolesData, "participant">> & {
  participant?: ParticipantWithProfileAndGroup;
};

type RolesByProfileId = Record<number, TournamentRoles>;

const NO_ROLES: TournamentRoles = {};

const TournamentRolesContext = createContext<RolesByProfileId>({});

export function TournamentRolesProvider({
  rolesByProfileId,
  children,
}: {
  rolesByProfileId: RolesByProfileId;
  children: ReactNode;
}) {
  return (
    <TournamentRolesContext.Provider value={rolesByProfileId}>
      {children}
    </TournamentRolesContext.Provider>
  );
}

export function useTournamentRoles(profileId: number) {
  return useContext(TournamentRolesContext)[profileId] ?? NO_ROLES;
}
