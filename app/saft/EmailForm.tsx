import { FC, FocusEvent, useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";

import { PdfPreview } from "@/app/saft/PdfPreview";
import type { IUserData } from "@/app/saft/interfaces";
import { Input } from "@/components/Form/Input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CODE_TIMEOUT_IN_MILLISECONDS,
  SAFT_PACKAGES,
} from "@/app/saft/constants";
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
      setMillisecondsLeft(CODE_TIMEOUT_IN_MILLISECONDS);
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
          <Controller
            name="consent"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id="consent"
                checked={value}
                onChange={onChange}
                disabled={!hasScrolledToEnd}
                labelId="form.label.consent"
              />
            )}
          />

          <Controller
            name="nonUsPerson"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                id="nonUsPerson"
                checked={value}
                onChange={onChange}
                labelId="form.label.nonUsPerson"
              />
            )}
          />
        </div>

        <div className="w-full md:w-auto flex justify-center gap-3">
          <div className="w-full max-w-[133px] flex flex-col gap-3">
            <div
              className="text-base text-white text-right flex items-center justify-end gap-[2px]"
              style={{ fontFamily: "var(--font-family-sans)" }}
            >
              <span className="inline-block w-[25px] min-w-[25px] text-[50px] text-center">
                {String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[0]}
              </span>
              <span
                className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
                key={`min-${String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[1]}`}
              >
                {String(Math.floor(pageTimerLeft / 60000)).padStart(2, "0")[1]}
              </span>
              <span className="w-[25px] min-w-[25px] text-[50px] text-center">
                :
              </span>
              <span
                className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
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
                className="inline-block w-[25px] min-w-[25px] text-[50px] text-center flip-number"
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
          className={`px-4 py-[10px] text-base font-normal rounded-[12px] border-2 text-white whitespace-nowrap flex items-center justify-center disabled:opacity-70 disabled:text-[#414569] disabled:cursor-not-allowed mb-[8px] ${
            !verificationSchema.shape.email.safeParse(formDateRT.email)
              .success || millisecondsLeft > 0
              ? "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-[#262957] cursor-not-allowed opacity-70 text-[#414569]"
              : "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-[#262957] hover:from-transparent hover:to-transparent hover:border-[#262957] hover:cursor-pointer"
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
          <Select
            value={value}
            onChange={(amount) => {
              onChange(amount);
              setFormData((prev) => ({ ...prev, package: amount }));
            }}
            options={SAFT_PACKAGES}
            error={Boolean(errors.package?.message)}
            helperText={
              errors.package?.message
                ? formatMessage({ id: errors.package.message })
                : undefined
            }
          />
        )}
      />

      {/* Submit Button */}
      <button
        className={`px-4 py-[12px] text-base font-normal rounded-[12px] border-2 text-white whitespace-nowrap flex items-center justify-center disabled:opacity-70 disabled:text-[#414569] disabled:cursor-not-allowed mb-[6px] w-full md:w-min ${
          disabled
            ? "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-[#262957] cursor-not-allowed opacity-70"
            : "bg-gradient-to-b from-[#1A1D3F] to-[#262B5E] border-[#262957] hover:from-transparent hover:to-transparent hover:border-[#262957] hover:cursor-pointer"
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
