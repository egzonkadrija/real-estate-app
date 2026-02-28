import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Search, Shield } from "lucide-react";
import { Locale } from "@/i18n/routing";

type ProcessStep = {
  title: string;
  description: string;
};

type AboutCopy = {
  missionTitle: string;
  missionText: string;
  aboutSectionTitle: string;
  aboutSectionText: string;
  processTitle: string;
  processText: string;
  processSteps: ProcessStep[];
  ctaButton: string;
  whyTitle: string;
  whyPoints: string[];
};

const valueCards = {
  al: [
    {
      title: "Zgjedhje e gjere",
      description: "Shfletoni prona në disa hapa të shpejtë.",
    },
    {
      title: "Agjentë lokalë",
      description: "Merrni guida nga ekspertët tanë të zonës.",
    },
    {
      title: "Transparencë",
      description: "Duke punuar me të dhëna të qarta dhe transparente.",
    },
  ],
  default: [
    {
      title: "Wide Selection",
      description: "Browse thousands of verified properties across North Macedonia.",
    },
    {
      title: "Local Agents",
      description: "Get direction from local agents throughout your journey.",
    },
    {
      title: "Transparency",
      description: "Clear listing details and a straightforward buying/renting path.",
    },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const coreCopy: AboutCopy =
    locale === "al"
      ? {
          missionTitle: "Misioni Yne",
          missionText:
            "Ne thjeshtojmë procesin e pasurive të paluajtshme dhe e lidhim klientin me agjentin në një hap më të qartë.",
          aboutSectionTitle: "Mbi platformën tone",
          aboutSectionText:
            "Ne i shkurtojmë hapat e tepërt dhe e bëjmë kërkimin të qartë, të shpejtë dhe të besueshëm.",
          processTitle: "Si funksionojmë",
          processText:
            "Tri hapa të qartë nga kërkimi i parë deri tek vendimi i rregullt.",
          processSteps: [
            { title: "1) Kërko", description: "Përdor kërkim me filtrat e nevojshëm." },
            {
              title: "2) Krahaso",
              description: "Shikoni detajet kryesore dhe kontaktoni agjentin.",
            },
            { title: "3) Vendos", description: "Përfundoni me një hap të sigurt me mbështetje." },
          ],
          ctaButton: "Shiko Pronat",
          whyTitle: "Pse të na zgjidhni",
          whyPoints: [
            "Filtra të thjeshtë dhe të shpejtë",
            "Kontakt i drejtpërdrejtë me agjentin",
            "Listime të verifikuara",
          ],
        }
      : locale === "mk"
        ? {
            missionTitle: "Nasa misija",
            missionText:
              "Ni gi napraveno i procesot so poradi i kupuvaci i prosta i brzina do sporedba.",
            aboutSectionTitle: "За нас",
            aboutSectionText:
              "Нудиме јасна и брза платформа со проверени листинзи и поддршка.",
            processTitle: "Како работиме",
            processText:
              "Три чекори: прецизен пребарување, проверка и финален чекор.",
            processSteps: [
              { title: "1) Барај", description: "Филтрирај според буџет, локација и тип." },
              {
                title: "2) Провери",
                description: "Спореди детали dhe kontakto agjentin direkt.",
              },
              {
                title: "3) Одлучи",
                description: "Shko me hapin e ardhshëm me qartësi dhe shpejtësi.",
              },
            ],
            ctaButton: "Vidi nekretnini",
            whyTitle: "Зошто нас",
            whyPoints: [
              "Брзо пребарување",
              "Местна поддршка",
              "Транспарентни информации",
            ],
          }
        : locale === "de"
          ? {
              missionTitle: "Unsere Mission",
              missionText:
                "Wir vereinfachen Immobilienprozesse und stellen klare, sichere Informationen bereit.",
              aboutSectionTitle: "Über unsere Plattform",
              aboutSectionText:
                "Eine klare, schnelle und transparente Erfahrung von der Suche bis zur Entscheidung.",
              processTitle: "Wie wir arbeiten",
              processText: "Drei klare Schritte für Ihren nächsten Schritt.",
              processSteps: [
                { title: "1) Suchen", description: "Filtern nach Preis, Lage und Typ." },
                {
                  title: "2) Prüfen",
                  description: "Vergleichen Sie Details und schreiben Sie direkt mit dem Agenten.",
                },
                {
                  title: "3) Entscheiden",
                  description: "Gehen Sie mit klarer Information zum nächsten Schritt.",
                },
              ],
              ctaButton: "Immobilien durchsuchen",
              whyTitle: "Warum wir",
              whyPoints: [
                "Schnelle, fokussierte Suche",
                "Direkte Kommunikation",
                "Verifizierte Immobilieninserate",
              ],
            }
          : locale === "tr"
            ? {
                missionTitle: "Misyonumuz",
                missionText:
                  "Emlak sürecini basitleştiriyoruz ve adaylara net, güvenli bir yol sunuyoruz.",
                aboutSectionTitle: "Hakkımızda",
                aboutSectionText:
                  "Aramadan onaya kadar her adım net ve şeffaf bir şekilde ilerler.",
                processTitle: "Nasıl çalışırız",
                processText: "Üç basit adım ile sonuç odaklı ilerleme.",
                processSteps: [
                  { title: "1) Bul", description: "Bütçenize ve konumunuza göre filtreleyin." },
                  {
                    title: "2) Karşılaştır",
                    description: "Detayları karşılaştırın ve ajan ile doğrudan iletişim kurun.",
                  },
                  {
                    title: "3) İlerle",
                    description: "Net adımlarla ilerleyin ve güvenle karar verin.",
                  },
                ],
                ctaButton: "İlanları görüntüle",
                whyTitle: "Neden biz",
                whyPoints: [
                  "Hızlı filtreleme",
                  "Yerel uzmanlarla destek",
                  "Doğrulanmış ilanlar",
                ],
              }
            : {
                missionTitle: "Our Mission",
                missionText:
                  "We simplify real estate in North Macedonia through clear, fast, and transparent property workflows.",
                aboutSectionTitle: "About NovaBuildings",
                aboutSectionText:
                  "A cleaner, simpler journey from discovery to decision with less friction and better clarity.",
                processTitle: "How we work",
                processText: "Three steps help you move from interest to decision quickly.",
                processSteps: [
                  { title: "1) Search", description: "Filter by location, type, and budget." },
                  {
                    title: "2) Compare",
                    description: "Review key details and connect directly with an agent.",
                  },
                  {
                    title: "3) Proceed",
                    description: "Take the next step with a transparent update path.",
                  },
                ],
                ctaButton: "Browse properties",
                whyTitle: "Why choose us",
                whyPoints: [
                  "Focused discovery and quick filtering",
                  "Direct local support",
                  "Verified listings and clear details",
                ],
              };

  const aboutHeadingClass = "font-[var(--font-title)]";
  const aboutParagraphClass =
    "leading-relaxed antialiased text-[14px] text-[rgba(75,85,99,0.95)] sm:text-sm";

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

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-50 via-sky-50/40 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <section className="rounded-2xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7">
          <p className={`text-sm font-semibold uppercase tracking-[0.16em] text-sky-700 ${aboutHeadingClass}`}>
            {t("about.title")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
            {coreCopy.aboutSectionTitle}
          </h1>
          <p className={`mt-3 max-w-3xl text-base text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.aboutSectionText}
          </p>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
          <h2 className={`mb-2 text-xl font-bold text-gray-900 ${aboutHeadingClass}`}>
            {coreCopy.missionTitle}
          </h2>
          <p className={`max-w-4xl text-sm text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.missionText}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="border-sky-100 bg-white/80">
                <CardContent className="flex gap-3 p-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    {value.title === values[0].title ? (
                      <Search className="h-5 w-5 text-blue-600" />
                    ) : value.title === values[1].title ? (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`mb-1 text-sm font-semibold text-gray-900 ${aboutHeadingClass}`}>
                      {value.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${aboutParagraphClass}`}>
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-6 w-6 text-sky-700" />
            <h2 className={`text-xl font-bold text-gray-900 ${aboutHeadingClass}`}>
              {coreCopy.processTitle}
            </h2>
          </div>
          <p className={`mb-4 max-w-3xl text-sm text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.processText}
          </p>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {coreCopy.processSteps.map((step) => (
            <Card key={step.title} className="border-slate-100">
                <CardHeader className="pb-1">
                  <CardTitle className={`text-base ${aboutHeadingClass}`}>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm text-gray-600 ${aboutParagraphClass}`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mb-3 border-t border-slate-200 pt-3">
            <h3 className={`mb-2 text-base font-semibold text-gray-900 ${aboutHeadingClass}`}>
              {coreCopy.whyTitle}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {coreCopy.whyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <Button asChild size="sm">
            <Link href={`/${locale}/properties`} className="inline-flex items-center">
              {coreCopy.ctaButton}
              <Search className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
