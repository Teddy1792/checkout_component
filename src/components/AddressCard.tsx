import { useState, type ChangeEvent, type FormEvent } from "react";
import { Check, MapPin, Pencil, X } from "lucide-react";
import type { Address, AddressErrors } from "../types";
import { normalizeAddress, validateAddress } from "../lib/validation";

interface AddressCardProps {
  address: Address;
  onSave: (address: Address) => void;
  isLocked?: boolean;
}

const fields: Array<{
  key: keyof Address;
  label: string;
  autoComplete: string;
  maxLength: number;
  className?: string;
}> = [
  { key: "fullName", label: "Full name", autoComplete: "name", maxLength: 100 },
  { key: "addressLine1", label: "Street address", autoComplete: "address-line1", maxLength: 120 },
  { key: "addressLine2", label: "Apt, suite, etc. (optional)", autoComplete: "address-line2", maxLength: 120 },
  { key: "city", label: "City", autoComplete: "address-level2", maxLength: 80 },
  { key: "region", label: "State", autoComplete: "address-level1", maxLength: 2, className: "sm:col-span-1" },
  { key: "postalCode", label: "ZIP code", autoComplete: "postal-code", maxLength: 10, className: "sm:col-span-1" },
];

export function AddressCard({ address, onSave, isLocked = false }: AddressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(address);
  const [errors, setErrors] = useState<AddressErrors>({});

  const startEditing = () => {
    setDraft(address);
    setErrors({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(address);
    setErrors({});
    setIsEditing(false);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const key = event.currentTarget.name as keyof Address;
    setDraft((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeAddress(draft);
    const nextErrors = validateAddress(normalized);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave(normalized);
    setDraft(normalized);
    setIsEditing(false);
  };

  return (
    <section id="shipping" className="border-t border-line pt-7" aria-labelledby="shipping-title">
      <div className="mb-5 flex items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Ships to</p>
          <h2 id="shipping-title" className="mt-1 font-display text-[27px] leading-tight text-ink">
            Your saved address
          </h2>
        </div>
        {!isEditing && !isLocked && (
          <button
            type="button"
            onClick={startEditing}
            className="mt-1 flex min-h-11 items-center gap-2 px-2 text-sm font-bold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
          >
            <Pencil size={15} aria-hidden="true" /> Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} noValidate className="rounded-sm bg-white p-5 shadow-card sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const errorId = field.key + "-error";
              return (
                <label
                  key={field.key}
                  className={"block " + (field.className ?? "sm:col-span-2")}
                >
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    {field.label}
                  </span>
                  <input
                    name={field.key}
                    value={draft[field.key]}
                    onChange={handleChange}
                    autoComplete={field.autoComplete}
                    maxLength={field.maxLength}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={errors[field.key] ? errorId : undefined}
                    className="h-12 w-full rounded-sm border border-line bg-cream/40 px-3.5 text-base text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-red-600"
                  />
                  {errors[field.key] && (
                    <span id={errorId} className="mt-1.5 block text-xs font-medium text-red-700">
                      {errors[field.key]}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="button-primary !min-h-11 !px-5">
              <Check size={17} aria-hidden="true" /> Save address
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="flex min-h-11 items-center gap-2 px-3 text-sm font-bold text-muted"
            >
              <X size={17} aria-hidden="true" /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-4 rounded-sm bg-white p-5 shadow-card sm:p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-pale text-brand">
            <MapPin size={19} aria-hidden="true" />
          </div>
          <address className="not-italic text-[15px] leading-6 text-muted">
            <strong className="font-bold text-ink">{address.fullName}</strong><br />
            {address.addressLine1}<br />
            {address.addressLine2 && <>{address.addressLine2}<br /></>}
            {address.city}, {address.region} {address.postalCode}
          </address>
        </div>
      )}
    </section>
  );
}
