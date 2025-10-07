import { FC, useState, FocusEvent, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";

import { PdfPreview } from "@/app/saft/PdfPreview";
import type { IUserData } from "@/app/saft/interfaces";
import { Input } from "@/components/Form/Input";
import { CODE_TIMEOUT, SAFT_PACKAGES } from "@/app/saft/constants";
import { verificationSchema } from "@/app/saft/validation";

interface IEmailFormProps {
  useFormInstance: UseFormReturn<IUserData>;
  submitEmailForm: (formData: IUserData) => void;
}

export const EmailForm: FC<IEmailFormProps> = (props) => {
  const { useFormInstance, submitEmailForm } = props;
  const { formatMessage } = useIntl();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    control,
    trigger,
    watch,
  } = useFormInstance;

  const [formData, setFormData] = useState<IUserData>(getValues());
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState<boolean>(false);
  const [verificationCodeSent, setVerificationCodeSent] =
    useState<boolean>(false);
  const [millisecondsLeft, setMillisecondsLeft] = useState(0);
  const [pageTimerLeft, setPageTimerLeft] = useState(10 * 60 * 1000); // 10 minutes in milliseconds

  const formDateRT = watch();
  const disabled = isSubmitting || !hasScrolledToEnd;

  const { mutate: sendVerificationCode } = useMutation({
    mutationFn: async (data: IUserData) => {
      const { email, language } = data;
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw json.error;
      }

      return json;
    },
    onSuccess: () => {
      setVerificationCodeSent(true);
      setMillisecondsLeft(CODE_TIMEOUT);
      enqueueSnackbar(
        formatMessage({ id: "components.messages.verificationCode" }),
        {
          variant: "success",
        },
      );
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar(error as unknown as string, {
        variant: "error",
      });
    },
  });

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScrollToEnd = () => {
    setHasScrolledToEnd(true);
  };

  const handleSendVerificationCode = () => {
    sendVerificationCode(formData);
  };

  const handleFormSubmit = async (data: IUserData) => {
    const isValid = await trigger();
    if (isValid) {
      submitEmailForm(data);
    }
  };

  useEffect(() => {
    if (!verificationCodeSent) {
      return;
    }

    const intervalId = setInterval(() => {
      setMillisecondsLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [verificationCodeSent]);

  // Page timer countdown from 10 minutes
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPageTimerLeft((prev) => Math.max(prev - 1000, 0));
    }, 1000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  return (
    <form
      className="space-y-6 w-full max-w-3xl mx-auto"
      onSubmit={(e) => {
        void handleSubmit((data) => {
          void handleFormSubmit(data);
        })(e);
      }}
    >
      <PdfPreview formData={formData} onScrollToEnd={handleScrollToEnd} />

      {/* Checkboxes and Timer Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center gap-3">
            <Controller
              name="consent"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="checkbox"
                  id="consent"
                  checked={value}
                  onChange={onChange}
                  disabled={!hasScrolledToEnd}
                  className="w-5 h-5 rounded-[4px] border-2 border-[#5865F2] bg-transparent checked:bg-[#5865F2] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat transition-all duration-200"
                  style={{
                    backgroundImage: value
                      ? `url("data:image/svg+xml,%3Csvg width='12' height='10' viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
                      : undefined,
                  }}
                />
              )}
            />
            <label
              htmlFor="consent"
              className="text-white text-base cursor-pointer"
              style={{ fontFamily: "var(--font-family-sans)" }}
            >
              <FormattedMessage id="form.label.consent" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="nonUsPerson"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="checkbox"
                  id="nonUsPerson"
                  checked={value}
                  onChange={onChange}
                  className="w-5 h-5 rounded-[4px] border-2 border-[#5865F2] bg-transparent checked:bg-[#5865F2] cursor-pointer appearance-none checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat transition-all duration-200"
                  style={{
                    backgroundImage: value
                      ? `url("data:image/svg+xml,%3Csvg width='12' height='10' viewBox='0 0 12 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5L4.5 8.5L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
                      : undefined,
                  }}
                />
              )}
            />
            <label
              htmlFor="nonUsPerson"
              className="text-white text-base cursor-pointer"
              style={{ fontFamily: "var(--font-family-sans)" }}
            >
              <FormattedMessage id="form.label.nonUsPerson" />
            </label>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-center gap-3">
          <div className="w-full max-w-[133px] flex flex-col gap-3">
            <div
              className="text-base text-white text-right flex items-center justify-end gap-[2px]"
              style={{ fontFamily: "var(--font-family-sans)" }}
            >
              <span className="inline-block w-[50px] text-[50px] text-center">
                {String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[0]}
              </span>
              <span
                className="inline-block w-[50px] text-[50px] text-center flip-number"
                key={`min-${String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[1]}`}
              >
                {String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[1]}
              </span>
              <span className="w-[50px] text-[50px] text-center">:</span>
              <span
                className="inline-block w-[50px] text-[50px] text-center flip-number"
                key={`sec-tens-${String(Math.floor((pageTimerLeft % 60000) / 1000)).padStart(2, "0")[0]}`}
              >
                {
                  String(Math.floor((pageTimerLeft % 60000) / 1000)).padStart(
                    2,
                    "0",
                  )[0]
                }
              </span>
              <span
                className="inline-block w-[50px] text-[50px] text-center flip-number"
                key={`sec-ones-${String(Math.floor((pageTimerLeft % 60000) / 1000)).padStart(2, "0")[1]}`}
              >
                {
                  String(Math.floor((pageTimerLeft % 60000) / 1000)).padStart(
                    2,
                    "0",
                  )[1]
                }
              </span>
            </div>
            <div
              className="relative w-full h-[12px] rounded-full"
              style={{ background: "rgba(30, 35, 70, 0.5)" }}
            >
              <div
                className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${(pageTimerLeft / (10 * 60 * 1000)) * 100}%`,
                  background: "#2887CC",
                  boxShadow:
                    "0 0 30px 8px rgba(66, 165, 245, 0.8), 0 0 60px 15px rgba(66, 165, 245, 0.4)",
                  filter: "brightness(1.2)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Name Fields Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="firstName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="firstName"
              value={value}
              onChange={onChange}
              maxLength={40}
              error={Boolean(errors.firstName?.message)}
              helperText={
                errors.firstName?.message
                  ? formatMessage({ id: errors.firstName.message })
                  : void 0
              }
              onBlur={handleBlur}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="lastName"
              value={value}
              onChange={onChange}
              maxLength={40}
              error={Boolean(errors.lastName?.message)}
              helperText={
                errors.lastName?.message
                  ? formatMessage({ id: errors.lastName.message })
                  : void 0
              }
              onBlur={handleBlur}
            />
          )}
        />
      </div>

      {/* Email and Verification Code Row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                name="email"
                value={value}
                onChange={onChange}
                maxLength={255}
                error={Boolean(errors.email?.message)}
                helperText={
                  errors.email?.message
                    ? formatMessage({ id: errors.email.message })
                    : void 0
                }
                onBlur={handleBlur}
              />
            )}
          />
        </div>

        <button
          className={`px-4 py-[12px] text-base font-normal rounded-[12px] border-2 text-white whitespace-nowrap flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mb-[8px] ${
            !verificationSchema.shape.email.safeParse(formDateRT.email)
              .success || millisecondsLeft > 0
              ? "bg-[#3D4471] border-transparent cursor-not-allowed opacity-70"
              : "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-transparent hover:from-transparent hover:to-transparent hover:border-[#262957] hover:cursor-pointer"
          }`}
          style={{ fontFamily: "var(--font-family-sans)" }}
          type="button"
          onClick={handleSendVerificationCode}
          disabled={
            !verificationSchema.shape.email.safeParse(formDateRT.email)
              .success || millisecondsLeft > 0
          }
        >
          {verificationCodeSent ? (
            millisecondsLeft ? (
              <FormattedMessage
                id="form.button.retryIn"
                values={{ seconds: Math.floor(millisecondsLeft / 1000) }}
              />
            ) : (
              <FormattedMessage id="form.button.retry" />
            )
          ) : (
            <FormattedMessage id="form.button.verify" />
          )}
        </button>
      </div>

      {verificationCodeSent && (
        <Controller
          name="verificationCode"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="verificationCode"
              value={value}
              onChange={onChange}
              maxLength={6}
              error={Boolean(errors.verificationCode?.message)}
              helperText={
                errors.verificationCode?.message
                  ? formatMessage({ id: errors.verificationCode.message })
                  : void 0
              }
              onBlur={handleBlur}
            />
          )}
        />
      )}

      {/* Address Field */}
      <Controller
        name="address"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            name="address"
            value={value}
            onChange={onChange}
            maxLength={255}
            error={Boolean(errors.address?.message)}
            helperText={
              errors.address?.message
                ? formatMessage({ id: errors.address.message })
                : void 0
            }
            onBlur={handleBlur}
          />
        )}
      />

      {/* Package Selection */}
      <Controller
        name="package"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="w-full text-left relative">
            <label
              className="flex flex-col text-white text-sm mb-2"
              style={{ fontFamily: "var(--font-family-sans)" }}
            >
              <FormattedMessage id="form.label.package" />
            </label>
            <div className="relative">
              <select
                value={value}
                onChange={(e) => {
                  const amount = Number(e.target.value);
                  onChange(amount);
                  setFormData((prev) => ({ ...prev, package: amount }));
                }}
                className="w-full rounded-[12px] border-2 bg-[#212551] text-white border-transparent focus:border-white text-base py-3 px-5 pr-12 outline-none transition-all duration-300 cursor-pointer appearance-none"
                style={{
                  fontFamily: "var(--font-family-sans)",
                }}
              >
                {SAFT_PACKAGES.map((pkg) => (
                  <option
                    value={pkg}
                    key={pkg}
                    className="bg-[#1B1F47] text-white py-3 hover:bg-[#2A2E5E]"
                  >
                    {pkg} фракций (${pkg})
                  </option>
                ))}
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
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
            </div>
            {Boolean(errors.package?.message) && (
              <span
                className="text-sm text-[#DF1C1C] mt-1 pl-5 block"
                style={{ fontFamily: "var(--font-family-sans)" }}
              >
                {formatMessage({ id: errors.package?.message as any })}
              </span>
            )}
          </div>
        )}
      />

      {/* Submit Button */}
      <button
        className={`px-4 py-[14px] text-base font-normal rounded-[12px] border-2 text-white whitespace-nowrap flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mb-[6px] w-full md:w-min ${
          disabled
            ? "bg-[#3D4471] border-transparent cursor-not-allowed opacity-70"
            : "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-transparent hover:from-transparent hover:to-transparent hover:border-[#262957] hover:cursor-pointer"
        }`}
        style={{ fontFamily: "var(--font-family-sans)" }}
        type="submit"
        disabled={disabled}
      >
        <FormattedMessage id="form.button.saft" />
      </button>
    </form>
  );
};
