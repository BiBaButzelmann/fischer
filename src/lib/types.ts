import type React from "react";

export type Role =
  | "spieler"
  | "schiedsrichter"
  | "aufbauhelfer"
  | "eingabehelfer"
  | "turniergericht";

export interface RoleInfo {
  id: Role;
  name: string;
  description: string;
  icon: React.ElementType;
}
