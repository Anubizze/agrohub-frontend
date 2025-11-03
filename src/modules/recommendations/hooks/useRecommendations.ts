import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { mockRecommendationsData } from "../model/recommendations.mock-data";
import type { RecommendationsData } from "../schemas/recommendation.schema";

/**
 * Хук для получения данных рекомендаций
 *
 * @returns Объект с данными рекомендаций и методами для работы с ними
 * @example
 * ```typescript
 * const { data, isLoading, error } = useRecommendations();
 * ```
 */
export const useRecommendations = () => {
  const t = useTranslations("recommendation.mock");
  const isLoading = false;
  const error = null;
  
  // Локализуем данные
  const data: RecommendationsData = useMemo(() => {
    const localizedData = { ...mockRecommendationsData };
    
    // Локализуем ключевые показатели
    localizedData.keyStats = mockRecommendationsData.keyStats.map((stat, index) => ({
      ...stat,
      title: [
        t("keyStats.totalAnimals"),
        t("keyStats.vaccinated"),
        t("keyStats.export"),
        t("keyStats.sownArea"),
      ][index] || stat.title,
    }));
    
    // Локализуем данные эффективности
    localizedData.efficiencyData = {
      currentEfficiency: {
        ...mockRecommendationsData.efficiencyData.currentEfficiency,
        title: t("efficiency.currentEfficiency.title"),
        comment: t("efficiency.currentEfficiency.comment"),
      },
      regionalIndicator: {
        ...mockRecommendationsData.efficiencyData.regionalIndicator,
        title: t("efficiency.regionalIndicator.title"),
        comment: t("efficiency.regionalIndicator.comment"),
      },
      growthPotential: {
        ...mockRecommendationsData.efficiencyData.growthPotential,
        title: t("efficiency.growthPotential.title"),
        comment: t("efficiency.growthPotential.comment"),
      },
    };
    
    // Локализуем рекомендации
    const recommendationsT = t.raw("recommendations") as any;
    localizedData.recommendations = mockRecommendationsData.recommendations.map((rec, index) => ({
      ...rec,
      category: recommendationsT[index]?.category || rec.category,
      title: recommendationsT[index]?.title || rec.title,
      description: recommendationsT[index]?.description || rec.description,
      deadline: recommendationsT[index]?.deadline || rec.deadline,
      result: recommendationsT[index]?.result || rec.result,
    }));
    
    // Локализуем анализ почвы
    const soilMetrics = t.raw("soilAnalysis.metrics") as any;
    const soilRadar = t.raw("soilAnalysis.radarData") as any;
    localizedData.soilAnalysis = {
      ...mockRecommendationsData.soilAnalysis,
      metrics: mockRecommendationsData.soilAnalysis.metrics.map((metric, index) => ({
        ...metric,
        name: soilMetrics[index]?.name || metric.name,
        note: soilMetrics[index]?.note || metric.note,
      })),
      radarData: mockRecommendationsData.soilAnalysis.radarData.map((radar, index) => ({
        ...radar,
        metric: soilRadar[index]?.metric || radar.metric,
      })),
    };
    
    // Локализуем анализ животных
    const animalMetrics = t.raw("animalAnalysis.metrics") as any;
    const animalRadar = t.raw("animalAnalysis.radarData") as any;
    localizedData.animalAnalysis = {
      ...mockRecommendationsData.animalAnalysis,
      metrics: mockRecommendationsData.animalAnalysis.metrics.map((metric, index) => ({
        ...metric,
        name: animalMetrics[index]?.name || metric.name,
        note: animalMetrics[index]?.note || metric.note,
      })),
      radarData: mockRecommendationsData.animalAnalysis.radarData.map((radar, index) => ({
        ...radar,
        metric: animalRadar[index]?.metric || radar.metric,
      })),
    };
    
    return localizedData;
  }, [t]);

  /**
   * Получить рекомендации по приоритету
   */
  const getRecommendationsByPriority = useMemo(() => {
    return (priority: "high" | "medium" | "low") => {
      return data.recommendations.filter((rec) => rec.priority === priority);
    };
  }, [data.recommendations]);

  /**
   * Получить рекомендации по категории
   */
  const getRecommendationsByCategory = useMemo(() => {
    return (category: string) => {
      return data.recommendations.filter((rec) => rec.category === category);
    };
  }, [data.recommendations]);

  /**
   * Получить статистику по рекомендациям
   */
  const getRecommendationsStats = useMemo(() => {
    const stats = {
      total: data.recommendations.length,
      high: data.recommendations.filter((rec) => rec.priority === "high")
        .length,
      medium: data.recommendations.filter((rec) => rec.priority === "medium")
        .length,
      low: data.recommendations.filter((rec) => rec.priority === "low").length,
    };
    return stats;
  }, [data.recommendations]);

  /**
   * Получить текущую эффективность
   */
  const getCurrentEfficiency = useMemo(() => {
    return data.efficiencyData.currentEfficiency;
  }, [data.efficiencyData]);

  /**
   * Получить прогноз роста
   */
  const getGrowthForecast = useMemo(() => {
    return data.growthForecast;
  }, [data.growthForecast]);

  return {
    data,
    isLoading,
    error,
    getRecommendationsByPriority,
    getRecommendationsByCategory,
    getRecommendationsStats,
    getCurrentEfficiency,
    getGrowthForecast,
  };
};
