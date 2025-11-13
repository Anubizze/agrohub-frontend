import { getTranslations } from "next-intl/server";

import {
  MeteorologyOverview,
  type MeteorologyOverviewAnalysis,
  type MeteorologyOverviewLabels,
  type MeteorologyOverviewYearOption,
  type MeteorologyOverviewRanges,
  type MeteorologyOverviewUnits,
} from "@/modules/statistics";
import { fetchMeteorologyOverview } from "@/modules/statistics/utils/meteorology-service";

export default async function MeteorologyPage() {
  const t = await getTranslations("statistics.meteorology");
  const labels = t.raw("labels") as MeteorologyOverviewLabels;
  const units = t.raw("units") as MeteorologyOverviewUnits;
  const ranges = t.raw("ranges") as MeteorologyOverviewRanges;
  const analysis = t.raw("analysis") as MeteorologyOverviewAnalysis;
  const datasetsByYear = await fetchMeteorologyOverview();
  const availableYears = Object.keys(datasetsByYear).sort();
  const yearOptions: MeteorologyOverviewYearOption[] = availableYears.map((year) => ({
    value: year,
    label: t("yearToggle", { year }),
  }));
  const defaultYear = availableYears.at(-1) ?? "2023";

  return (
    <MeteorologyOverview
      title={t("title")}
      subtitle={t("subtitle")}
      labels={labels}
      units={units}
      ranges={ranges}
      analysis={analysis}
      datasets={datasetsByYear}
      yearOptions={yearOptions}
      defaultYear={defaultYear}
    />
  );
}

