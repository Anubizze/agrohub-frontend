import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { mockRecommendationsData } from "../model/recommendations.mock-data";
import type {
  Metric,
  RadarDatum,
  Recommendation,
  RecommendationsData,
} from "../schemas/recommendation.schema";

const keyStatsOrder = [
  "totalAnimals",
  "vaccinated",
  "export",
  "sownArea",
] as const;

type RecommendationTranslation = Pick<
  Recommendation,
  "category" | "title" | "description" | "deadline" | "result"
>;
type MetricTranslation = Pick<Metric, "name" | "note">;
type RadarTranslation = Pick<RadarDatum, "metric">;

const isRecommendationTranslationArray = (
  value: unknown,
): value is RecommendationTranslation[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const record = item as Record<string, unknown>;

    return (
      typeof record.category === "string" &&
      typeof record.title === "string" &&
      typeof record.description === "string" &&
      typeof record.deadline === "string" &&
      typeof record.result === "string"
    );
  });
};

const isMetricTranslationArray = (
  value: unknown,
): value is MetricTranslation[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const record = item as Record<string, unknown>;

    return (
      typeof record.name === "string" &&
      (typeof record.note === "string" || typeof record.note === "undefined")
    );
  });
};

const isRadarTranslationArray = (
  value: unknown,
): value is RadarTranslation[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    return typeof (item as Record<string, unknown>).metric === "string";
  });
};

/**
 * Хук для получения данных рекомендаций
 *
 * @returns Объект с данными рекомендаций и методами для работы с ними
 * @example
 * ```typescript
 * const { data, isLoading, error } = useRecommendations();
 * ```
 */
const translateWithFallback = (
  translator: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string,
): string => {
  try {
    const translated = translator(key);
    if (typeof translated === "string" && translated.trim() && translated !== key) {
      return translated;
    }
  } catch (error) {
    // ignore, fallback
  }
  return fallback;
};

const getRawValue = <T>(
  translator: ReturnType<typeof useTranslations>,
  key: string,
): T | undefined => {
  const rawFn = (translator as unknown as { raw?: (path: string) => unknown }).raw;
  if (typeof rawFn !== "function") {
    return undefined;
  }

  try {
    return rawFn(key) as T;
  } catch (error) {
    return undefined;
  }
};

export const useRecommendations = () => {
  const t = useTranslations("recommendation.mock");
  const isLoading = false;
  const error = null;

  // Локализуем данные
  const data: RecommendationsData = useMemo(() => {
    const localizedData: RecommendationsData = {
      ...mockRecommendationsData,
    };

    // Локализуем ключевые показатели
    localizedData.keyStats = mockRecommendationsData.keyStats.map(
      (stat, index) => {
        const key = keyStatsOrder[index];
        if (!key) {
          return stat;
        }

        return {
          ...stat,
          title: translateWithFallback(t, `keyStats.${key}`, stat.title),
        } satisfies RecommendationsData["keyStats"][number];
      },
    );

    // Локализуем данные эффективности
    localizedData.efficiencyData = {
      currentEfficiency: {
        ...mockRecommendationsData.efficiencyData.currentEfficiency,
        title: translateWithFallback(
          t,
          "efficiency.currentEfficiency.title",
          mockRecommendationsData.efficiencyData.currentEfficiency.title,
        ),
        comment: translateWithFallback(
          t,
          "efficiency.currentEfficiency.comment",
          mockRecommendationsData.efficiencyData.currentEfficiency.comment,
        ),
      },
      regionalIndicator: {
        ...mockRecommendationsData.efficiencyData.regionalIndicator,
        title: translateWithFallback(
          t,
          "efficiency.regionalIndicator.title",
          mockRecommendationsData.efficiencyData.regionalIndicator.title,
        ),
        comment: translateWithFallback(
          t,
          "efficiency.regionalIndicator.comment",
          mockRecommendationsData.efficiencyData.regionalIndicator.comment,
        ),
      },
      growthPotential: {
        ...mockRecommendationsData.efficiencyData.growthPotential,
        title: translateWithFallback(
          t,
          "efficiency.growthPotential.title",
          mockRecommendationsData.efficiencyData.growthPotential.title,
        ),
        comment: translateWithFallback(
          t,
          "efficiency.growthPotential.comment",
          mockRecommendationsData.efficiencyData.growthPotential.comment,
        ),
      },
    } satisfies RecommendationsData["efficiencyData"];

    // Локализуем рекомендации
    const recommendationsRaw = getRawValue<unknown[]>(t, "recommendations");
    const recommendationTranslations = isRecommendationTranslationArray(
      recommendationsRaw,
    )
      ? recommendationsRaw
      : [];

    localizedData.recommendations = mockRecommendationsData.recommendations.map(
      (rec, index) => {
        const translation = recommendationTranslations[index];
        if (!translation) {
          return rec;
        }

        return {
          ...rec,
          ...translation,
        } satisfies RecommendationsData["recommendations"][number];
      },
    );

    // Локализуем анализ почвы
    const soilMetricsRaw = getRawValue<unknown[]>(t, "soilAnalysis.metrics");
    const soilMetricsTranslations = isMetricTranslationArray(soilMetricsRaw)
      ? soilMetricsRaw
      : [];
    const soilRadarRaw = getRawValue<unknown[]>(t, "soilAnalysis.radarData");
    const soilRadarTranslations = isRadarTranslationArray(soilRadarRaw)
      ? soilRadarRaw
      : [];

    localizedData.soilAnalysis = {
      ...mockRecommendationsData.soilAnalysis,
      metrics: mockRecommendationsData.soilAnalysis.metrics.map(
        (metric, index) => {
          const translation = soilMetricsTranslations[index];
          if (!translation) {
            return metric;
          }

          return {
            ...metric,
            ...translation,
          } satisfies RecommendationsData["soilAnalysis"]["metrics"][number];
        },
      ),
      radarData: mockRecommendationsData.soilAnalysis.radarData.map(
        (radar, index) => {
          const translation = soilRadarTranslations[index];
          if (!translation) {
            return radar;
          }

          return {
            ...radar,
            ...translation,
          } satisfies RecommendationsData["soilAnalysis"]["radarData"][number];
        },
      ),
    } satisfies RecommendationsData["soilAnalysis"];

    // Локализуем анализ животных
    const animalMetricsRaw = getRawValue<unknown[]>(t, "animalAnalysis.metrics");
    const animalMetricsTranslations = isMetricTranslationArray(animalMetricsRaw)
      ? animalMetricsRaw
      : [];
    const animalRadarRaw = getRawValue<unknown[]>(t, "animalAnalysis.radarData");
    const animalRadarTranslations = isRadarTranslationArray(animalRadarRaw)
      ? animalRadarRaw
      : [];

    localizedData.animalAnalysis = {
      ...mockRecommendationsData.animalAnalysis,
      metrics: mockRecommendationsData.animalAnalysis.metrics.map(
        (metric, index) => {
          const translation = animalMetricsTranslations[index];
          if (!translation) {
            return metric;
          }

          return {
            ...metric,
            ...translation,
          } satisfies RecommendationsData["animalAnalysis"]["metrics"][number];
        },
      ),
      radarData: mockRecommendationsData.animalAnalysis.radarData.map(
        (radar, index) => {
          const translation = animalRadarTranslations[index];
          if (!translation) {
            return radar;
          }

          return {
            ...radar,
            ...translation,
          } satisfies RecommendationsData["animalAnalysis"]["radarData"][number];
        },
      ),
    } satisfies RecommendationsData["animalAnalysis"];

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
