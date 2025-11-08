import { redirect } from "@/shared/configs/i18/navigation";
import type { LocaleType } from "@/shared/types/locale.type";

type StatisticsIndexPageProps = {
  params: Promise<{
    locale: LocaleType[number];
  }>;
};

export default async function StatisticsIndexPage({ params }: StatisticsIndexPageProps) {
  const { locale } = await params;

  redirect({ href: "/statistics/meteorology", locale });
}

