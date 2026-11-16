"use client";

import type { Country, State } from "@spree/sdk";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddressFormData } from "@/lib/utils/address";
import { countryName, sortByCountryName } from "@/lib/utils/format";

interface AddressFormFieldsProps {
  address: AddressFormData;
  countries: Country[];
  states: State[];
  loadingStates: boolean;
  onChange: (field: keyof AddressFormData, value: string) => void;
  idPrefix: string;
  /**
   * Autofill section for pages that show more than one address form, so the
   * browser fills shipping and billing from the right saved address.
   */
  autoCompleteSection?: "shipping" | "billing";
}

export function AddressFormFields({
  address,
  countries,
  states,
  loadingStates,
  onChange,
  idPrefix,
  autoCompleteSection,
}: AddressFormFieldsProps) {
  const autoComplete = (token: string): string =>
    autoCompleteSection ? `${autoCompleteSection} ${token}` : token;
  const t = useTranslations("address");
  const locale = useLocale();
  const sortedCountries = useMemo(
    () => sortByCountryName(countries, locale),
    [countries, locale],
  );
  const tc = useTranslations("common");
  const hasStates = states.length > 0;
  const showMexicanAddressHelp =
    !address.country_code || address.country_code === "MX";

  return (
    <div className="flex flex-col gap-3">
      {/* Country */}
      <div>
        <label
          htmlFor={`${idPrefix}-country`}
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          {t("country")}
        </label>
        <NativeSelect
          id={`${idPrefix}-country`}
          name="country"
          autoComplete={autoComplete("country")}
          className="w-full"
          value={address.country_code}
          onChange={(e) => onChange("country_code", e.target.value)}
          required
        >
          <NativeSelectOption value="" disabled>
            {t("selectCountry")}
          </NativeSelectOption>
          {sortedCountries.map((country) => (
            <NativeSelectOption key={country.iso} value={country.iso}>
              {countryName(country.iso, locale)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* First name / Last name */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-first_name`}
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            {t("firstName")}
          </label>
          <Input
            type="text"
            id={`${idPrefix}-first_name`}
            name="first_name"
            autoComplete={autoComplete("given-name")}
            value={address.first_name}
            onChange={(e) => onChange("first_name", e.target.value)}
            placeholder={t("firstName")}
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-last_name`}
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            {t("lastName")}
          </label>
          <Input
            type="text"
            id={`${idPrefix}-last_name`}
            name="last_name"
            autoComplete={autoComplete("family-name")}
            required
            value={address.last_name}
            onChange={(e) => onChange("last_name", e.target.value)}
            placeholder={t("lastName")}
          />
        </div>
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor={`${idPrefix}-company`}
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          {t("company")}
        </label>
        <Input
          type="text"
          id={`${idPrefix}-company`}
          name="company"
          autoComplete={autoComplete("organization")}
          value={address.company}
          onChange={(e) => onChange("company", e.target.value)}
          placeholder={t("company")}
        />
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor={`${idPrefix}-address1`}
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          {t("address")}
        </label>
        <Input
          type="text"
          id={`${idPrefix}-address1`}
          name="address1"
          autoComplete={autoComplete("address-line1")}
          aria-describedby={
            showMexicanAddressHelp ? `${idPrefix}-address1-help` : undefined
          }
          required
          value={address.address1}
          onChange={(e) => onChange("address1", e.target.value)}
          placeholder={
            showMexicanAddressHelp ? "Calle Reforma 123, Centro" : t("address")
          }
          pattern={
            address.country_code === "MX"
              ? ".+\\s+[0-9]+[A-Za-z0-9-]*\\s*,\\s*[^,]+"
              : undefined
          }
          title={showMexicanAddressHelp ? t("mxAddressParts") : undefined}
        />
        {showMexicanAddressHelp && (
          <div
            id={`${idPrefix}-address1-help`}
            className="mt-1.5 space-y-0.5 text-xs leading-5 text-muted-foreground"
          >
            <p>
              <span className="font-medium text-foreground">
                {t("mxAddressExample")}
              </span>{" "}
              Calle Reforma 123, Centro
            </p>
            <p>{t("mxAddressParts")}</p>
          </div>
        )}
      </div>

      {/* Apartment */}
      <div>
        <label
          htmlFor={`${idPrefix}-address2`}
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          {t("apartment")}
        </label>
        <Input
          type="text"
          id={`${idPrefix}-address2`}
          name="address2"
          autoComplete={autoComplete("address-line2")}
          value={address.address2}
          onChange={(e) => onChange("address2", e.target.value)}
          placeholder={t("apartment")}
        />
        {showMexicanAddressHelp && (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {t("mxApartmentHelp")}
          </p>
        )}
      </div>

      {/* City / State / ZIP — 3 columns */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor={`${idPrefix}-city`}
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            {t("city")}
          </label>
          <Input
            type="text"
            id={`${idPrefix}-city`}
            name="city"
            autoComplete={autoComplete("address-level2")}
            required
            value={address.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder={t("city")}
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-state`}
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            {t("stateProvince")}
          </label>
          {loadingStates ? (
            <NativeSelect
              id={`${idPrefix}-state`}
              name="state"
              autoComplete={autoComplete("address-level1")}
              aria-label={t("stateProvince")}
              className="w-full"
              disabled
            >
              <NativeSelectOption value="">{tc("loading")}</NativeSelectOption>
            </NativeSelect>
          ) : hasStates ? (
            <Select
              name="state"
              value={address.state_code}
              onValueChange={(value) => onChange("state_code", value)}
              required
            >
              <SelectTrigger
                id={`${idPrefix}-state`}
                className="h-11 w-full rounded-md bg-background shadow-sm focus-visible:ring-primary/20"
              >
                <SelectValue placeholder={t("selectState")} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.abbr} value={state.abbr}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="text"
              id={`${idPrefix}-state`}
              name="state"
              autoComplete={autoComplete("address-level1")}
              aria-label={t("stateProvince")}
              value={address.state_name}
              onChange={(e) => onChange("state_name", e.target.value)}
              placeholder={t("stateProvince")}
            />
          )}
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-postal_code`}
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            {t("zipCode")}
          </label>
          <Input
            type="text"
            id={`${idPrefix}-postal_code`}
            name="postal_code"
            autoComplete={autoComplete("postal-code")}
            required
            value={address.postal_code}
            onChange={(e) => onChange("postal_code", e.target.value)}
            placeholder={t("zipCode")}
          />
        </div>
      </div>
      {showMexicanAddressHelp && (
        <p className="text-xs leading-5 text-muted-foreground">
          {t("mxLocationHelp")}
        </p>
      )}

      {/* Phone */}
      <div>
        <label
          htmlFor={`${idPrefix}-phone`}
          className="mb-1.5 block text-xs font-medium text-foreground"
        >
          {t("phone")}
        </label>
        <Input
          type="tel"
          id={`${idPrefix}-phone`}
          name="phone"
          autoComplete={autoComplete("tel")}
          required
          value={address.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder={t("phone")}
        />
        {showMexicanAddressHelp && (
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {t("mxPhoneHelp")}
          </p>
        )}
      </div>
    </div>
  );
}
