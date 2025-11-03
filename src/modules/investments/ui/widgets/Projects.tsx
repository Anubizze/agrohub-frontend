import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import { ProjectCard } from "../components/ProjectCard";

const mockProjectData: {
  risk: "low" | "medium" | "high";
  sector: string;
  name: string;
  description: string;
  investment: string;
  roi: string;
  advantages: string[];
  status: "search" | "partial" | "ready";
  time: string;
}[] = [
  {
    risk: "medium",
    sector: "Переработка",
    name: "Агротехнопарк «Абай»",
    description:
      "Современный комплекс переработки зерновых с использованием передовых технологий",
    investment: "8.5 млрд ₸",
    roi: "22.3%",
    time: "4.2 лет",
    advantages: [
      "Государственная поддержка",
      "Экспортный потенциал",
      "Создание 250 рабочих мест",
    ],
    status: "search",
  },
  {
    risk: "low",
    sector: "Животноводство",
    name: "Цифровая ферма будущего",
    description:
      "Высокотехнологичный животноводческий комплекс с автоматизированными системами",
    investment: "12.3 млрд ₸",
    roi: "19.8%",
    time: "5.1 лет",
    advantages: ["IoT мониторинг", "Органическая продукция", "Экологичность"],
    status: "partial",
  },
  {
    risk: "medium",
    sector: "Логистика",
    name: "Логистический хаб АПК",
    description:
      "Мультимодальный логистический центр для обслуживания сельхозпроизводителей региона",
    investment: "15.7 млрд ₸",
    roi: "25.6%",
    time: "3.8 лет",
    advantages: [
      "Стратегическое расположение",
      "Государственные гарантии",
      "Быстрая окупаемость",
    ],
    status: "ready",
  },
];
export const Projects = () => {
  const t = useTranslations();
  const localizedProjects = mockProjectData.map((p, idx) => ({
    ...p,
    sector: t(`investments.projects.items.${idx}.sector` as any),
    name: t(`investments.projects.items.${idx}.name` as any),
    description: t(`investments.projects.items.${idx}.description` as any),
    advantages: [
      t(`investments.projects.items.${idx}.advantages.0` as any),
      t(`investments.projects.items.${idx}.advantages.1` as any),
      t(`investments.projects.items.${idx}.advantages.2` as any),
    ],
  }));
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold ">{t("investments.projects.title")}</h2>
      <p className="text-gray-500 mb-4">{t("investments.projects.subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localizedProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white flex flex-col gap-4 items-center rounded-lg p-5">
        <h2 className="text-2xl font-bold">{t("investments.projects.ctaTitle")}</h2>
        <p className="text-lg ">{t("investments.projects.ctaText")}</p>
        <div>
          <Button variant={"secondary"}>{t("investments.projects.ctaButton")}</Button>
        </div>
      </section>
    </section>
  );
};
