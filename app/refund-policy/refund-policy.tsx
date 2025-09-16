"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const RefundPolicy: FC = () => {
  return (
    <main className="flex-row justify-center text-center max-w-[800px] mx-[30px] mobile:mx-auto space-y-8">
      <h1 className="text-white text-[24px] tablet:text-[32px] mobile:text-[26px] text-center font-mont-bold">
        <FormattedMessage id="REFUND_POLICY" />
      </h1>
      <div className="font-[900] text-justify font-mont-bold text-[16px] tablet:text-[18px] text-white space-y-5">
        <p>
          Standard Return Terms
          <br /> If you cancel your purchase within 30 days from the payment
          date, a refund can be issued for products purchased from CoArt UAB.
          Please note that different refund terms or requirements may apply to
          certain products that are not eligible for refunds under any
          circumstances. Refunds will not be issued for products or services
          that have been suspended, canceled, or terminated due to abuse or
          violation of the Terms of Service. CoArt UAB reserves the right to
          reject refund requests if signs of refund abuse are detected.
          <br />
          <br />
        </p>
        <span>
          Payment Methods Subject to Different Refund Terms
          <br /> Refund terms may vary for different payment processors, and
          certain payment methods may not be eligible for refunds under any
          circumstances. Refunds cannot be issued to the original source of
          payment for products purchased using electronic banking in Lithuania.
          <br />
          <br />
        </span>
        <span>
          Refunds After Overpayment
          <br /> If you have transferred an excessive amount of money to our
          account, a refund can be requested within 30 days from the payment
          date. In some cases, the excess payment may be applied as credit
          toward other payments made within the last 30 days.
          <br />
          <br />
        </span>
        <span>
          Payment Refund (Cancellation)
          <br /> Any denial, chargeback, cancellation, payment dispute, or
          payment rejection will be considered a breach of the agreement, and
          CoArt UAB reserves the right to pursue legal remedies for payment
          recovery. In such cases, your CoArt UAB account may be terminated, and
          the ability to pay by credit card may be disabled. Refunds may result
          in the suspension of your CoArt UAB account and the forfeiture of data
          contained therein. To restore the ability to pay by credit card, you
          will need to provide proof of payment or a censored credit card photo
          with specific digits uncovered. Additionally, you are responsible for
          paying all applicable fees, including any third-party service fees and
          costs incurred by CoArt UAB for each chargeback or cancellation
          received.
          <br />
          <br />
        </span>
      </div>
    </main>
  );
};
