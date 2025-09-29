"use client";

import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { FormattedMessage } from "react-intl";

import type { IUserData } from "@/app/saft/interfaces";
import { EmailForm } from "@/app/saft/EmailForm";

import { validationSchema } from "./validation";

export const Saft: FC = () => {
  const useFormReturn = useForm<IUserData>({
    resolver: zodResolver(validationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      consent: false,
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

      window.location.href = `https://pay.paykilla.com/pay?widgetKey=${json.idempotencyKey}`;
    },
    onSuccess: () => {
      enqueueSnackbar(
        `Thank you for subscribing! Check your email for confirmation.`,
        {
          variant: "success",
        },
      );
      useFormReturn.reset({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        consent: false,
      });
    },
    onError: (error) => {
      console.error(error);
      if (error.message.includes("23505")) {
        enqueueSnackbar(`Already in the list!`, {
          variant: "warning",
        });
      } else {
        enqueueSnackbar(`Something went wrong!`, {
          variant: "error",
        });
      }
    },
  });

  const submitEmailFormHandler = useCallback(
    (formData: IUserData) => {
      sendUserDataSubscription({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        consent: formData.consent,
      });
    },
    [sendUserDataSubscription],
  );

  return (
    <main>
      <h2>
        <FormattedMessage id="pages.saft.title" />
      </h2>

      <EmailForm
        useFormInstance={useFormReturn}
        submitEmailForm={submitEmailFormHandler}
      />
    </main>
  );
};
