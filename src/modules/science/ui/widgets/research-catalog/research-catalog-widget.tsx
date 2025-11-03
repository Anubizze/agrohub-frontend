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
              {t("science.catalog.title")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("science.catalog.subtitle")}
            </p>
          </div>

          {/* Премиум контент тег */}
          <Badge
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 px-4 py-2"
          >
            <Star className="w-4 h-4" />
            {t("science.catalog.premium")}
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
          {t("science.catalog.aboutTitle")}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {t("science.catalog.aboutText")}
        </p>
      </div>
    </div>
  );
};
