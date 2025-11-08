import { useTranslations } from "next-intl";

import { StatsCard } from "../components/StatsCard";

type StatKey = "total" | "projects" | "avgRoi" | "jobs";
type TooltipKey = `${StatKey}Tooltip`;

type StatConfig = {
  titleKey: StatKey;
  value: string;
  tooltipKey: TooltipKey;
};

const statsConfig: StatConfig[] = [
  {
    titleKey: "total",
    value: "45.8 млрд ₸",
    tooltipKey: "totalTooltip",
  },
  {
    titleKey: "projects",
    value: "23",
    tooltipKey: "projectsTooltip",
  },
  {
    titleKey: "avgRoi",
    value: "18.5%",
    tooltipKey: "avgRoiTooltip",
  },
  {
    titleKey: "jobs",
    value: "3 420",
    tooltipKey: "jobsTooltip",
  },
];

export const StatsView = () => {
  const t = useTranslations("investments.stats");

  const stats = statsConfig.map((config) => ({
    title: t(config.titleKey),
    value: config.value,
    tooltip: t(config.tooltipKey),
  }));

  return (
    <section className="flex gap-2 flex-wrap">
      {stats.map((stat) => (
        <StatsCard key={stat.title} stats={stat} />
      ))}
    </section>
  );
};
