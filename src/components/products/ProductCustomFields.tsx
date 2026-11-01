import type { CustomField } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { SectionLabel } from "@/components/products/SectionLabel";

interface ProductCustomFieldsProps {
  customFields?: Array<CustomField>;
}

function renderBooleanValue(
  value: unknown,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  return value ? t("yes") : t("no");
}

function renderValue(
  field: CustomField,
  t: ReturnType<typeof useTranslations<"products">>,
): React.ReactNode {
  switch (field.field_type) {
    case "boolean":
      return renderBooleanValue(field.value, t);
    case "json":
      return typeof field.value === "string"
        ? field.value
        : JSON.stringify(field.value);
    case "rich_text":
      // Value is admin-authored HTML from the Spree CMS backend (trusted source)
      return <span dangerouslySetInnerHTML={{ __html: field.value ?? "" }} />;
    case "short_text":
    case "long_text":
    case "number":
      return String(field.value);
    default:
      return String(field.value);
  }
}

export function ProductCustomFields({
  customFields,
}: ProductCustomFieldsProps): React.JSX.Element | null {
  const t = useTranslations("products");

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 border-t border-border pt-6">
      <SectionLabel>{t("properties")}</SectionLabel>
      <dl className="mt-4">
        {customFields.map((field) => (
          <div
            key={field.id}
            className="flex gap-3 border-b border-border py-2 first:border-b-0 first:pt-0"
          >
            <dt className="flex-0 shrink-0 py-1 text-xs font-semibold text-foreground">
              {field.label}
            </dt>
            <dd className="text-sm text-foreground">{renderValue(field, t)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
