"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/shared/components/ui";

import { researchListMock } from "../../../model/research.mock-data";
import type { Research } from "../../../schemas/research.schema";
import { ResearchCard } from "../../components/research-card";

/**
 * Пропсы виджета каталога исследований
 */
export interface ResearchCatalogWidgetProps {
  className?: string;
}

/**
 * Виджет каталога исследований для покупки готовых аналитических отчетов
 *
 * @param root0 - Пропсы виджета
 * @param root0.className - Дополнительные CSS классы
 * @returns JSX элемент каталога исследований
 */
export const ResearchCatalogWidget: React.FC<ResearchCatalogWidgetProps> = ({
  className = "",
}) => {
  const t = useTranslations();

  const translateSafely = (key: string, fallback: string): string => {
    try {
      const translated = t(key);
      if (typeof translated === "string" && translated.trim() && translated !== key) {
        return translated;
      }
    } catch (error) {
      // ignore and return fallback
    }
    return fallback;
  };

  const handlePurchase = (research: Research) => {
    // TODO: Реализовать логику покупки исследования
    // Здесь можно добавить интеграцию с платежной системой
    // или переход на страницу оплаты
    alert(`Покупка исследования: ${research.title}`);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Заголовок страницы */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {translateSafely("science.catalog.title", "Аналитические исследования")}
            </h1>
            <p className="text-lg text-gray-600">
              {translateSafely(
                "science.catalog.subtitle",
                "Экспертные отчеты и прогнозы для принятия решений",
              )}
            </p>
          </div>

          {/* Премиум контент тег */}
          <Badge
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 px-4 py-2"
          >
            <Star className="w-4 h-4" />
            {translateSafely("science.catalog.premium", "Премиум доступ")}
          </Badge>
        </div>
      </div>

      {/* Сетка исследований */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {researchListMock.map((research) => (
          <ResearchCard
            key={research.id}
            research={research}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="bg-gray-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {translateSafely("science.catalog.aboutTitle", "О сервисе аналитики")}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {translateSafely(
            "science.catalog.aboutText",
            "Получайте доступ к отраслевым исследованиям и прогнозам, подготовленным экспертами агропромышленного комплекса.",
          )}
        </p>
      </div>
    </div>
  );
};
