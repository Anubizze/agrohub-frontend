"use client";

import { HeartPulse, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Card } from "@/shared/components/ui";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";

import { useRecommendations } from "../../../hooks/useRecommendations";
import { MetricCard } from "../../components/MetricCard/MetricCard";

/**
 * Пропсы для компонента AnalysisWidget
 */
export interface AnalysisWidgetProps {
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Виджет для отображения анализа почвы и животных
 *
 * @param props - Пропсы компонента
 * @param props.className - Дополнительные CSS классы
 * @returns JSX элемент виджета анализа
 * @example
 * ```typescript
 * <AnalysisWidget />
 * ```
 */
export const AnalysisWidget: React.FC<AnalysisWidgetProps> = ({
  className,
}) => {
  const { data } = useRecommendations();
  const t = useTranslations("recommendation.analysis");
  const tChartSoil = useTranslations("recommendation.mock.soilAnalysis.chartConfig");
  const tChartAnimal = useTranslations("recommendation.mock.animalAnalysis.chartConfig");

  /**
   * Рендерит карточку с метриками и радарной диаграммой
   *
   * @param title - Заголовок карточки
   * @param metrics - Массив метрик
   * @param radarData - Данные для радарной диаграммы
   * @param icon - Иконка для карточки
   * @param gradient - Градиент для карточки
   * @param index - Индекс для анимации
   * @returns JSX элемент карточки с метриками
   */
  const renderMetricsCard = (
    title: string,
    metrics: typeof data.soilAnalysis.metrics,
    radarData: typeof data.soilAnalysis.radarData,
    icon: React.ReactNode,
    gradient: string,
    index: number
  ) => {
    const isSoil = title.toLowerCase().includes("soil");
    const tChart = isSoil ? tChartSoil : tChartAnimal;
    
    return (
      <div
        className="animate-in fade-in-0 slide-in-from-bottom-4"
        style={{
          animationDelay: `${index * 200}ms`,
          animationFillMode: "both",
        }}
      >
        <Card className="p-6 border-2 ">
          {/* Заголовок с иконкой */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {isSoil
                  ? t("soilAnalysis.subtitle")
                  : t("animalAnalysis.subtitle")}
              </p>
            </div>
          </div>

          {/* Метрики */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {metrics.map((metric, metricIndex) => (
              <div
                key={metric.name}
                className="animate-in fade-in-0 slide-in-from-left-2"
                style={{
                  animationDelay: `${index * 200 + metricIndex * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <MetricCard metric={metric} />
              </div>
            ))}
          </div>

          {/* Радарная диаграмма */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                {isSoil ? t("soilAnalysis.visualAnalysisTitle") : t("animalAnalysis.visualAnalysisTitle")}
              </h4>
              <p className="text-xs text-gray-500">
                {isSoil ? t("soilAnalysis.visualAnalysisSubtitle") : t("animalAnalysis.visualAnalysisSubtitle")}
              </p>
            </div>
            <ChartContainer
              config={{
                value: { label: tChart("value"), color: "hsl(221 83% 53%)" },
                min: { label: tChart("min"), color: "hsl(0 84% 60%)" },
                max: { label: tChart("max"), color: "hsl(142 76% 36%)" },
              }}
              className="aspect-[4/3]"
            >
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 120]}
                    tick={{ fontSize: 10 }}
                  />
                  {/* Фоновые нормы */}
                  <Radar
                    name={tChart("max")}
                    dataKey="max"
                    stroke="var(--color-max)"
                    fill="var(--color-max)"
                    fillOpacity={0.12}
                    strokeOpacity={0.6}
                    isAnimationActive={false}
                  />
                  <Radar
                    name={tChart("min")}
                    dataKey="min"
                    stroke="var(--color-min)"
                    fill="transparent"
                    strokeDasharray="4 4"
                    strokeOpacity={0.9}
                    isAnimationActive={false}
                  />
                  {/* Текущее значение поверх */}
                  <Radar
                    name={tChart("value")}
                    dataKey="value"
                    stroke="var(--color-value)"
                    fill="var(--color-value)"
                    fillOpacity={0.2}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <section className={`space-y-8 ${className || ""}`}>
      {/* Заголовок секции */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-900 to-teal-600 bg-clip-text text-transparent">
          {t("title")}
        </h2>
        <p className="text-gray-600 text-lg">
          {t("subtitle")}
        </p>
      </div>

      {/* Адаптивная сетка карточек анализа */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {renderMetricsCard(
          t("soilAnalysis.title"),
          data.soilAnalysis.metrics,
          data.soilAnalysis.radarData,
          <Sprout className="w-6 h-6 text-white" strokeWidth={2} />,
          "from-emerald-500 to-teal-500",
          0
        )}
        {renderMetricsCard(
          t("animalAnalysis.title"),
          data.animalAnalysis.metrics,
          data.animalAnalysis.radarData,
          <HeartPulse className="w-6 h-6 text-white" strokeWidth={2} />,
          "from-amber-500 to-orange-500",
          1
        )}
      </div>

      {/* Дополнительная информация */}
      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("recommendationTitle")}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t("recommendationText")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
