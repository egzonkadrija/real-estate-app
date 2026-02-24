import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t("common.privacy")}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">
          Last updated: February 2026
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            1. Introduction
          </h2>
          <p>
            Kosovo Real Estate (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
            protecting your personal information and your right to privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            2. Information We Collect
          </h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              Personal identification information (name, email address, phone
              number)
            </li>
            <li>
              Property inquiry details (preferred property type, budget, location
              preferences)
            </li>
            <li>
              Property submission information when you list a property on our
              platform
            </li>
            <li>
              Communication records when you contact us or our agents
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>
              Connect you with property agents and respond to your inquiries
            </li>
            <li>
              Send you relevant property listings and market updates based on
              your preferences
            </li>
            <li>Process property submissions and listing requests</li>
            <li>
              Comply with legal obligations and enforce our terms of service
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            4. Information Sharing
          </h2>
          <p>
            We may share your information with real estate agents to facilitate
            property inquiries. We do not sell your personal data to third
            parties. We may share data with service providers who assist us in
            operating our platform, such as hosting providers and analytics
            services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            5. Cookies and Tracking
          </h2>
          <p>
            We use cookies and similar tracking technologies to enhance your
            browsing experience, analyze site traffic, and personalize content.
            You can manage your cookie preferences through your browser settings.
            We use localStorage to save your favorite properties locally on your
            device.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            6. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. However, no method
            of transmission over the Internet is completely secure.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            7. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. You may also request that we restrict the processing of
            your data. To exercise these rights, please contact us at
            info@kosovorealestate.com.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            8. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us
            at:
          </p>
          <p className="mt-2">
            Kosovo Real Estate
            <br />
            Rr. Agim Ramadani, Nr. 15
            <br />
            10000 Prishtina, Kosovo
            <br />
            Email: info@kosovorealestate.com
            <br />
            Phone: +383 44 123 456
          </p>
        </section>
      </div>
    </div>
  );
}
