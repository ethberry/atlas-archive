import { FC } from "react";

interface IChevronIconProps {
  className?: string;
}

export const ChevronIcon: FC<IChevronIconProps> = ({ className = "" }) => (
  <svg
    width="11"
    height="8"
    viewBox="0 0 11 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M1.25195 1.8942L5.46354 6.10579L9.67512 1.8942"
      stroke="#6D75B9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
