import { getTranslations } from "next-intl/server";

import {
  MeteorologyOverview,
  type MeteorologyOverviewLabels,
  type MeteorologyOverviewUnits,
  type MeteorologyRegionData,
} from "@/modules/statistics";

export default async function MeteorologyPage() {
  const t = await getTranslations("statistics.meteorology");
  const labels = t.raw("labels") as MeteorologyOverviewLabels;
  const units = t.raw("units") as MeteorologyOverviewUnits;
  const regions = t.raw("regions") as MeteorologyRegionData[];

  return (
    <MeteorologyOverview
      title={t("title")}
      subtitle={t("subtitle")}
      yearLabel={t("yearTag")}
      labels={labels}
      units={units}
      regions={regions}
    />
  );
}

