import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Users,
  Shield,
  TrendingUp,
  Search,
  UserCheck,
  Handshake,
  ArrowRight,
} from "lucide-react";

type ProcessStep = {
  title: string;
  description: string;
};

type AboutCopy = {
  missionTitle: string;
  missionText: string;
  whyTitle: string;
  teamTitle: string;
  teamText: string;
  aboutSectionTitle: string;
  aboutSectionText: string;
  processTitle: string;
  processText: string;
  processSteps: ProcessStep[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  ctaButtonSecondary: string;
};

const valueCards = {
  al: [
    {
      icon: Building2,
      title: "Zgjedhje e gjere",
      description:
        "Shfletoni mijera prona ne Maqedonine e Veriut, nga banesa komode deri te hapesira komerciale.",
    },
    {
      icon: Users,
      title: "Agjente profesioniste",
      description:
        "Rrjeti yne i agjenteve me pervoje ofron udhezim te personalizuar gjate gjithe procesit.",
    },
    {
      icon: Shield,
      title: "Besim dhe transparence",
      description:
        "Sigurojme qe cdo listim te jete i verifikuar dhe transaksionet te jene te qarta e te sigurta.",
    },
    {
      icon: TrendingUp,
      title: "Ekspertize tregu",
      description:
        "Qendroni te informuar me trendet me te fundit te tregut dhe vleresimet e pronave.",
    },
  ],
  default: [
    {
      icon: Building2,
      title: "Wide Selection",
      description:
        "Browse thousands of properties across North Macedonia, from cozy apartments to commercial spaces.",
    },
    {
      icon: Users,
      title: "Professional Agents",
      description:
        "Our network of experienced agents provides personalized guidance throughout your journey.",
    },
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "We ensure every listing is verified and all transactions are transparent and secure.",
    },
    {
      icon: TrendingUp,
      title: "Market Expertise",
      description:
        "Stay informed with the latest market trends and property valuations in North Macedonia.",
    },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const coreCopy: AboutCopy =
    locale === "al"
      ? {
          missionTitle: "Misioni Yne",
          missionText:
            "Misioni yne eshte te thjeshtojme procesin e pasurive te paluajtshme ne Maqedonine e Veriut. Ne lidhim bleres, shites dhe qiramarres ne nje platforme moderne dhe te lehte per perdorim. Qofte per banesen e pare, investim apo hapesire biznesi, jemi ketu per t'ju ndihmuar te gjeni pronen e duhur.",
          whyTitle: "Pse te na zgjidhni",
          teamTitle: "Ekipi Yne",
          teamText:
            "Ekipi yne perbehet nga profesioniste te pasurive te paluajtshme, eksperte te teknologjise dhe specialiste te sherbimit ndaj klientit. Me pervoje ne tregun lokal, kuptojme nevojat e klienteve tane dhe punojme vazhdimisht per te ofruar sherbim cilesor.",
          aboutSectionTitle: "Mbi platformen tone",
          aboutSectionText:
            "Ne jemi platforma qe ben procesin e kerkes dhe gjetjes se nje prone me te qarte, me shpejt dhe me te besueshem.",
          processTitle: "Si e bejm ne",
          processText:
            "Ne e bejme rrugen nga kerkimi ne kontrate me te shohura: me pak hapa dhe me transparence ne çdo hap.",
          processSteps: [
            {
              title: "Kërko",
              description:
                "Përdorim filtra te thjeshte per buxhet, qark dhe lloj prone.",
            },
            {
              title: "Kryqëzo",
              description:
                "Shfaqim te dhena qartese dhe lehtesim kontaktin me agjentin.",
            },
            {
              title: "Vendos",
              description:
                "E shoqerojme deri te vendimi me komente te sakta dhe hapat e ardhshëm.",
            },
          ],
          ctaTitle: "Kujdes per ne",
          ctaText:
            "Na kontaktoni per nje kerkese te thjeshte dhe i personalizohet eksperienca ne baze te profilit tuaj.",
          ctaButton: "Shiko Pronat",
          ctaButtonSecondary: "Kontaktoni",
        }
      : locale === "mk"
        ? {
            missionTitle: "Nasa misija",
            missionText:
              "Nasata misija e da go pojednostavime iskustvoto so nedviznosti vo Severna Makedonija. Povezuvame kupuvaci, prodavaci i zakupci preku moderna i ednostavna platforma.",
            whyTitle: "Zosto da ne izberete",
            teamTitle: "Nas tim",
            teamText:
              "Nasiot tim e sostaven od profesionalci za nedviznosti, tehnoloski eksperti i specijalisti za poddrska na klienti.",
            aboutSectionTitle: "Za nas",
            aboutSectionText:
              "Nudime platforma so sporedba e shkelur, komunikim i qarte dhe me shpejt proces selekcionimi.",
            processTitle: "Kako rabotime",
            processText:
              "Pecatat se jasni, sekako kratki, od prebaranje do dogovor.",
            processSteps: [
              {
                title: "Najdite",
                description: "Filtrirajte po lokacion, cena i tip.",
              },
              {
                title: "Proverete",
                description: "Krahasoni detajet kryesore dhe flisni direkt me agjentin.",
              },
              {
                title: "Zavrshite",
                description:
                  "Merrni mbeshtetje ne komunikimin me agjentin dhe me hapin tjeter.",
              },
            ],
            ctaTitle: "Poddrska",
            ctaText:
              "Kontaktirajte ne za navigim me i qarte me rreth listat tuaja.",
            ctaButton: "Vidi nekretnini",
            ctaButtonSecondary: "Kontakt",
          }
        : locale === "de"
          ? {
              missionTitle: "Unsere Mission",
              missionText:
                "Unsere Mission ist es, das Immobilienerlebnis in Nordmazedonien zu vereinfachen. Wir verbinden Kaufer, Verkaufer und Mieter uber eine moderne, benutzerfreundliche Plattform.",
              whyTitle: "Warum wir",
              teamTitle: "Unser Team",
              teamText:
                "Unser Team besteht aus Immobilienprofis, Technologieexperten und Kundenservice-Spezialisten mit starker lokaler Marktkenntnis.",
              aboutSectionTitle: "Über unsere Plattform",
              aboutSectionText:
                "Wir machen den Prozess zwischen erster Anfrage und Einigung klar, schnell und transparent.",
              processTitle: "Wie wir arbeiten",
              processText:
                "Dreische Schritte führen Sie sicher von der Suche zur fundierten Entscheidung.",
              processSteps: [
                {
                  title: "Suchen",
                  description:
                    "Filtern nach Preis, Lage und Typ, um passende Angebote einzugrenzen.",
                },
                {
                  title: "Prüfen",
                  description:
                    "Vergleichen Sie relevante Daten und sprechen Sie direkt mit dem zuständigen Agenten.",
                },
                {
                  title: "Entscheiden",
                  description:
                    "Wir begleiten Sie mit klarer Kommunikation bis zum naechsten Schritt.",
                },
              ],
              ctaTitle: "Fragen?",
              ctaText:
                "Kontaktieren Sie unser Team fuer eine schnelle und saubere Orientierung.",
              ctaButton: "Immobilien durchsuchen",
              ctaButtonSecondary: "Kontakt",
            }
          : locale === "tr"
            ? {
                missionTitle: "Misyonumuz",
                missionText:
                  "Misyonumuz Kuzey Makedonya'da emlak deneyimini kolaylastirmaktir. Alici, satici ve kiracilari modern ve kullanimi kolay bir platformda bir araya getiriyoruz.",
                whyTitle: "Neden biz",
                teamTitle: "Ekibimiz",
                teamText:
                  "Ekibimiz emlak profesyonelleri, teknoloji uzmanlari ve musteri destek uzmanlarindan olusur.",
                aboutSectionTitle: "Hakkımızda",
                aboutSectionText:
                  "Basit, hızlı ve güvenli bir arama deneyimi sunarak alım/satım sürecini kolaylaştırıyoruz.",
                processTitle: "Nasıl çalışırız",
                processText:
                  "İlk aramadan son karara kadar her adımı net bir akışa oturtuyoruz.",
                processSteps: [
                  {
                    title: "Bul",
                    description:
                      "Bütçenize ve konumunuza göre hızlı filtreleme ile seçenekleri daraltın.",
                  },
                  {
                    title: "Doğrula",
                    description:
                      "Liste detaylarını karşılaştırın ve doğrudan ajan ile iletişime geçin.",
                  },
                  {
                    title: "İlerle",
                    description:
                      "İletişimi şeffaf tutarak en uygun sonraki adımı hızlıca netleştirin.",
                  },
                ],
                ctaTitle: "Yardım ister misiniz?",
                ctaText:
                  "Takvimimize uygun destek almak için ekibimizle hızlıca iletişime geçin.",
                ctaButton: "İlanları Görüntüle",
                ctaButtonSecondary: "İletişim",
              }
        : {
            missionTitle: "Our Mission",
            missionText:
              "Our mission is to simplify real estate in North Macedonia. We connect buyers, sellers, and renters through a clear, easy-to-use platform. Whether you need a first home, an investment, or commercial space, we help you find the right property faster.",
            whyTitle: "Why Choose Us",
            teamTitle: "Our Team",
            teamText:
              "Our team combines local market expertise, technology, and customer support specialists to make property transactions smoother and more transparent.",
            aboutSectionTitle: "About NovaBuildings",
            aboutSectionText:
              "We guide you from discovery to decision with clear listings, verified agents, and practical support.",
            processTitle: "How We Work",
            processText:
              "We keep the process structured so you can compare, validate, and decide with confidence.",
            processSteps: [
              {
                title: "Search",
                description:
                  "Filter by location, type, budget, and preferences to build a realistic shortlist.",
              },
              {
                title: "Validate",
                description:
                  "Review details quickly and connect with agents directly.",
              },
              {
                title: "Proceed",
                description:
                  "Use direct follow-up to complete the process confidently.",
              },
            ],
            ctaTitle: "Need help?",
            ctaText:
              "Have a goal in mind? Send a message and we will guide you to the right property.",
            ctaButton: "Browse Properties",
            ctaButtonSecondary: "Contact us",
          };

  const values =
    locale === "al"
      ? valueCards.al
      : locale === "mk"
        ? valueCards.default
        : locale === "de"
          ? valueCards.default
          : locale === "tr"
            ? valueCards.default
            : valueCards.default;

  const focusPoints = [
    {
      icon: Search,
      title:
        locale === "al"
          ? "Shpejtesia e gjetjes"
          : locale === "mk"
            ? "Brza prebaruvanje"
            : locale === "de"
              ? "Schnelle Suche"
              : locale === "tr"
                ? "Hızlı keşif"
                : "Fast discovery",
      description: "Use focused filters so your shortlist is based on needs, not noise.",
    },
    {
      icon: UserCheck,
      title:
        locale === "al"
          ? "Mbështetje lokale"
          : locale === "mk"
            ? "Lokalna podrška"
            : locale === "de"
              ? "Lokale Betreuung"
              : locale === "tr"
                ? "Yerel destek"
                : "People-first support",
      description: "Local agents and local context help you avoid guessing and move quicker.",
    },
    {
      icon: Handshake,
      title:
        locale === "al"
          ? "Qartesi e plote"
          : locale === "mk"
            ? "Полна транспарентност"
            : locale === "de"
              ? "Volle Transparenz"
              : locale === "tr"
                ? "Tam açıklık"
                : "Trust-first handling",
      description: "Every listing is presented with clear context to keep your decision grounded.",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-50 via-sky-50/40 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <section className="rounded-3xl border border-sky-100 bg-white/80 p-8 shadow-sm backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            {t("about.title")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
            {coreCopy.aboutSectionTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600">
            {coreCopy.aboutSectionText}
          </p>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-gray-600">
            {t("about.description")}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {focusPoints.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="border-sky-100 bg-sky-50 transition-colors hover:shadow-md hover:bg-sky-100/60"
                >
                  <CardContent className="flex gap-3 p-5">
                    <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-sky-100 bg-sky-50 p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{coreCopy.missionTitle}</h2>
          <p className="max-w-4xl text-lg leading-relaxed text-gray-600">
            {coreCopy.missionText}
          </p>
          <div className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
            <p className="rounded-xl bg-white/70 px-4 py-3 leading-relaxed">
              We focus on practical details, not listing noise.
            </p>
            <p className="rounded-xl bg-white/70 px-4 py-3 leading-relaxed">
              Compare faster with clearer information.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
              {coreCopy.processTitle}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900">
              {locale === "en" ? "How we work" : coreCopy.processTitle}
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-gray-600">{coreCopy.processText}</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {coreCopy.processSteps.map((step, index) => {
              const iconMap = [Search, UserCheck, Handshake];
              const Icon = iconMap[index];

              return (
                <Card
                  key={step.title}
                  className="border-slate-100 bg-sky-50/90 transition-colors hover:border-sky-200 hover:bg-white"
                >
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {Icon ? <Icon className="h-5 w-5 text-sky-700" /> : null}
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{coreCopy.whyTitle}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="border-sky-100 bg-sky-50/90 transition-colors hover:border-sky-200 hover:bg-white"
                >
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex-shrink-0">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-gray-900">{value.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/60 bg-slate-900 p-8 text-white shadow-lg sm:p-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">{coreCopy.teamTitle}</h2>
            <Building2 className="h-6 w-6 text-sky-200" />
          </div>
          <p className="max-w-3xl leading-relaxed text-slate-200">{coreCopy.teamText}</p>
          <p className="mt-4 text-sm text-slate-300">{coreCopy.ctaText}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href={`/${locale}/properties`} className="inline-flex items-center">
                {coreCopy.ctaButton}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/${locale}/contact`} className="inline-flex items-center">
                {coreCopy.ctaButtonSecondary}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
