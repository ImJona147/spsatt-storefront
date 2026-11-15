import type { Product } from "@spree/sdk";

export function productCustomField(product: Product, keys: string[]): string {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const field = product.custom_fields?.find((field) =>
    [field.key, field.label].some((name) => keys.includes(normalize(name))),
  );
  return typeof field?.value === "string" ? field.value.trim() : "";
}

export function validGtin(value: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
  const digits = [...value].map(Number);
  const check = digits.pop();
  const sum = digits
    .reverse()
    .reduce(
      (total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1),
      0,
    );
  return (10 - (sum % 10)) % 10 === check;
}
