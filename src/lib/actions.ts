/* eslint-disable @typescript-eslint/no-explicit-any */

import { unstable_rethrow } from "next/navigation";

export type ErrorResponse = {
  error: string;
};

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export function action<TParams extends any[], TReturn>(
  callback: (...args: TParams) => Promise<TReturn>,
): (...args: TParams) => Promise<TReturn | ErrorResponse> {
  return async (...args: TParams): Promise<TReturn | ErrorResponse> => {
    try {
      const result = await callback(...args);
      return result;
    } catch (error) {
      unstable_rethrow(error);
      if (error instanceof ActionError) {
        return {
          error: error.message,
        };
      }
      console.error("Unexpected error:", error);
      return {
        error: "Ein unerwarteter Fehler ist aufgetreten",
      };
    }
  };
}

export function isError<T>(
  response: T | ErrorResponse,
): response is ErrorResponse {
  return (
    response != null && typeof response === "object" && "error" in response
  );
}
