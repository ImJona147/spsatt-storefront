"use client";

import { Check, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type RuleId = "length" | "uppercase" | "lowercase" | "number" | "symbol";

const RULE_LABEL_KEYS: Record<RuleId, string> = {
  length: "requirementLength",
  uppercase: "requirementUppercase",
  lowercase: "requirementLowercase",
  number: "requirementNumber",
  symbol: "requirementSymbol",
};

const RULE_TESTS: Record<RuleId, (password: string) => boolean> = {
  length: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  lowercase: (password) => /[a-z]/.test(password),
  number: (password) => /[0-9]/.test(password),
  symbol: (password) => /[^A-Za-z0-9]/.test(password),
};

const RULE_ORDER: RuleId[] = [
  "length",
  "uppercase",
  "lowercase",
  "number",
  "symbol",
];

export function isPasswordValid(password: string): boolean {
  return RULE_ORDER.every((id) => RULE_TESTS[id](password));
}

interface PasswordChecklistProps {
  password: string;
  id: string;
}

/**
 * Requisitos de contraseña en vivo (patrón "ayuda antes del error"):
 * se muestra siempre bajo el campo y cada regla se marca al cumplirse,
 * en vez de esperar al envío para decir "no válida".
 */
export function PasswordChecklist({ password, id }: PasswordChecklistProps) {
  const t = useTranslations("register");

  return (
    <ul
      id={id}
      aria-label={t("passwordRequirementsLabel")}
      className="space-y-1"
    >
      {RULE_ORDER.map((ruleId) => {
        const met = password.length > 0 && RULE_TESTS[ruleId](password);
        return (
          <li
            key={ruleId}
            className={cn(
              "flex items-center gap-2 text-[0.8125rem] leading-tight transition-colors",
              met ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check
                aria-hidden
                focusable="false"
                className="size-4 shrink-0 text-primary"
              />
            ) : (
              <Circle
                aria-hidden
                focusable="false"
                className="size-4 shrink-0 text-muted-foreground"
              />
            )}
            {t(RULE_LABEL_KEYS[ruleId])}
          </li>
        );
      })}
    </ul>
  );
}
