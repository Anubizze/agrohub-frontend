import { useTranslations } from "next-intl";

import { RiskAnalysisCard } from "../components/RiskAnalysisCard";

const mock: {
  name: string;
  status: "low" | "medium" | "high";
  progress: number;
  note: string;
}[] = [
  {
    name: "Погодные условия",
    status: "high",
    progress: 90,
    note: "Страхование урожая",
  },
  {
    name: "Рыночная волатильность",
    status: "medium",
    progress: 60,
    note: "Диверсификация",
  },
  {
    name: "Валютные риски",
    status: "medium",
    progress: 65,
    note: "Хеджирование",
  },
  {
    name: "Регуляторные изменения",
    status: "low",
    progress: 20,
    note: "Мониторинг законов",
  },
  {
    name: "Технологические риски",
    status: "low",
    progress: 25,
    note: "Поэтапное внедрение",
  },
];
export const RiskAnalysisView = () => {
  const t = useTranslations();
  const names = [
    t("investments.risk.items.0.name"),
    t("investments.risk.items.1.name"),
    t("investments.risk.items.2.name"),
    t("investments.risk.items.3.name"),
    t("investments.risk.items.4.name"),
  ];
  const notes = [
    t("investments.risk.items.0.note"),
    t("investments.risk.items.1.note"),
    t("investments.risk.items.2.note"),
    t("investments.risk.items.3.note"),
    t("investments.risk.items.4.note"),
  ];
  const localized = mock.map((m, i) => ({ ...m, name: names[i], note: notes[i] }));
  return (
    <section>
      <h2 className="text-2xl mb-4 font-bold">{t("investments.risk.title")}</h2>
      <section>
        {localized.map((item) => (
          <RiskAnalysisCard key={item.name} {...item} />
        ))}
      </section>
    </section>
  );
};
