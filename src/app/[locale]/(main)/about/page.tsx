import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Search,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/routing";

type ProcessStep = {
  title: string;
  description: string;
};

type ValueCard = {
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

const aboutCopyByLocale: Record<Locale, AboutCopy> = {
  mk: {
    missionTitle: "Наша мисија",
    missionText:
      "Ја поедноставуваме потрагата по недвижности со јасни информации, проверени огласи и директна комуникација со локални агенти.",
    aboutSectionTitle: "За платформата",
    aboutSectionText:
      "Создадовме брза и прегледна платформа што ве води од првото пребарување до сигурна одлука.",
    processTitle: "Како работиме",
    processText: "Три јасни чекори за полесно и побрзо да ја најдете вистинската недвижност.",
    processSteps: [
      { title: "1) Пребарај", description: "Филтрирај по цена, површина, локација и тип на имот." },
      {
        title: "2) Спореди",
        description: "Прегледај клучни детали и контактирај агент директно.",
      },
      {
        title: "3) Одлучи",
        description: "Направи сигурен следен чекор со јасни информации.",
      },
    ],
    ctaButton: "Прегледај недвижности",
    whyTitle: "Зошто ние",
    whyPoints: [
      "Брзо и прецизно пребарување",
      "Директен контакт со локални агенти",
      "Транспарентни и проверени огласи",
    ],
  },
  al: {
    missionTitle: "Misioni ynë",
    missionText:
      "Ne e thjeshtojmë kërkimin e pronave me informacione të qarta, lista të verifikuara dhe lidhje direkte me agjentë lokalë.",
    aboutSectionTitle: "Rreth platformës",
    aboutSectionText:
      "Kemi ndërtuar një përvojë të shpejtë dhe të pastër që ju çon nga kërkimi i parë deri te vendimi me siguri.",
    processTitle: "Si funksionon",
    processText: "Tre hapa të qartë për ta gjetur më lehtë pronën e duhur.",
    processSteps: [
      { title: "1) Kërko", description: "Filtroni sipas çmimit, sipërfaqes, lokacionit dhe tipit." },
      {
        title: "2) Krahaso",
        description: "Shikoni detajet kryesore dhe kontaktoni agjentin direkt.",
      },
      {
        title: "3) Vendos",
        description: "Vazhdoni me hapin e radhës me informacion të qartë.",
      },
    ],
    ctaButton: "Shiko pronat",
    whyTitle: "Pse ne",
    whyPoints: [
      "Kërkim i fokusuar dhe i shpejtë",
      "Komunikim direkt me agjentët",
      "Lista të verifikuara dhe transparente",
    ],
  },
  en: {
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
  },
  de: {
    missionTitle: "Unsere Mission",
    missionText:
      "Wir vereinfachen die Immobiliensuche mit klaren Informationen, verifizierten Inseraten und direktem Kontakt zu lokalen Maklern.",
    aboutSectionTitle: "Über die Plattform",
    aboutSectionText:
      "Wir bieten einen klaren und schnellen Weg von der ersten Suche bis zur sicheren Entscheidung.",
    processTitle: "So funktioniert es",
    processText: "Drei klare Schritte, um schneller die passende Immobilie zu finden.",
    processSteps: [
      { title: "1) Suchen", description: "Filtern Sie nach Preis, Fläche, Lage und Typ." },
      {
        title: "2) Vergleichen",
        description: "Prüfen Sie die wichtigsten Details und kontaktieren Sie den Makler direkt.",
      },
      {
        title: "3) Entscheiden",
        description: "Gehen Sie mit klaren Informationen sicher zum nächsten Schritt.",
      },
    ],
    ctaButton: "Immobilien ansehen",
    whyTitle: "Warum wir",
    whyPoints: [
      "Schnelle und präzise Suche",
      "Direkte Kommunikation mit lokalen Maklern",
      "Verifizierte und transparente Inserate",
    ],
  },
  tr: {
    missionTitle: "Misyonumuz",
    missionText:
      "Gayrimenkul aramayı; net bilgiler, doğrulanmış ilanlar ve yerel danışmanlarla doğrudan iletişim ile kolaylaştırıyoruz.",
    aboutSectionTitle: "Platform hakkında",
    aboutSectionText:
      "İlk aramadan güvenli karara kadar daha hızlı ve daha anlaşılır bir deneyim sunuyoruz.",
    processTitle: "Nasıl çalışır",
    processText: "Doğru mülkü daha hızlı bulmanız için üç net adım.",
    processSteps: [
      { title: "1) Ara", description: "Fiyat, metrekare, konum ve türe göre filtreleyin." },
      {
        title: "2) Karşılaştır",
        description: "Ana detayları inceleyin ve danışmanla doğrudan iletişim kurun.",
      },
      {
        title: "3) Karar ver",
        description: "Net bilgilerle bir sonraki adıma güvenle ilerleyin.",
      },
    ],
    ctaButton: "İlanları görüntüle",
    whyTitle: "Neden biz",
    whyPoints: [
      "Hızlı ve odaklı arama",
      "Yerel danışmanlarla doğrudan iletişim",
      "Doğrulanmış ve şeffaf ilanlar",
    ],
  },
};

const valueCardsByLocale: Record<Locale, ValueCard[]> = {
  mk: [
    {
      title: "Голем избор",
      description: "Пребарувајте проверени недвижности низ цела Северна Македонија.",
    },
    {
      title: "Локални агенти",
      description: "Добијте поддршка од локални агенти во секој чекор.",
    },
    {
      title: "Транспарентност",
      description: "Јасни детали за огласите и едноставен процес на купување или наем.",
    },
  ],
  al: [
    {
      title: "Zgjedhje e gjerë",
      description: "Shfletoni prona të verifikuara në gjithë Maqedoninë e Veriut.",
    },
    {
      title: "Agjentë lokalë",
      description: "Merrni mbështetje nga agjentë lokalë në çdo hap.",
    },
    {
      title: "Transparencë",
      description: "Detaje të qarta dhe proces i thjeshtë për blerje ose qira.",
    },
  ],
  en: [
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
  de: [
    {
      title: "Große Auswahl",
      description: "Durchsuchen Sie verifizierte Immobilien in ganz Nordmazedonien.",
    },
    {
      title: "Lokale Makler",
      description: "Erhalten Sie Unterstützung von lokalen Maklern auf jedem Schritt.",
    },
    {
      title: "Transparenz",
      description: "Klare Inseratsdetails und ein einfacher Kauf- oder Mietprozess.",
    },
  ],
  tr: [
    {
      title: "Geniş Seçenek",
      description: "Kuzey Makedonya genelinde doğrulanmış ilanları inceleyin.",
    },
    {
      title: "Yerel Danışmanlar",
      description: "Her adımda yerel danışmanlardan destek alın.",
    },
    {
      title: "Şeffaflık",
      description: "Net ilan detayları ve sade bir satın alma/kiralama süreci.",
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

  const coreCopy = aboutCopyByLocale[locale] ?? aboutCopyByLocale.en;
  const values = valueCardsByLocale[locale] ?? valueCardsByLocale.en;
  const aboutHeadingClass = "font-semibold";
  const aboutParagraphClass =
    "leading-relaxed antialiased text-[14px] text-[rgba(75,85,99,0.95)] sm:text-sm";
  const valueIcons = [Search, Building2, Shield] as const;

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_32%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_34%)]" />
      <div className="pointer-events-none absolute right-0 top-24 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-sky-100/80 bg-white/88 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  <Compass className="h-3.5 w-3.5" />
                  {t("about.title")}
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                  {coreCopy.aboutSectionTitle}
                </h1>
                <p className={`mt-4 max-w-2xl text-base text-slate-600 sm:text-lg ${aboutParagraphClass}`}>
                  {coreCopy.aboutSectionText}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={`/${locale}`} className="inline-flex items-center">
                    {coreCopy.ctaButton}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="flex flex-wrap gap-2">
                  {coreCopy.whyPoints.slice(0, 2).map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.95)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  {coreCopy.missionTitle}
                </p>
                <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
                  {coreCopy.missionText}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {values.map((value, index) => {
                  const Icon = valueIcons[index] ?? Shield;

                  return (
                    <div
                      key={value.title}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                          <Icon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold text-slate-950 ${aboutHeadingClass}`}>
                            {value.title}
                          </p>
                          <p className={`mt-1 text-sm text-slate-600 ${aboutParagraphClass}`}>
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              {coreCopy.whyTitle}
            </p>
            <h2 className={`mt-3 text-2xl font-semibold text-slate-950 ${aboutHeadingClass}`}>
              {coreCopy.processTitle}
            </h2>
            <p className={`mt-3 text-sm text-slate-600 ${aboutParagraphClass}`}>
              {coreCopy.processText}
            </p>

            <div className="mt-6 space-y-3">
              {coreCopy.whyPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-sm font-medium text-slate-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {coreCopy.processTitle}
                  </p>
                  <h2 className={`mt-1 text-2xl font-semibold text-slate-950 ${aboutHeadingClass}`}>
                  {coreCopy.missionTitle}
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {coreCopy.processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 pl-16"
                >
                  <div className="absolute left-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className={`text-base font-semibold text-slate-950 ${aboutHeadingClass}`}>
                    {step.title}
                  </h3>
                  <p className={`mt-2 text-sm text-slate-600 ${aboutParagraphClass}`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_60%,#b45309_100%)] p-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                NovaBuildings
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight sm:text-3xl">
                {coreCopy.missionText}
              </h2>
            </div>
            <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              <Link href={`/${locale}`} className="inline-flex items-center">
                {coreCopy.ctaButton}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
