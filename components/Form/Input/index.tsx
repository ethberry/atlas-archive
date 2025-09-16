import React from "react";
import clsx from "clsx";

interface IProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  wrapperClassName?: string;
  className?: string;
  error?: boolean;
  helperText?: string;
  textarea?: boolean;
}

const Input: React.FC<IProps> = ({
  wrapperClassName,
  className,
  error,
  helperText,
  textarea,
  ...props
}) => {
  return (
    <div className={clsx(wrapperClassName, "w-full")}>
      {!textarea ? (
        <input
          className={clsx(
            "w-full rounded-2xl border-2 border-yellow-400 bg-transparent text-white placeholder:text-gray-400 text-[16px] mobile:text-[18px] py-[14px] px-5 outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300 shadow-[0_0_12px_rgba(255,255,100,0.3)]",
            { "border-red-500 focus:ring-red-500 focus:border-red-500": error },
            className,
          )}
          {...props}
        />
      ) : (
        <textarea
          className={clsx(
            "w-full rounded-2xl border-2 border-yellow-400 bg-transparent text-white placeholder:text-gray-400 text-[16px] mobile:text-[18px] py-[14px] px-5 outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300 shadow-[0_0_12px_rgba(255,255,100,0.3)]",
            { "border-red-500 focus:ring-red-500 focus:border-red-500": error },
            className,
          )}
          {...props}
        />
      )}
      {error && (
        <p className="flex text-sm text-red-500 mt-[8px]">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
