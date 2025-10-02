import { FC, useState, FocusEvent, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";

import { PdfPreview } from "@/app/saft/PdfPreview";
import type { IUserData } from "@/app/saft/interfaces";
import { Input } from "@/components/Form/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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

  return (
    <form
      className="space-y-[16px] text-center w-full"
      onSubmit={(e) => {
        void handleSubmit((data) => {
          void handleFormSubmit(data);
        })(e);
      }}
    >
      <PdfPreview formData={formData} onScrollToEnd={handleScrollToEnd} />

      <div className="flex items-center space-x-2 text-sm">
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
              className={`w-4 h-4 rounded border-2 ${
                !hasScrolledToEnd
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : errors.consent?.message
                    ? "border-red-500 text-red-600 focus:ring-red-500"
                    : "border-green-500 text-green-600 focus:ring-green-500"
              }`}
            />
          )}
        />
        <label
          htmlFor="consent"
          className={`text-sm ${
            !hasScrolledToEnd
              ? "text-gray-400"
              : errors.consent?.message
                ? "text-red-600"
                : "text-gray-700"
          }`}
        >
          <FormattedMessage id="form.label.consent" />
        </label>
        {Boolean(errors.consent?.message) && (
          <span className="text-red-500 text-xs mt-1">
            {formatMessage({ id: errors.consent?.message })}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <Controller
          name="nonUsPerson"
          control={control}
          render={({ field: { onChange, value } }) => (
            <input
              type="checkbox"
              id="nonUsPerson"
              checked={value}
              onChange={onChange}
              className={`w-4 h-4 rounded border-2 ${
                errors.nonUsPerson?.message
                  ? "border-red-500 text-red-600 focus:ring-red-500"
                  : "border-green-500 text-green-600 focus:ring-green-500"
              }`}
            />
          )}
        />
        <label
          htmlFor="nonUsPerson"
          className={`text-sm ${
            errors.nonUsPerson?.message ? "text-red-600" : "text-gray-700"
          }`}
        >
          <FormattedMessage id="form.label.nonUsPerson" />
        </label>
        {Boolean(errors.nonUsPerson?.message) && (
          <span className="text-red-500 text-xs mt-1">
            {formatMessage({ id: errors.nonUsPerson?.message })}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <Controller
          name="package"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="w-full text-left">
              <label className="flex flex-col text-white text-sm mb-1">
                <FormattedMessage id="form.label.package" />
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    ${value}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[12rem]">
                  <DropdownMenuRadioGroup
                    value={String(value)}
                    onValueChange={(val) => {
                      const amount = Number(val);
                      onChange(amount);
                      setFormData((prev) => ({ ...prev, package: amount }));
                    }}
                  >
                    {SAFT_PACKAGES.map((e) => (
                      <DropdownMenuRadioItem value={e.toString()} key={e}>
                        ${e}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {Boolean(errors.package?.message) && (
                <span className="text-red-500 text-xs mt-1">
                  {formatMessage({ id: errors.package?.message as any })}
                </span>
              )}
            </div>
          )}
        />
      </div>

      <div className="flex items-center space-x-2 text-sm">
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
      </div>

      <div className="flex items-center space-x-2 text-sm">
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

      <div className="flex items-center space-x-2 text-sm">
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
        <Button
          className={`text-white border-2 border-yellow-400/50 shadow-lg transition-all duration-300 font-bold text-lg py-3 px-8`}
          type="button"
          onClick={handleSendVerificationCode}
          disabled={
            !verificationSchema.shape.email.safeParse(formDateRT.email).success
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
        </Button>
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
      </div>

      <div className="flex items-center space-x-2 text-sm">
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
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
      </div>

      <Button
        className={`w-full text-white border-2 border-yellow-400/50 shadow-lg transition-all duration-300 font-bold text-lg py-3 px-8 ${
          !disabled
            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 hover:shadow-yellow-400/25"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        type="submit"
        disabled={disabled}
      >
        <FormattedMessage id="form.button.saft" />
      </Button>
      {/* Button glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/30 via-pink-400/30 to-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
    </form>
  );
};
