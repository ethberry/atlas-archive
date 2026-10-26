import type { Metadata } from "next";

import {
  LegalDocument,
  LegalSection,
  LegalText,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of service — Atlas Archive",
  description:
    "Atlas Archive shows catalogue information as is, with no warranties and no liability for what is displayed.",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of service" updated="26 October 2026">
      <LegalText>
        These terms apply to your use of Atlas Archive. If you use the site, you
        accept them. If you do not accept them, do not use the site.
      </LegalText>

      <LegalSection title="An information site">
        <LegalText>
          Atlas Archive shows catalogue records, including worlds, ships, tools,
          and creatures, so they can be read. The site provides information and
          nothing more. It is not a broker, agent, dealer, marketplace, or
          adviser. A record is not an offer, a listing for sale, a
          recommendation, or professional advice.
        </LegalText>
      </LegalSection>

      <LegalSection title="Information is provided as is">
        <LegalText>
          Records are provided as is and as available. There is no warranty of
          accuracy, completeness, currency, availability, or fitness for a
          particular purpose. A record may be generated, incomplete, outdated,
          or wrong. The site may be interrupted or contain errors.
        </LegalText>
      </LegalSection>

      <LegalSection title="No liability for what is shown">
        <LegalText>
          To the fullest extent permitted by law, there is no liability for the
          information displayed on the site. There is no liability for a
          decision you make, or a loss you suffer, because you read a record or
          relied on it. There is no liability if the site is interrupted,
          changed, or removed.
        </LegalText>
        <LegalText>
          Where the law does not allow a disclaimer to remove liability
          completely, liability is limited to the smallest extent the law
          allows.
        </LegalText>
      </LegalSection>

      <LegalSection title="Use of the site">
        <LegalText>
          You may read the catalogue. Signing in with Google is optional and is
          described in the privacy policy. You may not interfere with the site,
          use it in a way that degrades it for others, or use an account that is
          not yours.
        </LegalText>
      </LegalSection>

      <LegalSection title="Changes">
        <LegalText>
          Any record may be changed or removed at any time. These terms may also
          be changed by publishing a new version on this page. The date above is
          the date of the version you are reading. If you keep using the site
          after a change, you accept the terms then shown on this page.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}
