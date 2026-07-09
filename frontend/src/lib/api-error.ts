import { AxiosError } from "axios";

import { ApiErrorResponse } from "@/types/user";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (!data?.detail) return fallback;

    if (typeof data.detail === "string") return data.detail;

    // FastAPI/Pydantic validation errors come back as a list of {msg, loc}
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail.map((d) => d.msg).join(" ");
    }
  }
  return fallback;
}
