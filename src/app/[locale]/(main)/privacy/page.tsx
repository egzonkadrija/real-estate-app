import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  if (locale === "al") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("common.privacy")}
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-400">
            Perditesuar: Shkurt 2026
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              1. Hyrje
            </h2>
            <p>
              NovaBuildings eshte e perkushtuar per mbrojtjen e te dhenave personale dhe privatise suaj.
              Kjo politike shpjegon si i mbledhim, i perdorim dhe i mbrojme te dhenat kur perdorni platformen tone.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              2. Cfare te dhena mbledhim
            </h2>
            <p>Ne mbledhim te dhena qe ju i jepni direkt, perfshire:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Te dhena identifikuese (emer, email, numer telefoni)</li>
              <li>Detaje te kerkesave per prona (tipi, buxheti, lokacioni)</li>
              <li>Te dhena per dorzimin/listimin e pronave</li>
              <li>Komunikimet qe beni me ekipin tone ose me agjentet</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              3. Si i perdorim te dhenat
            </h2>
            <p>Te dhenat i perdorim per:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Ofrimin dhe permiresimin e sherbimeve tona</li>
              <li>Lidhjen tuaj me agjentet dhe pergjigje ndaj kerkesave</li>
              <li>Dergimin e njoftimeve relevante per prona sipas preferencave</li>
              <li>Perpunimin e kerkesave per listim dhe publikim pronash</li>
              <li>Permbushjen e detyrimeve ligjore</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Ndarja e te dhenave
            </h2>
            <p>
              Mund te ndajme te dhena me agjentet e pronave per te mundesuar komunikim dhe procesim kerkesash.
              Nuk shesim te dhena personale te pale te treta. Mund te perdorim partnere teknike
              (hostim, analitike) vetem per funksionimin e platformes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              5. Cookies dhe gjurmimi
            </h2>
            <p>
              Perdoren cookies dhe teknologji te ngjashme per pervoje me te mire, analize te trafikut dhe personalizim.
              Preferencat mund t&apos;i menaxhoni ne shfletues. Gjithashtu perdorim localStorage per ruajtjen e pronave te preferuara.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              6. Siguria e te dhenave
            </h2>
            <p>
              Zbatojme masa teknike dhe organizative per mbrojtjen e te dhenave nga qasje e paautorizuar,
              ndryshim ose humbje. Asnje sistem online nuk garanton siguri absolute.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              7. Te drejtat tuaja
            </h2>
            <p>
              Ju keni te drejte te kerkoni qasje, korrigjim ose fshirje te te dhenave tuaja personale.
              Mund te kerkoni edhe kufizim te perpunimit. Per kerkesa, na kontaktoni ne info@novabuildings.com.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              8. Na kontaktoni
            </h2>
            <p>
              Per pyetje rreth politikes se privatise, na kontaktoni ne:
            </p>
            <p className="mt-2">
              NovaBuildings
              <br />
              Rr. Agim Ramadani, Nr. 15
              <br />
              1000 Skopje, Maqedonia e Veriut
              <br />
              Email: info@novabuildings.com
              <br />
              Phone: +389 2 123 456
            </p>
          </section>
        </div>
      </div>
    );
  }

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
            NovaBuildings (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
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
            info@novabuildings.com.
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
            NovaBuildings
            <br />
            Rr. Agim Ramadani, Nr. 15
            <br />
            1000 Skopje, North Macedonia
            <br />
            Email: info@novabuildings.com
            <br />
            Phone: +389 2 123 456
          </p>
        </section>
      </div>
    </div>
  );
}
