import { getStoreName } from "@/lib/store";

export function brandedTitle(title: string): string {
  const brand = getStoreName();
  const parts = title.split("|").map((part) => part.trim());
  while (
    parts.length > 1 &&
    parts.at(-1)?.toLowerCase() === brand.toLowerCase()
  ) {
    parts.pop();
  }
  return `${parts.join(" | ")} | ${brand}`;
}
