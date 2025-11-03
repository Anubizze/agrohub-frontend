import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Package,
  Sprout,
  Syringe,
} from "lucide-react";
import React from "react";

import { Badge } from "@/shared/components/ui";

import type { KeyStat } from "../../../schemas/recommendation.schema";
import { useTranslations } from "next-intl";

/**
 * Пропсы для компонента KeyStatsCard
 */
export interface KeyStatsCardProps {
  /** Статистика для отображения */
  stat: KeyStat;
  /** Дополнительные CSS классы */
  className?: string;
  /** Порядковый номер карточки в списке для выбора иконки */
  index?: number;
}

/**
 * Компонент карточки ключевой статистики
 *
 * @param props - Пропсы компонента
 * @param props.stat - Объект со статистикой
 * @param props.className - Дополнительные CSS классы
 * @returns JSX элемент карточки статистики
 * @example
 * ```typescript
 * <KeyStatsCard
 *   stat={{ title: "Всего животных", value: "248 500", badge: "2,5%" }}
 * />
 * ```
 */
export const KeyStatsCard: React.FC<KeyStatsCardProps> = ({
  stat,
  className,
  index = 0,
}) => {
  const t = useTranslations();
  // Нейтральная тема карточки (сдержанная палитра)
  const theme = {
    border: "border-gray-200",
    bg: "bg-white",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    value: "text-gray-900",
    title: "text-gray-700",
  } as const;

  // Иконки по индексу — не зависят от языка
  const icons: React.ReactNode[] = [
    <BarChart3 className="w-4 h-4" strokeWidth={2} />, // total animals
    <Syringe className="w-4 h-4" strokeWidth={2} />, // vaccinated
    <Package className="w-4 h-4" strokeWidth={2} />, // export
    <Sprout className="w-4 h-4" strokeWidth={2} />, // sown area
  ];
  const fixedIcon = icons[index] ?? (
    <BarChart3 className="w-4 h-4" strokeWidth={2} />
  );
  let iconContainerClasses = "bg-gray-100 border-gray-200";
  let iconColorClass = "text-gray-600";
  let valueColorClass = `${theme.value}`;

  switch (index) {
    case 0:
      iconContainerClasses = "bg-indigo-50 border-indigo-200";
      iconColorClass = "text-indigo-700";
      valueColorClass = "text-indigo-800";
      break;
    case 1:
      iconContainerClasses = "bg-teal-50 border-teal-200";
      iconColorClass = "text-teal-700";
      valueColorClass = "text-teal-800";
      break;
    case 2:
      iconContainerClasses = "bg-stone-50 border-stone-200";
      iconColorClass = "text-stone-700";
      valueColorClass = "text-stone-800";
      break;
    case 3:
      iconContainerClasses = "bg-emerald-50 border-emerald-200";
      iconColorClass = "text-emerald-700";
      valueColorClass = "text-emerald-800";
      break;
    default:
      break;
  }

  // Определение направления изменения по бейджу
  const rawBadge = String(stat.badge ?? "").trim();
  const isDown = /^[-–—]/.test(rawBadge) || /-\s*\d/.test(rawBadge);
  const isUp = !isDown && /[+]/.test(rawBadge);
  const badgeColor = isUp
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isDown
    ? "bg-red-50 text-red-700 border-red-200"
    : theme.badge;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border ${theme.border} 
        ${theme.bg} p-6 transition-all duration-200 
        hover:shadow-md hover:-translate-y-0.5 cursor-pointer
        ${className || ""}
      `}
    >
      {/* Фиксированная пиктограмма Lucide */}
      <div className="mb-3">
        <div
          className={`w-8 h-8 rounded-md ${iconContainerClasses} flex items-center justify-center border`}
        >
          <div className={iconColorClass}>{fixedIcon}</div>
        </div>
      </div>

      {/* Заголовок */}
      <h3 className={`text-sm font-medium ${theme.title} mb-2`}>
        {stat.title}
      </h3>

      {/* Основное значение */}
      <div className="flex items-end justify-between mb-3">
        <p className={`text-3xl font-bold ${valueColorClass}`}>{stat.value}</p>
      </div>

      {/* Бейдж с изменением */}
      <div className="flex items-center justify-between">
        <Badge
          className={`
            ${badgeColor} px-2.5 py-0.5 text-xs font-medium 
            border shadow-sm
          `}
        >
          {stat.badge}
        </Badge>

        {/* Индикатор изменения с направлением */}
        <div className="flex items-center space-x-1 text-xs">
          {isUp && (
            <ArrowUpRight
              className="w-3.5 h-3.5 text-emerald-600"
              strokeWidth={2}
            />
          )}
          {isDown && (
            <ArrowDownRight
              className="w-3.5 h-3.5 text-red-600"
              strokeWidth={2}
            />
          )}
          {!isUp && !isDown && (
            <BarChart3 className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
          )}
          <span
            className={
              isUp
                ? "text-emerald-700"
                : isDown
                ? "text-red-700"
                : "text-gray-500"
            }
          >
            {isUp
              ? t("science.keyStats.change.up")
              : isDown
              ? t("science.keyStats.change.down")
              : t("science.keyStats.change.neutral")}
          </span>
        </div>
      </div>
    </div>
  );
};
