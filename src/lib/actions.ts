/* eslint-disable @typescript-eslint/no-explicit-any */

type ErrorResponse = {
  error: string;
};

export function action<TParams extends any[], TReturn>(
  callback: (...args: TParams) => Promise<TReturn>,
): (...args: TParams) => Promise<TReturn | ErrorResponse> {
  return async (...args: TParams): Promise<TReturn | ErrorResponse> => {
    try {
      const result = await callback(...args);
      return result;
    } catch (error) {
      console.error("Unexpected error:", error);
      if (error instanceof Error) {
        return {
          error: error.message,
        };
      }
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
