"use client";

import { FC, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { FormattedMessage } from "react-intl";

import { createUser } from "@/lib/db/models/users";
import type { IEmailSubscription } from "@/app/saft/interfaces";
import { EmailForm } from "@/app/saft/EmailForm";

import { validationSchema } from "./validation";

export const Saft: FC = () => {
  const useFormReturn = useForm<IEmailSubscription>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
    },
  });

  const { mutate: sendEmailSubscription } = useMutation({
    mutationFn: (data: IEmailSubscription) => {
      return createUser(data);
    },
    // mutationFn: async (data: IEmailSubscription) => {
    //   const res = await fetch("/api/whitelist", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //
    //   const json = await res.json();
    //   if (!res.ok) {
    //     throw json.error;
    //   }
    //   return json.data;
    // },
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
    (formData: IEmailSubscription) => {
      sendEmailSubscription({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
      });
    },
    [sendEmailSubscription],
  );

  return (
    <main className="font-mont">
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
