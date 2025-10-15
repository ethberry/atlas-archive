"use client";

import { FC, useState, useRef, useEffect } from "react";
import { FormattedMessage } from "react-intl";

interface IOption {
  value: number;
  fractions: number;
  amount: number;
}

interface ISelectProps {
  value: number;
  onChange: (value: number) => void;
  options: Record<number, number>;
  error?: boolean;
  helperText?: string;
}

export const Select: FC<ISelectProps> = ({
  value,
  onChange,
  options,
  error,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<IOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert options to array and find selected option
  const optionsArray = Object.entries(options).map(([fractions, amount]) => ({
    value: amount,
    fractions: Number(fractions),
    amount,
  }));

  useEffect(() => {
    const selected = optionsArray.find((option) => option.value === value);
    setSelectedOption(selected || null);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option: IOption) => {
    onChange(option.value);
    setSelectedOption(option);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full text-left relative" ref={dropdownRef}>
      <label
        className="flex flex-col text-white text-sm mb-2"
        style={{ fontFamily: "var(--font-family-sans)" }}
      >
        <FormattedMessage id="form.label.package" />
      </label>

      <div className="relative">
        {/* Selected Option Display */}
        <button
          type="button"
          onClick={toggleDropdown}
          className={`w-full rounded-[12px] border-2 bg-[#212551] text-white text-base py-3 px-5 outline-none transition-all duration-300 cursor-pointer flex items-center justify-between ${
            error
              ? "border-red-500"
              : "border-transparent focus:border-white hover:border-[#262957]"
          }`}
          style={{
            fontFamily: "var(--font-family-sans)",
          }}
        >
          <span>
            {selectedOption ? (
              <FormattedMessage
                id="form.label.packageName"
                values={{
                  fractions: selectedOption.fractions,
                  amount: selectedOption.amount,
                }}
              />
            ) : (
              "Select package"
            )}
          </span>

          {/* Arrow Icon */}
          <div
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          >
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#8B8FA8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 bg-[#1B1B41] border-2 border-[#262957] rounded-[12px] overflow-hidden shadow-lg">
            {optionsArray.map((option, index) => {
              const isSelected = option.value === value;
              const isLast = index === optionsArray.length - 1;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-5 py-3 text-white transition-colors duration-200 flex items-center justify-between ${
                    isSelected
                      ? "bg-[#262957]"
                      : "bg-[#15112C] hover:bg-[#262957]"
                  } ${isLast ? "rounded-b-[10px]" : ""}`}
                  style={{
                    fontFamily: "var(--font-family-sans)",
                  }}
                >
                  <span>
                    <FormattedMessage
                      id="form.label.packageName"
                      values={{
                        fractions: option.fractions,
                        amount: option.amount,
                      }}
                    />
                  </span>

                  {/* Checkmark for selected option */}
                  {isSelected && (
                    <svg
                      width="16"
                      height="12"
                      viewBox="0 0 16 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 6L5.5 10.5L15 1"
                        stroke="#5865F2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {helperText && (
        <span
          className="text-sm text-[#DF1C1C] mt-1 pl-5 block"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};
