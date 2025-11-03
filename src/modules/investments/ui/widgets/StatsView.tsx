import { useTranslations } from "next-intl";

import { StatsCard } from "../components/StatsCard";

const base = [
  {
    titleKey: "investments.stats.total",
    value: "45.8 млрд ₸",
    tooltipKey: "investments.stats.totalTooltip",
  },
  {
    titleKey: "investments.stats.projects",
    value: "23",
    tooltipKey: "investments.stats.projectsTooltip",
  },
  {
    titleKey: "investments.stats.avgRoi",
    value: "18.5%",
    tooltipKey: "investments.stats.avgRoiTooltip",
  },
  {
    titleKey: "investments.stats.jobs",
    value: "3 420",
    tooltipKey: "investments.stats.jobsTooltip",
  },
];

export const StatsView = () => {
  const t = useTranslations();
  const mock = base.map((s) => ({
    title: t(s.titleKey as any),
    value: s.value,
    tooltip: t(s.tooltipKey as any),
  }));
  return (
    <section className="flex gap-2 flex-wrap">
      {mock.map((stat) => (
        <StatsCard key={stat.title} stats={stat} />
      ))}
    </section>
  );
};
