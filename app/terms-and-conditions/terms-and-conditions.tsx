"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const TermsAndConditions: FC = () => {
  return (
    <main className="mx-auto max-w-[920px] px-6 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20">
      <h1
        className="text-white text-center font-normal tracking-wide mb-10 md:mb-14"
        style={{ fontFamily: "var(--font-family-serif)", fontSize: "50px" }}
      >
        <FormattedMessage id="pages.termsNew.title" />
      </h1>
      <div className="text-white text-[16px] md:text-[18px] space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.overview.title" />
          </h3>
          <p>
            <FormattedMessage id="pages.termsNew.overview.p1" />
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.overview.li1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.overview.li2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.overview.li3" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.eligibility.title" />
          </h3>
          <p>
            <FormattedMessage id="pages.termsNew.eligibility.p1" />
          </p>
          <p>
            <FormattedMessage id="pages.termsNew.eligibility.p2" />
          </p>
          <p className="font-semibold">
            <FormattedMessage id="pages.termsNew.eligibility.p3" />
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r3" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r4" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r5" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r6" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.r7" />
            </li>
          </ul>
          <p>
            <FormattedMessage id="pages.termsNew.eligibility.p4" />
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.l1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.l2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.eligibility.l3" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.delivery.title" />
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.delivery.l0" />
            </li>
            <li className="list-none pl-0">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <FormattedMessage id="pages.termsNew.delivery.l1" />
                </li>
                <li>
                  <FormattedMessage id="pages.termsNew.delivery.l2" />
                </li>
              </ul>
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.delivery.l3" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.delivery.l4" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.risks.title" />
          </h3>
          <p>
            <FormattedMessage id="pages.termsNew.risks.p1" />
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.risks.r1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.risks.r2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.risks.r3" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.risks.r4" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.risks.r5" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.risks.r6" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.jurisdiction.title" />
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.jurisdiction.l1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.jurisdiction.l2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.jurisdiction.l3" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.disclaimer.title" />
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.disclaimer.l1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.disclaimer.l2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.disclaimer.l3" />
            </li>
          </ul>
        </section>
        <section className="space-y-3">
          <h3
            className="text-[20px] md:text-[22px] font-semibold"
            style={{ fontFamily: "var(--font-family-serif)" }}
          >
            <FormattedMessage id="pages.termsNew.accept.title" />
          </h3>
          <p>
            <FormattedMessage id="pages.termsNew.accept.p0" />
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <FormattedMessage id="pages.termsNew.accept.l1" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.accept.l2" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.accept.l3" />
            </li>
            <li>
              <FormattedMessage id="pages.termsNew.accept.l4" />
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
};
