"use client";

import { FC } from "react";

export const TermsAndConditions: FC = () => {
  return (
    <main className="flex-row justify-center text-center max-w-[800px] mx-[30px] mobile:mx-auto space-y-8">
      <h1 className="text-white text-[24px] tablet:text-[32px] mobile:text-[26px] text-center ">
        Terms of Sale — SAFT Offering
      </h1>
      <div className="font-[900] text-justify text-[16px] tablet:text-[18px] text-white space-y-5">
        <h3>1. Overview</h3>
        <p>
          By purchasing a SAFT (Simple Agreement for Future Tokens) on this
          platform, you acknowledge and agree that:
        </p>
        <ul>
          <li>
            {" "}
            The SAFT represents a contractual{" "}
            <strong>right to receive tokens in the future</strong>, not
            immediate ownership of any physical asset.
          </li>
          <li>
            The tokens, once issued, will represent a{" "}
            <strong>
              fractional interest in a digital claim to an underlying asset
            </strong>
            (the Fabergé egg) held by a partner entity.
          </li>
          <li>
            The SAFT and future tokens do{" "}
            <strong>not constitute direct ownership</strong> of the Fabergé egg.
          </li>
        </ul>

        <h3>2. Eligibility and Restricted Jurisdictions</h3>
        <p>
          Participation in this SAFT offering is{" "}
          <strong>
            strictly limited to individuals who are legally permitted to
            purchase in their jurisdiction
          </strong>
          .
        </p>
        <p>
          By purchasing, you confirm that you are{" "}
          <strong>
            not a resident, citizen, or otherwise subject to the laws of any of
            the following restricted jurisdictions
          </strong>
          :
        </p>
        <p>
          <strong>
            Restricted Jurisdictions include, but are not limited to:
          </strong>
        </p>
        <ul>
          <li>
            <strong>United States of America</strong>
            (all states and territories)
          </li>
          <li>
            <strong>China</strong> (including Hong Kong SAR and Macau SAR if
            local regulations prohibit)
          </li>
          <li>
            <strong>North Korea</strong>
          </li>
          <li>
            <strong>Iran</strong>
          </li>
          <li>
            <strong>Singapore</strong> (unless pre-approved
            professional/institutional investors)
          </li>
          <li>
            <strong>Japan</strong> (unless local regulatory approval is
            obtained)
          </li>
          <li>
            <strong>
              Other countries where offering or marketing SAFTs or tokens is
              prohibited under applicable law
            </strong>
          </li>
        </ul>

        <p>
          The list of restricted jurisdictions may be updated at any time. It is
          your responsibility to ensure you are eligible before purchasing.
        </p>
        <ul>
          <li>
            Purchasers must{" "}
            <strong>comply with all local laws and restrictions</strong>.
          </li>
          <li>
            The platform may use{" "}
            <strong>
              IP geolocation, billing address, language detection, or other
              verification methods
            </strong>{" "}
            to block restricted jurisdictions.
          </li>
          <li>
            If you are located in a restricted jurisdiction, you{" "}
            <strong>
              may not access this page or participate in the SAFT sale.
            </strong>
          </li>
        </ul>

        <h3>3. No Guarantee of Token Delivery or Value</h3>
        <ul>
          <li>
            Token issuance is subject to legal, regulatory, and operational
            conditions.
          </li>
          <ul>
            <li>The SAFT does not guarantee:</li>
            <li>Delivery of tokens by a specific date.</li>
          </ul>
          <li>Any specific value of the tokens once issued.</li>
          <li>
            Tokens may be illiquid, and there is no assurance of resale or
            market price.
          </li>
        </ul>

        <h3>4. Risk Disclosures</h3>
        <p>By participating, you acknowledge and accept the following risks:</p>
        <ul>
          <li>
            <strong>Regulatory Risk</strong> – Tokens may be classified as
            securities or other regulated instruments in some jurisdictions.
          </li>
          <li>
            <strong>Contractual Risk</strong> – Tokens are backed by a
            partnership agreement; failure of the partner to perform may result
            in loss of value.
          </li>
          <li>
            <strong>Asset Risk</strong> – The underlying Fabergé egg may be
            damaged, lost, or otherwise unavailable.
          </li>
          <li>
            <strong>Liquidity Risk</strong> – There is no guarantee that a
            market will exist for the tokens.
          </li>
          <li>
            <strong>Tax Risk</strong> – Purchasers are responsible for all tax
            reporting and obligations in their jurisdiction.
          </li>
          <li>
            <strong>Operational Risk</strong> – Delivery of tokens may be
            delayed or fail due to technical, legal, or administrative reasons.
          </li>
        </ul>

        <h3>5. Acknowledgment of Jurisdiction Restrictions</h3>
        <ul>
          <li>
            The sale and these Terms are{" "}
            <strong>
              intended only for individuals who can legally participate
            </strong>{" "}
            in approved jurisdictions.
          </li>
          <li>
            <strong>Do not proceed</strong> if you are a resident, citizen, or
            accessing this page from a restricted jurisdiction.
          </li>
          <li>
            The platform{" "}
            <strong>
              reserves the right to refuse access or reverse transactions
            </strong>{" "}
            based on IP, billing address, language, or other verification
            methods.
          </li>
        </ul>

        <h3>6. No Advice or Representation</h3>
        <ul>
          <li>
            The information on this page is for{" "}
            <strong>informational purposes only</strong>.
          </li>
          <li>
            This is{" "}
            <strong>not an offer, solicitation, or investment advice</strong>.
          </li>
          <li>
            You are responsible for conducting your{" "}
            <strong>own due diligence</strong> and consulting legal or financial
            advisors.
          </li>
        </ul>

        <h3>7. Acceptance of Terms</h3>
        <p>By purchasing a SAFT, you:</p>
        <ul>
          <li>Confirm you have read and understood these Terms.</li>
          <li>Acknowledge that you accept all the risks described above.</li>
          <li>Confirm you are not in a restricted jurisdiction.</li>
          <li>Agree to comply with all applicable laws and restrictions.</li>
        </ul>
      </div>
    </main>
  );
};
