import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import clsx from "clsx";

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export const Button: FC<IButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={clsx(
        "bg-transparent text-white hover:text-yellow-500 rounded-full text-[12px] mobile:text-base px-5 py-3 font-semibold text-[#393939] border-2 border-yellow-500",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
