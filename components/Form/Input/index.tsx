import { FC, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  error?: boolean;
  helperText?: ReactNode;
}

export const Input: FC<IInputProps> = (props) => {
  const { error, helperText, name, disabled, ...rest } = props;
  const { formatMessage } = useIntl();
  return (
    <div className="text-left w-full">
      <label
        className="flex flex-col text-white text-sm mb-2"
        style={{ fontFamily: "var(--font-family-sans)" }}
      >
        {formatMessage({ id: `form.label.${name}` })}
        <input
          name={name}
          disabled={disabled}
          className={clsx(
            "w-full rounded-[12px] text-base border-2 py-3 px-5 outline-none transition-all duration-300 mt-1 border-transparent focus:border-white",
            disabled
              ? "bg-[#3D4471] border-transparent text-[#414569] placeholder:text-[#777AA6] cursor-not-allowed"
              : error
                ? "bg-[#212551] text-white placeholder:text-[#777AA6] focus:border-[#E74C3C]"
                : "bg-[#212551] text-white placeholder:text-[#777AA6] focus:border-white",
          )}
          placeholder={formatMessage({ id: `form.placeholder.${name}` })}
          style={{ fontFamily: "var(--font-family-sans)" }}
          {...rest}
        />
      </label>
      {error && helperText && (
        <p
          className="text-sm text-[#DF1C1C] mt-1 pl-5"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
