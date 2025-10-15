"use client";

import Link from "next/link";
import { FC } from "react";
import { FormattedMessage } from "react-intl";

interface ICheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  labelId: string;
}

export const Checkbox: FC<ICheckboxProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  labelId,
}) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-5 h-5 bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
        style={{
          backgroundColor: "white",
          backgroundImage: checked
            ? `url("data:image/svg+xml,%3Csvg width='12' height='10' viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
            : undefined,
          backgroundSize: "12px 10px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <label
        htmlFor={id}
        className="text-white text-[14px] md:text-base cursor-pointer"
        style={{ fontFamily: "var(--font-family-sans)" }}
      >
        <FormattedMessage
          id={labelId}
          values={{
            a: (chunks) => (
              <Link
                key={labelId}
                href="/terms-of-use"
                className="text-[#4c5fd5] hover:text-[#4c5fd5] transition-colors"
                rel="noopener noreferrer"
              >
                {chunks}
              </Link>
            ),
          }}
        />
      </label>
    </div>
  );
};
