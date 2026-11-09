import type { Collection } from "@spree/sdk";

type Translator = {
  (key: string): string;
  has: (key: string) => boolean;
};

type CollectionLabel = Pick<Collection, "name" | "permalink">;

export function collectionName(
  t: Translator,
  collection: CollectionLabel,
): string {
  const key = `names.${collection.permalink}`;
  return typeof t.has === "function" && t.has(key) ? t(key) : collection.name;
}

export function translatedCollectionDescription(
  t: Translator,
  collection: CollectionLabel,
): string | null {
  const key = `descriptions.${collection.permalink}`;
  return typeof t.has === "function" && t.has(key) ? t(key) : null;
}
