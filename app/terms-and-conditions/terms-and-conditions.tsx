"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const TermsAndConditions: FC = () => {
  return (
    <main className="flex-row justify-center text-center max-w-[800px] mx-[30px] mobile:mx-auto space-y-8">
      <h1 className="text-white text-[24px] tablet:text-[32px] mobile:text-[26px] text-center font-mont-bold">
        <FormattedMessage id="TERMS_OF_USE" />
      </h1>
      <div className="font-[900] text-justify font-mont-bold text-[16px] tablet:text-[18px] text-white space-y-5">
        <p>
          General Conditions
          <br /> Browse and purchase our IT services conveniently online. Get
          all the information you need on our website, and our customer support
          is available to assist you. We strive to provide a user-friendly
          website and competitive pricing.
          <br />
          <br />
        </p>
        <span>
          Terms and Conditions
          <br /> These terms and conditions apply to all our services, whether
          accessed through our website, mobile device, email, mail, or phone. By
          accessing, browsing, or using our website, and/or placing an order,
          you acknowledge and agree to these terms and conditions (including our
          Privacy Policy). Our website, content, infrastructure, and goods sold
          online by CoArt UAB (including payment services) are owned and managed
          by CoArt UAB, a company operating under the laws of the Republic of
          Lithuania. CoArt UAB is responsible for the quality and provision of
          our services.
          <br />
          <br />
        </span>
        <span>
          Payments
          <br /> We offer secure online payment options processed through
          third-party intermediaries. Payments can be made using credit/debit
          cards or bank accounts. CoArt UAB is responsible for payment
          processing and will issue refunds for any unauthorized withdrawals.
          <br />
          <br />
        </span>
        <span>
          Definitions
          <br /> &#34;CoArt UAB,&#34; &#34;us,&#34; &#34;we,&#34; or
          &#34;our&#34; refers to CoArt UAB, a company operating under the laws
          of the Republic of Lithuania. &#34;IT services&#34; refers to the
          information technology services we offer, including online store
          creation and social network administration. Details about our IT
          services and contact information can be found on our website.
          &#34;Order&#34; refers to any online purchase, payment, or service
          ordering process for the products and services offered by CoArt UAB on
          our website.
          <br />
          <br />
        </span>
        <span>
          Scope and Nature of Our Services
          <br /> CoArt UAB sells and/or offers products and services through our
          website. Visitors can search, compare, choose, purchase, reserve,
          order, and pay for our offerings. By placing an order, you enter into
          a direct and legally binding contract with CoArt UAB. We are
          responsible for fulfilling your order and will provide an order
          confirmation with relevant information. We update the information on
          our platform, including prices and descriptions, and ensure its
          accuracy.
          <br />
          <br />
        </span>
        <span>
          Our services are for personal and commercial use only. You may not
          resell, link to, use, copy, monitor, display, download, or reproduce
          any content, information, software, products, or services on our
          website for commercial or competitive purposes.
          <br />
          <br />
        </span>
        <span>
          Privacy and Cookies
          <br /> We respect your privacy. Please review our privacy and cookies
          policy for more information.
          <br />
          <br />
        </span>
        <span>
          Payment, Cancellation, Late Pickup, and Important Information By
          placing an order with CoArt UAB, you agree to our cancellation and
          refund policies, which will be provided at the time of order.
          Carefully review these terms and conditions before placing your order,
          as there are deadlines for cancellations, returns, or changes.
          <br />
          <br />
        </span>
      </div>
    </main>
  );
};
