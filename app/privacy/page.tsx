import type { Metadata } from "next";
import Link from "@mui/material/Link";

import {
  LegalDocument,
  LegalSection,
  LegalText,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy policy — Atlas Archive",
  alternates: { canonical: "/privacy" },
  description:
    "What Atlas Archive keeps if you sign in with Google, like a record, or send a bug report.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy policy" updated="3 November 2026">
      <LegalText>
        Atlas Archive can be read without an account. This policy describes the
        information the site handles and why.
      </LegalText>

      <LegalSection title="Signing in">
        <LegalText>
          Signing in with Google is optional. Google gives the site your name,
          email address, and profile picture, which are used only to run your
          account. They are used in line with the{" "}
          <Link
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </Link>
          , including the Limited Use requirements, and are never sold or used
          for advertising. A cookie keeps you signed in. Likes you mark are
          stored with your account.
        </LegalText>
      </LegalSection>

      <LegalSection title="Visits and errors">
        <LegalText>
          The site counts page visits without cookies and without identifying
          you. When a page fails, a technical error report is sent so the fault
          can be fixed; it can include the page address, browser details, and
          how the page was used. A bug report you send is attached to it.
        </LegalText>
      </LegalSection>

      <LegalSection title="Who handles it">
        <LegalText>
          The services that host the site, store accounts, provide sign-in, and
          receive error reports handle this information only to run the site.
          Nothing is shared with anyone else.
        </LegalText>
      </LegalSection>

      <LegalSection title="How long it is kept">
        <LegalText>
          Account details and likes are kept while the account exists. Error
          reports are kept while they help fix faults.
        </LegalText>
      </LegalSection>

      <LegalSection title="Your account">
        <LegalText>
          You can ask to see or delete your account and everything kept with it.
          Write through the Report a Bug button at the bottom of any page and
          sign in first, so the request can be matched to your account.
        </LegalText>
      </LegalSection>

      <LegalSection title="Children">
        <LegalText>
          The site is not directed at children and does not knowingly collect
          their information.
        </LegalText>
      </LegalSection>

      <LegalSection title="Changes">
        <LegalText>
          This policy may change; the date above is the date of this version.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}
