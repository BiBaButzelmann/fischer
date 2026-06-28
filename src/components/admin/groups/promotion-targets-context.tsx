"use client";

import { createContext, useContext } from "react";

const PromotionTargetsContext = createContext<Record<number, string>>({});

export const PromotionTargetsProvider = PromotionTargetsContext.Provider;

export function usePromotionTarget(participantId: number): string | undefined {
  return useContext(PromotionTargetsContext)[participantId];
}
