export function isAxiosError(
  error: unknown
): error is { response: { data: { message?: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    error.response !== null &&
    typeof error.response === "object" &&
    error.response !== undefined &&
    "data" in error.response &&
    typeof (error.response as { data?: unknown }).data === "object"
  );
}
