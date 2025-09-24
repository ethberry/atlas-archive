"use server";

import { createUser } from "@/lib/db/models/users";
import { generatePdf } from "@/lib/actions/pdf";
import { IUserData } from "@/app/saft/interfaces";
import { sendTemplate } from "@/app/api/email/utils";

export const createSaftContract = async (user: IUserData) => {
  await createUser(user);
  const pdfDoc = await generatePdf(user);

  await sendTemplate({
    to: [user.email],
    template: 7318139,
    data: {},
    attachments: [
      {
        ContentType: "application/pdf",
        Filename: "saft.pdf",
        Base64Content: await pdfDoc.saveAsBase64(),
      },
    ],
  });
};
