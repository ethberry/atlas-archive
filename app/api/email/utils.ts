import Client from "node-mailjet";

const client = Client.apiConnect(
  process.env.MAILJET_PUBLIC_KEY,
  process.env.MAILJET_PRIVATE_KEY,
);

export interface ISendTemplateDto {
  template: number;
  to: Array<string>;
  data: Record<string, string>;
  attachments?: Array<Record<string, string>>;
}

export function sendTemplate(dto: ISendTemplateDto) {
  return client.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM,
          Name: "Fractown",
        },
        To: dto.to.map((to) => ({
          Email: to,
        })),
        TemplateID: dto.template,
        TemplateLanguage: true,
        TemplateErrorReporting: {
          Email: "cto@fractown.com",
          Name: "TrejGun",
        },
        Variables: dto.data,
        Attachments: dto.attachments,
      },
    ],
  });
}
