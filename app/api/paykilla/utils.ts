import crypto from "crypto";

export const createSignature = (body: string, secretKey: string) => {
  return crypto.createHmac("sha512", secretKey).update(body).digest("hex");
};
