"use client";

import type { Country, State } from "@spree/sdk";
import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { User } from "@/contexts/AuthContext";
import { useCountryStates } from "@/hooks/useCountryStates";
import {
  type AddressFormData,
  addressToFormData,
  emptyAddress,
  formDataToAddress,
  updateAddressField,
} from "@/lib/utils/address";
import { AddressFormFields } from "./AddressFormFields";

interface AddressEditModalProps {
  address: {
    id?: string;
    first_name: string | null;
    last_name: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    postal_code: string | null;
    phone: string | null;
    company: string | null;
    country_code: string;
    state_code: string | null;
    state_name: string | null;
  } | null;
  countries: Country[];
  fetchStates: (countryIso: string) => Promise<State[]>;
  onSave: (
    data: ReturnType<typeof formDataToAddress>,
    id?: string,
  ) => Promise<void>;
  onClose: () => void;
  title?: string;
  user?: User | null;
}

export function AddressEditModal({
  address,
  countries,
  fetchStates,
  onSave,
  onClose,
  title,
  user,
}: AddressEditModalProps) {
  const t = useTranslations("address");
  const tc = useTranslations("common");
  const [formData, setFormData] = useState<AddressFormData>(() => {
    if (address) return addressToFormData(address);
    return {
      ...emptyAddress,
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    };
  });
  const [states, loadingStates] = useCountryStates(
    formData.country_code,
    fetchStates,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => updateAddressField(prev, field, value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(formDataToAddress(formData), address?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  const modalTitle =
    title ?? (address?.id ? t("editAddress") : t("addNewAddress"));

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <form
          onSubmit={handleSubmit}
          className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col"
        >
          <div className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
            <DialogTitle className="text-lg font-medium text-foreground">
              {modalTitle}
            </DialogTitle>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
            {error && (
              <Alert variant="destructive" className="mb-3">
                <CircleAlert />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AddressFormFields
              address={formData}
              countries={countries}
              states={states}
              loadingStates={loadingStates}
              onChange={handleChange}
              idPrefix="modal"
            />
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row-reverse sm:px-5">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? tc("saving") : t("saveAddress")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {tc("cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
