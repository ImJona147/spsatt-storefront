import type { CustomField } from "@spree/sdk";
import { useTranslations } from "next-intl";

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
    <div className="mt-6 border-t border-border pt-6">
      <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary">
        <span aria-hidden className="h-px w-8 bg-primary" />
        {t("properties")}
      </h2>
      <dl className="mt-4">
        {customFields.map((field) => (
          <div
            key={field.id}
            className="flex gap-4 border-t border-border py-2.5 first:border-t-0 first:pt-0"
          >
            <dt className="w-28 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {field.label}
            </dt>
            <dd className="min-w-0 text-sm font-medium text-foreground">
              {renderValue(field, t)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
