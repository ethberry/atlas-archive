"use client";

import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { FormattedMessage } from "react-intl";

import type { IUserData } from "@/app/saft/interfaces";
import { EmailForm } from "@/app/saft/EmailForm";
import { useAppStore } from "@/components/providers/AppStoreProvider";

import { validationSchema } from "./validation";

export const Saft: FC = () => {
  const { language } = useAppStore((state) => state);

  const useFormReturn = useForm<IUserData>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      consent: false,
      nonUsPerson: false,
      package: 30,
      verificationCode: "",
      language,
    },
  });

  const { mutate: sendUserDataSubscription } = useMutation({
    mutationFn: async (data: IUserData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw json.error;
      }

      return json;
    },
    onSuccess: (json) => {
      useFormReturn.reset({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        consent: false,
        nonUsPerson: false,
        package: 10,
        verificationCode: "",
        language,
      });

      window.location.href = `https://pay.paykilla.com/pay?widgetKey=${json.idempotencyKey}`;
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar(error as unknown as string, {
        variant: "error",
      });
    },
  });

  const submitEmailFormHandler = useCallback(
    (formData: IUserData) => {
      sendUserDataSubscription(formData);
    },
    [sendUserDataSubscription],
  );

  return (
    <main className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-[46px] md:text-[70px] text-white text-center mb-12 font-[600]"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.saft.title" />
        </h1>

        {/* <p className="text-white text-left mb-12">
          <FormattedMessage id="pages.saft.description" values={{ br: <br /> }} />
        </p> */}

        <EmailForm
          useFormInstance={useFormReturn}
          submitEmailForm={submitEmailFormHandler}
        />
      </div>
    </main>
  );
};
