"use client";

import { BarChart3, Clock, FileText, Lock, Mountain, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/shared/components/ui";
import { Badge } from "@/shared/components/ui";

import type { Research } from "../../../schemas/research.schema";

/**
 * Иконки для категорий исследований
 */
const categoryIcons = {
  Растениеводство: Mountain,
  Животноводство: BarChart3,
  Маркетинг: Clock,
  Аналитика: FileText,
} as const;

/**
 * Пропсы компонента ResearchCard
 */
export interface ResearchCardProps {
  research: Research;
  onPurchase?: (research: Research) => void;
  className?: string;
}

/**
 * Компонент карточки исследования для каталога
 *
 * @param root0 - Пропсы компонента
 * @param root0.research - Данные исследования для отображения
 * @param root0.onPurchase - Обработчик покупки исследования
 * @param root0.className - Дополнительные CSS классы
 * @returns JSX элемент карточки исследования
 */
export const ResearchCard: React.FC<ResearchCardProps> = ({
  research,
  onPurchase,
  className = "",
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const CategoryIcon =
    categoryIcons[research.category as keyof typeof categoryIcons] || FileText;

  const translateSafely = (
    key: string,
    fallback: string,
    values?: Record<string, unknown>,
  ): string => {
    try {
      const translated = t(key, values ?? {});
      if (typeof translated === "string" && translated.trim() && translated !== key) {
        return translated;
      }
    } catch {
      // ignore and use fallback
    }

    if (values) {
      return fallback
        .replace("{price}", String(values.price ?? ""))
        .replace("{count}", String(values.count ?? ""));
    }

    return fallback;
  };

  const formatPrice = (price: number): string => {
    const nfLocale = locale === "kk" ? "kk-KZ" : "ru-RU";
    return new Intl.NumberFormat(nfLocale, {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Локализуем заголовок/категорию/описание по id, если есть ключи
  const titleKey = `science.research.${research.id}.title` as const;
  const categoryKey = `science.research.${research.id}.category` as const;
  const descriptionKey = `science.research.${research.id}.description` as const;
  const localizedTitle = translateSafely(titleKey, research.title);
  const localizedCategory = translateSafely(categoryKey, research.category);
  const localizedDescription = translateSafely(descriptionKey, research.description);
  const finalTitle = localizedTitle !== titleKey ? localizedTitle : research.title;
  const finalCategory =
    localizedCategory !== categoryKey ? localizedCategory : research.category;
  const finalDescription =
    localizedDescription !== descriptionKey
      ? localizedDescription
      : research.description;

  const handlePurchase = () => {
    onPurchase?.(research);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Заголовок карточки */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CategoryIcon className="w-3 h-3" />
            {finalCategory}
          </Badge>
        </div>
        {research.isPremium && (
          <Badge
            variant="default"
            className="flex items-center gap-1 bg-orange-100 text-orange-800 border-orange-200"
          >
            <Star className="w-3 h-3" />
            {translateSafely("science.catalog.premium", "Премиум доступ")}
          </Badge>
        )}
      </div>

      {/* Цена и количество страниц */}
      <div className="mb-3">
        <div className="text-2xl font-semibold text-green-600 mb-1">
          {formatPrice(research.price)}
        </div>
        <div className="text-sm text-gray-500">
          {research.pages}{" "}
          {translateSafely("science.catalog.pages", "стр.", {
            count: research.pages,
          })}
        </div>
      </div>

      {/* Заголовок исследования */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
        {finalTitle}
      </h3>

      {/* Описание */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {finalDescription}
      </p>

      {/* Дата публикации */}
      <div className="text-sm text-gray-500 mb-4">
        {translateSafely("science.catalog.published", "Опубликовано")}:{" "}
        {research.publishedAt}
      </div>

      {/* Статус покупки */}
      {research.requiresPurchases && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Lock className="w-4 h-4" />
          {translateSafely(
            "science.catalog.requiresPurchase",
            "Доступно после покупки",
          )}
        </div>
      )}

      {/* Кнопка покупки */}
      <Button
        onClick={handlePurchase}
        className="w-full flex items-center justify-center gap-2"
        disabled={!research.requiresPurchases}
      >
        <Lock className="w-4 h-4" />
        {translateSafely("science.catalog.buyFor", "Купить за {price}", {
          price: formatPrice(research.price),
        })}
      </Button>
    </div>
  );
};
