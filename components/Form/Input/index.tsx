import { FC, InputHTMLAttributes } from "react";
import clsx from "clsx";
import { useIntl } from "react-intl";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  error?: boolean;
  helperText?: string;
}

export const Input: FC<IInputProps> = (props) => {
  const { error, helperText, name, ...rest } = props;
  const { formatMessage } = useIntl();
  return (
    <div className={"text-center w-full"}>
      <label className="flex flex-col text-white text-sm">
        {formatMessage({ id: `form.label.${name}` })}
        <input
          name={name}
          className={clsx(
            "w-full rounded-2xl border-2 border-yellow-400 bg-transparent text-white placeholder:text-gray-400 text-[16px] mobile:text-[18px] py-[14px] px-5 outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300 shadow-[0_0_12px_rgba(255,255,100,0.3)]",
            { "border-red-500 focus:ring-red-500 focus:border-red-500": error },
            "w-full bg-white/10 backdrop-blur-sm border-2 border-yellow-400/50 focus:border-yellow-400 transition-all duration-300 placeholder-gray-300",
          )}
          placeholder={formatMessage({ id: `form.placeholder.${name}` })}
          {...rest}
        />
      </label>
      {error && (
        <p className="flex text-sm text-red-500 mt-[8px]">{helperText}</p>
      )}
    </div>
  );
};
