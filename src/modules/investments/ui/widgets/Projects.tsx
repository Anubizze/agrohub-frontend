import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import { ProjectCard } from "../components/ProjectCard";

type ProjectStatus = "search" | "partial" | "ready";
type ProjectRisk = "low" | "medium" | "high";

type ProjectBase = {
  risk: ProjectRisk;
  sector: string;
  name: string;
  description: string;
  investment: string;
  roi: string;
  advantages: string[];
  status: ProjectStatus;
  time: string;
};

type ProjectTranslation = Pick<ProjectBase, "sector" | "name" | "description" | "advantages">;

const mockProjectData: ProjectBase[] = [
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

const isProjectTranslationArray = (
  value: unknown,
): value is ProjectTranslation[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const record = item as Record<string, unknown>;

    const advantages = record.advantages;

    return (
      typeof record.sector === "string" &&
      typeof record.name === "string" &&
      typeof record.description === "string" &&
      Array.isArray(advantages) &&
      advantages.every((advantage) => typeof advantage === "string")
    );
  });
};

export const Projects = () => {
  const t = useTranslations("investments.projects");

  const translationsRaw = t.raw("items");
  const projectTranslations = isProjectTranslationArray(translationsRaw)
    ? translationsRaw
    : [];

  const localizedProjects = mockProjectData.map((project, idx) => {
    const translation = projectTranslations[idx];

    if (!translation) {
      return project;
    }

    return {
      ...project,
      ...translation,
    } satisfies ProjectBase;
  });

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold ">{t("title")}</h2>
      <p className="text-gray-500 mb-4">{t("subtitle")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localizedProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white flex flex-col gap-4 items-center rounded-lg p-5">
        <h2 className="text-2xl font-bold">{t("ctaTitle")}</h2>
        <p className="text-lg ">{t("ctaText")}</p>
        <div>
          <Button variant="secondary">{t("ctaButton")}</Button>
        </div>
      </section>
    </section>
  );
};
