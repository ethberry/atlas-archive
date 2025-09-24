import { FC, useState, FocusEvent } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import { PdfPreview } from "@/app/saft/PdfPreview";
import type { IUserData } from "@/app/saft/interfaces";
import { Input } from "@/components/Form/Input";
import { Button } from "@/components/Form/Button";

interface IEmailFormProps {
  useFormInstance: UseFormReturn<IUserData>;
  submitEmailForm: (formData: IUserData) => void;
}

export const EmailForm: FC<IEmailFormProps> = ({
  useFormInstance,
  submitEmailForm,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    getValues,
    control,
  } = useFormInstance;

  const [formData, setFormData] = useState<IUserData>(getValues());

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      className="font-mont space-y-[16px] text-center w-full"
      onSubmit={handleSubmit(submitEmailForm)}
    >
      <PdfPreview formData={formData} />

      <div className="relative group">
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
              helperText={errors.firstName?.message}
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
              helperText={errors.lastName?.message}
              onBlur={handleBlur}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="email"
              value={value}
              onChange={onChange}
              maxLength={40}
              error={Boolean(errors.email?.message)}
              helperText={errors.email?.message}
              onBlur={handleBlur}
            />
          )}
        />
        <Controller
          name="address"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              name="address"
              value={value}
              onChange={onChange}
              maxLength={40}
              error={Boolean(errors.address?.message)}
              helperText={errors.address?.message}
              onBlur={handleBlur}
            />
          )}
        />
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
      </div>

      <Button
        className="w-full text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 border-2 border-yellow-400/50 shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-bold text-lg py-3 px-8"
        type="submit"
      >
        Get early access and a gift
      </Button>
      {/* Button glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/30 via-pink-400/30 to-yellow-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
    </form>
  );
};
