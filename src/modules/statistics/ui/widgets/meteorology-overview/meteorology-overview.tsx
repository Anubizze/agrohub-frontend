"use client";

import { useLocale } from "next-intl";
import { CloudRain, Thermometer, type LucideIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useUrlFilter } from "@/shared/hooks/use-url-filter";
import { cn } from "@/shared/lib/utils";

export interface MeteorologyOverviewLabels {
  temperature: string;
  precipitation: string;
  airHumidity: string;
  soilMoisture: string;
  cloudiness: string;
  pressure: string;
  windSpeed: string;
  visibility: string;
  windDirection: string;
  weatherPhenomenon: string;
  optimal: string;
  lastYear: string;
}

export interface MeteorologyOverviewUnits {
  temperature: string;
  precipitation: string;
  humidity: string;
  pressure?: string;
  windSpeed?: string;
  visibility?: string;
}

export interface MeteorologyOverviewRanges {
  airHumidity: {
    min: number;
    max: number;
  };
  soilMoisture: {
    min: number;
    max: number;
  };
}

export interface MeteorologyOverviewAnalysis {
  title: string;
  summary: string;
  rangeSummary: string;
  optimal: {
    higher: string;
    lower: string;
    equal: string;
  };
  trend: {
    up: string;
    down: string;
    equal: string;
  };
  range: {
    above: string;
    below: string;
    inside: string;
  };
}

export interface MeteorologyRegionMetric {
  value: number;
  optimal: number;
  lastYear: number;
}

export interface MeteorologyRegionSeriesPoint {
  period: string;
  value: number;
  optimal?: number;
  lastYear?: number;
}

export interface MeteorologyRegionDirectionalPoint extends MeteorologyRegionSeriesPoint {
  label: string;
}

export interface MeteorologyRegionTimelinePoint {
  period: string;
  label: string;
}

export interface MeteorologyRegionMonthlySummary {
  temperature: MeteorologyRegionMetric;
  precipitation: MeteorologyRegionMetric;
  airHumidity: number;
  soilMoisture: number;
  cloudiness: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
}

export interface MeteorologyRegionData {
  name: string;
  temperature: MeteorologyRegionMetric;
  precipitation: MeteorologyRegionMetric;
  airHumidity: number;
  soilMoisture: number;
  temperatureSeries: MeteorologyRegionSeriesPoint[];
  precipitationSeries: MeteorologyRegionSeriesPoint[];
  airHumiditySeries: MeteorologyRegionSeriesPoint[];
  soilMoistureSeries: MeteorologyRegionSeriesPoint[];
  monthKeys: string[];
  monthlySummaries: Record<string, MeteorologyRegionMonthlySummary>;
}

export interface MeteorologyHourlyMetricSeries {
  temperature: MeteorologyRegionSeriesPoint[];
  precipitation: MeteorologyRegionSeriesPoint[];
  airHumidity: MeteorologyRegionSeriesPoint[];
  soilMoisture: MeteorologyRegionSeriesPoint[];
  cloudiness: MeteorologyRegionSeriesPoint[];
  pressure: MeteorologyRegionSeriesPoint[];
  windSpeed: MeteorologyRegionSeriesPoint[];
  visibility: MeteorologyRegionSeriesPoint[];
  windDirection: MeteorologyRegionDirectionalPoint[];
  weatherPhenomenon: MeteorologyRegionTimelinePoint[];
}

export interface MeteorologyOverviewDataset {
  regions: MeteorologyRegionData[];
  hourlySeries: Record<string, Record<string, Record<string, MeteorologyHourlyMetricSeries>>>;
}

export interface MeteorologyOverviewYearOption {
  value: string;
  label: string;
}

export interface MeteorologyOverviewProps {
  title: string;
  subtitle: string;
  labels: MeteorologyOverviewLabels;
  units: MeteorologyOverviewUnits;
  ranges: MeteorologyOverviewRanges;
  analysis: MeteorologyOverviewAnalysis;
  datasets: Record<string, MeteorologyOverviewDataset>;
  yearOptions: MeteorologyOverviewYearOption[];
  defaultYear: string;
}

const formatNumber = (value: number) => {
  const hasDecimal = Math.abs(value - Math.round(value)) > 0.01;

  return hasDecimal ? value.toFixed(1) : value.toString();
};

const interpolate = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");

const DIFFERENCE_TOLERANCE = 0.1;
const DEFAULT_RANGE_VALUE = "all";
const DEFAULT_MONTH_VALUE = "all";
const HOURLY_TICKS = ["02:00", "05:00", "08:00", "11:00", "14:00", "17:00", "20:00", "23:00"];
const DEFAULT_METRIC: MeteorologyRegionMetric = { value: 0, optimal: 0, lastYear: 0 };

const getRangeCount = (range: string) => {
  const match = /^(\d+)/.exec(range);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1], 10);
};

const sortSeries = (series: MeteorologyRegionSeriesPoint[]) =>
  [...series].sort((a, b) => (a.period > b.period ? 1 : a.period < b.period ? -1 : 0));

const applySeriesFilters = (
  series: MeteorologyRegionSeriesPoint[],
  range: string,
  month: string,
) => {
  const sorted = sortSeries(series);
  const count = getRangeCount(range);
  const ranged = count ? sorted.slice(-count) : sorted;

  if (month === DEFAULT_MONTH_VALUE) {
    return ranged;
  }

  return ranged.filter((point) => point.period === month);
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatPeriodLabel = (period: string, locale: string, style: "short" | "long") => {
  try {
    const date = new Date(`${period}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return period;
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      month: style === "short" ? "short" : "long",
      year: "numeric",
    });
    const formatted = formatter.format(date);

    return capitalize(formatted);
  } catch (error) {
    console.error("Failed to format period label", error);
    return period;
  }
};

const formatDayLabel = (day: string, locale: string) => {
  try {
    const date = new Date(`${day}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return day;
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
    });

    const formatted = formatter.format(date);
    return capitalize(formatted);
  } catch (error) {
    console.error("Failed to format day label", error);
    return day;
  }
};

interface ControlsDictionary {
  rangeLabel: string;
  yearLabel: string;
  monthLabel: string;
  monthAll: string;
  dayLabel: string;
  recommendedRangeLabel: string;
  rangeOptions: {
    "3m": string;
    "6m": string;
    "12m"?: string;
    all: string;
  };
}

const buildControlsDictionary = (locale: string): ControlsDictionary => {
  if (locale.startsWith("kk")) {
    return {
      rangeLabel: "Диапазон",
      yearLabel: "Жылды таңдаңыз",
      monthLabel: "Ай",
      monthAll: "Барлық айлар",
      dayLabel: "Күн",
      recommendedRangeLabel: "Ұсынылатын диапазон",
      rangeOptions: {
        "3m": "Соңғы 3 ай",
        "6m": "Соңғы 6 ай",
        "12m": "Соңғы 12 ай",
        all: "Толық кезең",
      },
    };
  }

  if (locale.startsWith("en")) {
    return {
      rangeLabel: "Range",
      yearLabel: "Select year",
      monthLabel: "Month",
      monthAll: "All months",
      dayLabel: "Day",
      recommendedRangeLabel: "Recommended range",
      rangeOptions: {
        "3m": "Last 3 months",
        "6m": "Last 6 months",
        "12m": "Last 12 months",
        all: "Full period",
      },
    };
  }

  return {
    rangeLabel: "Диапазон",
    yearLabel: "Выберите год",
    monthLabel: "Месяц",
    monthAll: "Все месяцы",
    dayLabel: "День",
    recommendedRangeLabel: "Рекомендованный диапазон",
    rangeOptions: {
      "3m": "Последние 3 месяца",
      "6m": "Последние 6 месяцев",
        "12m": "Последние 12 месяцев",
      all: "Весь период",
    },
  };
};

const buildMetricSummary = (
  label: string,
  metric: MeteorologyRegionMetric,
  unit: string,
  analysis: MeteorologyOverviewAnalysis,
) => {
  const optimalDiff = metric.value - metric.optimal;
  const trendDiff = metric.value - metric.lastYear;

  const optimalKey =
    Math.abs(optimalDiff) <= DIFFERENCE_TOLERANCE
      ? "equal"
      : optimalDiff > 0
      ? "higher"
      : "lower";

  const trendKey =
    Math.abs(trendDiff) <= DIFFERENCE_TOLERANCE
      ? "equal"
      : trendDiff > 0
      ? "up"
      : "down";

  const optimalComparison = interpolate(analysis.optimal[optimalKey], {
    difference: formatNumber(Math.abs(optimalDiff)),
    unit,
  });

  const trendComparison = interpolate(analysis.trend[trendKey], {
    difference: formatNumber(Math.abs(trendDiff)),
    unit,
  });

  return interpolate(analysis.summary, {
    metric: label,
    value: formatNumber(metric.value),
    unit,
    optimal: optimalComparison,
    trend: trendComparison,
  });
};

const buildRangeSummary = (
  label: string,
  value: number,
  unit: string,
  range: { min: number; max: number },
  analysis: MeteorologyOverviewAnalysis,
) => {
  let key: keyof MeteorologyOverviewAnalysis["range"] = "inside";

  if (value < range.min) {
    key = "below";
  } else if (value > range.max) {
    key = "above";
  }

  const rangeMessage = interpolate(analysis.range[key], {
    min: formatNumber(range.min),
    max: formatNumber(range.max),
    unit,
  });

  return interpolate(analysis.rangeSummary, {
    metric: label,
    value: formatNumber(value),
    unit,
    range: rangeMessage,
  });
};

const formatDifferenceForButton = (value: number, optimal: number) => {
  const diff = value - optimal;
  if (Math.abs(diff) <= DIFFERENCE_TOLERANCE) {
    return null;
  }

  const sign = diff > 0 ? "+" : "-";
  return `${sign}${formatNumber(Math.abs(diff))}`;
};

export const MeteorologyOverview = memo(
  ({
    title,
    subtitle,
    labels,
    units,
    ranges,
    analysis,
    datasets,
    yearOptions,
    defaultYear,
  }: MeteorologyOverviewProps) => {
    const locale = useLocale();
    const controlLabels = useMemo(() => buildControlsDictionary(locale), [locale]);
    const normalizedYearOptions = useMemo(() => {
      const validOptions = yearOptions.filter((option) => Boolean(datasets[option.value]));

      if (validOptions.length) {
        return validOptions;
      }

      const datasetYears = Object.keys(datasets);

      if (!datasetYears.length) {
        return [];
      }

      return datasetYears
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({
          value,
          label: value,
        }));
    }, [datasets, yearOptions]);
    const fallbackYearOption =
      normalizedYearOptions.find((option) => option.value === defaultYear) ??
      normalizedYearOptions.at(-1) ??
      normalizedYearOptions[0] ??
      null;
    const fallbackYearValue = fallbackYearOption?.value ?? defaultYear;
    const filterDefaults = useMemo(
      () => ({
        metRange: DEFAULT_RANGE_VALUE,
        metYear: fallbackYearValue,
      }),
      [fallbackYearValue],
    );
    const {
      selectedMetYear,
      selectedMetRange,
      selectedMetMonth,
      selectedMetDay,
      setParam,
      setMany,
    } = useUrlFilter(["metYear", "metRange", "metMonth", "metDay"], {
      defaults: filterDefaults,
      resetPageOnChange: false,
      normalize: (value) => {
        if (value == null) return undefined;
        const normalized = `${value}`.trim();
        return normalized === "" ? undefined : normalized;
      },
    });
    const availableYearValues = useMemo(
      () => normalizedYearOptions.map((option) => option.value),
      [normalizedYearOptions],
    );
    const selectedYear =
      selectedMetYear && availableYearValues.includes(selectedMetYear)
        ? selectedMetYear
        : fallbackYearValue;

    useEffect(() => {
      if (!fallbackYearValue) {
        return;
      }

      if (!selectedMetYear) {
        setParam("metYear", fallbackYearValue);
        return;
      }

      if (!availableYearValues.includes(selectedMetYear)) {
        setParam("metYear", fallbackYearValue);
      }
    }, [availableYearValues, fallbackYearValue, selectedMetYear, setParam]);

    const datasetForYear = datasets[selectedYear] ?? {
      regions: [],
      hourlySeries: {},
    };
    const regions = datasetForYear.regions;
    const hourlySeries = datasetForYear.hourlySeries;
    const [activeRegionIndex, setActiveRegionIndex] = useState(0);
    const activeRegion = regions[activeRegionIndex];
    const rangeValue = selectedMetRange ?? DEFAULT_RANGE_VALUE;

    useEffect(() => {
      setActiveRegionIndex(0);
    }, [selectedYear]);

    useEffect(() => {
      if (!regions.length) {
        if (activeRegionIndex !== 0) {
          setActiveRegionIndex(0);
        }
        return;
      }

      if (activeRegionIndex >= regions.length) {
        setActiveRegionIndex(0);
      }
    }, [activeRegionIndex, regions.length]);

    const handleRangeChange = useCallback(
      (value: string) => {
        setParam("metRange", value);
      },
      [setParam],
    );

    const handleYearChange = useCallback(
      (value: string) => {
        if (value === selectedYear) {
          return;
        }

        setActiveRegionIndex(0);
        setMany({
          metYear: value,
          metMonth: null,
          metDay: null,
        });
      },
      [selectedYear, setMany],
    );

    const handleMonthChange = useCallback(
      (value: string) => {
        if (!activeRegion) {
          setMany({ metMonth: value, metDay: null });
          return;
        }

        const regionSeries = hourlySeries[activeRegion.name];
        const days = regionSeries?.[value] ? Object.keys(regionSeries[value]).sort() : [];

        setMany({
          metMonth: value,
          metDay: days.at(-1) ?? null,
        });
      },
      [activeRegion, hourlySeries, setMany],
    );

    const handleDayChange = useCallback(
      (value: string) => {
        setParam("metDay", value);
      },
      [setParam],
    );

    const filteredMonths = useMemo(() => {
      if (!activeRegion) {
        return [];
      }

      const months = [...activeRegion.monthKeys];
      const count = getRangeCount(rangeValue);

      if (count && months.length > count) {
        return months.slice(-count);
      }

      return months;
    }, [activeRegion, rangeValue]);

    const fallbackMonth = filteredMonths.at(-1) ?? "";
    const monthValue =
      selectedMetMonth && filteredMonths.includes(selectedMetMonth)
        ? selectedMetMonth
        : fallbackMonth;

    useEffect(() => {
      if (!activeRegion) {
        return;
      }

      if (!filteredMonths.length) {
        return;
      }

      if (
        !selectedMetMonth ||
        selectedMetMonth === DEFAULT_MONTH_VALUE ||
        !filteredMonths.includes(selectedMetMonth)
      ) {
        const target = filteredMonths.at(-1);
        if (target) {
          setParam("metMonth", target);
        }
      }
    }, [activeRegion, filteredMonths, selectedMetMonth, setParam]);

    const availableDays = useMemo(() => {
      if (!activeRegion || !monthValue) {
        return [];
      }

      const regionSeries = hourlySeries[activeRegion.name];
      if (!regionSeries) {
        return [];
      }

      const monthSeries = regionSeries[monthValue];
      if (!monthSeries) {
        return [];
      }

      return Object.keys(monthSeries).sort();
    }, [activeRegion, hourlySeries, monthValue]);

    useEffect(() => {
      if (!activeRegion) {
        return;
      }

      if (!monthValue) {
        if (selectedMetDay) {
          setParam("metDay", null);
        }
        return;
      }

      if (!availableDays.length) {
        if (selectedMetDay) {
          setParam("metDay", null);
        }
        return;
      }

      if (!selectedMetDay || !availableDays.includes(selectedMetDay)) {
        const target = availableDays.at(-1);
        if (target) {
          setParam("metDay", target);
        }
      }
    }, [activeRegion, monthValue, availableDays, selectedMetDay, setParam]);

    const dayValue =
      selectedMetDay && availableDays.includes(selectedMetDay)
        ? selectedMetDay
        : availableDays.at(-1) ?? "";

    const monthOptions = useMemo(
      () =>
        filteredMonths.map((period) => ({
          value: period,
          label: formatPeriodLabel(period, locale, "long"),
        })),
      [filteredMonths, locale],
    );

    const dayOptions = useMemo(
      () =>
        availableDays.map((day) => ({
          value: day,
          label: formatDayLabel(day, locale),
        })),
      [availableDays, locale],
    );
    const formattedMonthLabel = monthValue ? formatPeriodLabel(monthValue, locale, "long") : "";
    const monthLabelForTitle = formattedMonthLabel || monthValue;

    const rangeOptions = useMemo(() => {
      const options = [
        { value: "3m", label: controlLabels.rangeOptions["3m"] },
        { value: "6m", label: controlLabels.rangeOptions["6m"] },
      ];

      if (controlLabels.rangeOptions["12m"]) {
        options.push({ value: "12m", label: controlLabels.rangeOptions["12m"] });
      }

      options.push({ value: "all", label: controlLabels.rangeOptions.all });

      return options;
    }, [controlLabels]);

    const monthFilterValue = monthValue || DEFAULT_MONTH_VALUE;

    const temperatureChartData = useMemo(
      () =>
        activeRegion
          ? applySeriesFilters(activeRegion.temperatureSeries, rangeValue, monthFilterValue)
          : [],
      [activeRegion, rangeValue, monthFilterValue],
    );
    const precipitationChartData = useMemo(
      () =>
        activeRegion
          ? applySeriesFilters(activeRegion.precipitationSeries, rangeValue, monthFilterValue)
          : [],
      [activeRegion, rangeValue, monthFilterValue],
      );
    const airHumidityChartData = useMemo(
      () =>
        activeRegion
          ? applySeriesFilters(activeRegion.airHumiditySeries, rangeValue, monthFilterValue)
          : [],
      [activeRegion, rangeValue, monthFilterValue],
    );
    const soilMoistureChartData = useMemo(
      () =>
        activeRegion
          ? applySeriesFilters(activeRegion.soilMoistureSeries, rangeValue, monthFilterValue)
          : [],
      [activeRegion, rangeValue, monthFilterValue],
    );

    const selectedHourlySeries = useMemo(() => {
      if (!activeRegion || !monthValue || !dayValue) {
        return null;
      }

      const regionSeries = hourlySeries[activeRegion.name];
      if (!regionSeries) {
        return null;
      }

      const monthSeries = regionSeries[monthValue];
      if (!monthSeries) {
        return null;
      }

      return monthSeries[dayValue] ?? null;
    }, [activeRegion, dayValue, hourlySeries, monthValue]);

    const formatPeriod = useCallback(
      (period: string, style: "short" | "long" = "short") => formatPeriodLabel(period, locale, style),
      [locale],
    );

    const temperatureChartConfig = useMemo<ChartConfig>(
      () => ({
        value: { label: `${labels.temperature} (${units.temperature})`, color: "#de4c4c" },
      }),
      [labels.temperature, units.temperature],
    );

    const precipitationChartConfig = useMemo<ChartConfig>(
      () => ({
        value: { label: `${labels.precipitation} (${units.precipitation})`, color: "#375e95" },
      }),
      [labels.precipitation, units.precipitation],
    );

    const airHumidityChartConfig = useMemo<ChartConfig>(
      () => ({
        value: { label: `${labels.airHumidity} (${units.humidity})`, color: "#059669" },
      }),
      [labels.airHumidity, units.humidity],
    );

    const soilMoistureChartConfig = useMemo<ChartConfig>(
      () => ({
        value: { label: `${labels.soilMoisture} (${units.humidity})`, color: "#7c3aed" },
      }),
      [labels.soilMoisture, units.humidity],
      );

    const effectiveMonthSummary = useMemo(() => {
      if (!activeRegion) {
        return null;
      }

      const summary = monthValue ? activeRegion.monthlySummaries[monthValue] : null;
      if (summary) {
        return summary;
      }

      const fallbackKey = activeRegion.monthKeys.at(-1);
      return fallbackKey ? activeRegion.monthlySummaries[fallbackKey] : null;
    }, [activeRegion, monthValue]);

    const analysisItems = useMemo(() => {
      if (!activeRegion || !effectiveMonthSummary) {
        return [];
      }

      return [
        buildMetricSummary(labels.temperature, effectiveMonthSummary.temperature, units.temperature, analysis),
        buildMetricSummary(
          labels.precipitation,
          effectiveMonthSummary.precipitation,
          units.precipitation,
          analysis,
        ),
        buildRangeSummary(
          labels.airHumidity,
          effectiveMonthSummary.airHumidity,
          units.humidity,
          ranges.airHumidity,
          analysis,
        ),
        buildRangeSummary(
          labels.soilMoisture,
          effectiveMonthSummary.soilMoisture,
          units.humidity,
          ranges.soilMoisture,
          analysis,
        ),
      ];
    }, [
      activeRegion,
      analysis,
      effectiveMonthSummary,
      labels.airHumidity,
      labels.precipitation,
      labels.soilMoisture,
      labels.temperature,
      ranges.airHumidity,
      ranges.soilMoisture,
      units.humidity,
      units.precipitation,
      units.temperature,
    ]);

    const temperatureMetric =
      effectiveMonthSummary?.temperature ?? activeRegion?.temperature ?? DEFAULT_METRIC;
    const precipitationMetric =
      effectiveMonthSummary?.precipitation ?? activeRegion?.precipitation ?? DEFAULT_METRIC;
    const airHumidityValue =
      effectiveMonthSummary?.airHumidity ?? activeRegion?.airHumidity ?? 0;
    const soilMoistureValue =
      effectiveMonthSummary?.soilMoisture ?? activeRegion?.soilMoisture ?? 0;
    const cloudinessValue = effectiveMonthSummary?.cloudiness ?? 0;
    const pressureValue = effectiveMonthSummary?.pressure ?? 0;
    const windSpeedValue = effectiveMonthSummary?.windSpeed ?? 0;
    const visibilityValue = effectiveMonthSummary?.visibility ?? 0;

    if (!regions.length) {
      return null;
    }

    return (
      <section className="flex flex-col gap-6">
        <header className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f2a37] md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-base text-[#4b5563]">{subtitle}</p>
          </div>
          {normalizedYearOptions.length ? (
            <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                {controlLabels.yearLabel}
              </span>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[220px]" aria-label={controlLabels.yearLabel}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {normalizedYearOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </header>

        <div className="flex flex-wrap gap-2">
          {regions.map((region, index) => {
            const diffBadge = formatDifferenceForButton(region.temperature.value, region.temperature.optimal);

            return (
              <button
                key={region.name}
                type="button"
                onClick={() => setActiveRegionIndex(index)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition", 
                  index === activeRegionIndex
                    ? "border-[#486284] bg-[#486284] text-white shadow"
                    : "border-slate-200 bg-white text-[#486284] hover:border-[#486284] hover:text-[#486284]",
                )}
                aria-pressed={index === activeRegionIndex}
              >
                <span>{region.name}</span>
                {diffBadge ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                    {diffBadge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeRegion ? (
          <article className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-[#1f2a37] md:text-2xl">
                {activeRegion.name}
              </h2>
              <p className="text-sm text-[#64748b]">
                {labels.temperature}: {formatNumber(temperatureMetric.value)}
                {units.temperature} · {labels.precipitation}: {formatNumber(precipitationMetric.value)}
                {units.precipitation}
              </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title={labels.temperature}
                metric={temperatureMetric}
                unit={units.temperature}
                labels={labels}
                Icon={Thermometer}
                accentColor="#de4c4c"
              />
              <MetricCard
                title={labels.precipitation}
                metric={precipitationMetric}
                unit={units.precipitation}
                labels={labels}
                Icon={CloudRain}
                accentColor="#375e95"
              />
            </section>

            <div className="grid gap-2 text-sm text-[#4b5563] md:grid-cols-3">
              <SimpleMetric
                label={labels.airHumidity}
                value={airHumidityValue}
                unit={units.humidity}
                range={ranges.airHumidity}
              />
              <SimpleMetric
                label={labels.soilMoisture}
                value={soilMoistureValue}
                unit={units.humidity}
                range={ranges.soilMoisture}
              />
              <SimpleValueMetric
                label={labels.cloudiness}
                value={cloudinessValue}
                unit="%"
              />
              <SimpleValueMetric
                label={labels.pressure}
                value={pressureValue}
                unit={units.pressure ?? "мм рт. ст."}
              />
              <SimpleValueMetric
                label={labels.windSpeed}
                value={windSpeedValue}
                unit={units.windSpeed ?? "м/с"}
              />
              <SimpleValueMetric
                label={labels.visibility}
                value={visibilityValue}
                unit={units.visibility ?? "км"}
              />
            </div>

            {dayOptions.length ? (
              <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#1f2a37]">{controlLabels.rangeLabel}</span>
                    <Select value={rangeValue} onValueChange={handleRangeChange}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rangeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {monthOptions.length ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-[#1f2a37]">{controlLabels.monthLabel}</span>
                      <Select value={monthValue} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-[220px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#1f2a37]">{controlLabels.dayLabel}</span>
                    <Select value={dayValue} onValueChange={handleDayChange}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#f1f5f9] p-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-[#1f2a37]">
                  Почасовой мониторинг показателей
                </h3>
                <p className="text-sm text-[#4b5563]">
                  {dayValue
                    ? "Почасовая динамика выбранного дня."
                    : "Выберите месяц и день, чтобы увидеть динамику в разбивке по часам."}
                </p>
              </div>
              {selectedHourlySeries ? (
                <div className="flex flex-col gap-6">
                  <div className="grid gap-4 md:grid-cols-2">
                  <HourlyMetricChart
                    title={`${labels.temperature} (${monthLabelForTitle})`}
                    testId="hourly-temperature-chart"
                    data={selectedHourlySeries.temperature}
                    unit={units.temperature}
                    color="#de4c4c"
                    formatPeriod={formatPeriod}
                  />
                  <HourlyMetricChart
                    title={`${labels.precipitation} (${monthLabelForTitle})`}
                    testId="hourly-precipitation-chart"
                    data={selectedHourlySeries.precipitation}
                    unit={units.precipitation}
                    color="#2563eb"
                    formatPeriod={formatPeriod}
                  />
                  <HourlyMetricChart
                    title={`${labels.airHumidity} (${monthLabelForTitle})`}
                    testId="hourly-air-humidity-chart"
                    data={selectedHourlySeries.airHumidity}
                    unit={units.humidity}
                    color="#059669"
                    formatPeriod={formatPeriod}
                      yDomain={[0, 100]}
                  />
                  <HourlyMetricChart
                    title={`${labels.soilMoisture} (${monthLabelForTitle})`}
                    testId="hourly-soil-moisture-chart"
                    data={selectedHourlySeries.soilMoisture}
                    unit={units.humidity}
                    color="#7c3aed"
                    formatPeriod={formatPeriod}
                  />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <HourlyMetricChart
                      title={`${labels.cloudiness} (${monthLabelForTitle})`}
                      testId="hourly-cloudiness-chart"
                      data={selectedHourlySeries.cloudiness}
                      unit="%"
                      color="#0ea5e9"
                      formatPeriod={formatPeriod}
                      yDomain={[0, 100]}
                    />
                    <HourlyMetricChart
                      title={`${labels.pressure} (${monthLabelForTitle})`}
                      testId="hourly-pressure-chart"
                      data={selectedHourlySeries.pressure}
                      unit="мм рт. ст."
                      color="#1e40af"
                      formatPeriod={formatPeriod}
                    />
                    <HourlyMetricChart
                      title={`${labels.windSpeed} (${monthLabelForTitle})`}
                      testId="hourly-wind-speed-chart"
                      data={selectedHourlySeries.windSpeed}
                      unit="м/с"
                      color="#0f766e"
                      formatPeriod={formatPeriod}
                      yDomain={[0, 15]}
                    />
                    <HourlyMetricChart
                      title={`${labels.visibility} (${monthLabelForTitle})`}
                      testId="hourly-visibility-chart"
                      data={selectedHourlySeries.visibility}
                      unit="км"
                      color="#9333ea"
                      formatPeriod={formatPeriod}
                      yDomain={[0, 15]}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <HourlyDirectionChart
                      title={`${labels.windDirection} (${monthLabelForTitle})`}
                      testId="hourly-wind-direction-chart"
                      data={selectedHourlySeries.windDirection}
                      color="#0369a1"
                    />
                    <HourlyPhenomenonTimeline
                      title={`${labels.weatherPhenomenon} (${monthLabelForTitle})`}
                      testId="hourly-phenomena-timeline"
                      data={selectedHourlySeries.weatherPhenomenon}
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-[#1f2a37]">{analysis.title}</h3>
              <ul className="space-y-2 text-sm text-[#4b5563]">
                {analysisItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </article>
        ) : null}
      </section>
    );
  },
);

MeteorologyOverview.displayName = "MeteorologyOverview";

interface MetricCardProps {
  title: string;
  metric: MeteorologyRegionMetric;
  unit: string;
  labels: Pick<MeteorologyOverviewLabels, "optimal" | "lastYear">;
  Icon: LucideIcon;
  accentColor: string;
}

const MetricCard = ({ title, metric, unit, labels, Icon, accentColor }: MetricCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accentColor}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </span>
        <h3 className="text-sm font-semibold text-[#1f2a37]">{title}</h3>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#1f2a37]">
        {metric.value}
        <span className="ml-1 text-base font-normal text-[#6b7280]">{unit}</span>
      </p>
      <p className="mt-3 text-sm text-[#4b5563]">
        <span className="font-medium text-[#1f2a37]">{labels.optimal}</span>: {metric.optimal}
        <span className="ml-1 text-xs text-[#94a3b8]">{unit}</span>
        <span className="mx-2 text-[#cbd5f5]">|</span>
        <span className="font-medium text-[#1f2a37]">{labels.lastYear}</span>: {metric.lastYear}
        <span className="ml-1 text-xs text-[#94a3b8]">{unit}</span>
      </p>
    </div>
  );
};

interface SimpleMetricProps {
  label: string;
  value: number;
  unit: string;
  range: { min: number; max: number };
}

const SimpleMetric = ({ label, value, unit, range }: SimpleMetricProps) => {
  const status = value < range.min ? "text-amber-600" : value > range.max ? "text-red-600" : "text-emerald-600";

  return (
    <p className="text-sm text-[#4b5563]">
      <span className="font-medium text-[#1f2a37]">{label}</span>: {formatNumber(value)}
      <span className="ml-1 text-[#6b7280]">{unit}</span>
      <span className={cn("ml-2 text-xs font-semibold", status)}>
        ({range.min}-{range.max}
        {unit})
      </span>
    </p>
  );
};

interface SimpleValueMetricProps {
  label: string;
  value: number | null | undefined;
  unit: string;
}

const SimpleValueMetric = ({ label, value, unit }: SimpleValueMetricProps) => {
  return (
    <p className="text-sm text-[#4b5563]">
      <span className="font-medium text-[#1f2a37]">{label}</span>:{" "}
      {value != null ? formatNumber(value) : "—"}
      <span className="ml-1 text-[#6b7280]">{unit}</span>
    </p>
  );
};

interface MetricChartCardProps {
  title: string;
  testId: string;
  data: MeteorologyRegionSeriesPoint[];
  config: ChartConfig;
  bars: string[];
  formatPeriod: (period: string, style?: "short" | "long") => string;
  unit: string;
  referenceLine?: { value: number; label: string; color: string };
  secondaryReferenceLine?: { value: number; label: string; color: string };
  rangeHighlight?: { min: number; max: number; label: string; color: string };
}

const MetricChartCard = ({
  title,
  testId,
  data,
  config,
  bars,
  formatPeriod,
  unit,
  referenceLine,
  secondaryReferenceLine,
  rangeHighlight,
}: MetricChartCardProps) => {
  if (!data.length) {
    return (
      <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#f8fafc] p-6">
        <h3 className="text-sm font-semibold text-[#1f2a37]">{title}</h3>
        <p className="mt-4 text-sm text-[#94a3b8]">Нет данных для отображения</p>
      </article>
    );
  }

  const visibleBars = bars.filter((barKey) => {
    const key = barKey as keyof MeteorologyRegionSeriesPoint;
    return data.some((point) => typeof point[key] === "number");
  });

  if (!visibleBars.length) {
    return (
      <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#f8fafc] p-6">
        <h3 className="text-sm font-semibold text-[#1f2a37]">{title}</h3>
        <p className="mt-4 text-sm text-[#94a3b8]">Нет данных для отображения</p>
      </article>
    );
  }

  const mainKey = visibleBars[0];
  const gradientId = `chart-gradient-${testId}`;
  const mainConfig = config[mainKey];
  const mainLabel = typeof mainConfig?.label === "string" ? mainConfig.label : title;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-[#f8fafc] p-6">
      <h3 className="text-base font-semibold text-[#1f2a37]">{title}</h3>
      <ChartContainer
        config={config}
        data-region-count={data.length}
        data-testid={testId}
        className="mt-6 h-[320px] w-full rounded-xl border border-slate-100 bg-white"
        style={{ minWidth: 320, minHeight: 320 }}
      >
        <ComposedChart
          data={data}
          margin={{ top: 24, right: 24, left: 0, bottom: 16 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => (typeof value === "string" ? formatPeriod(value, "short") : value)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(72, 98, 132, 0.08)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => (typeof value === "string" ? formatPeriod(value, "long") : value)}
                formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, mainLabel]}
              />
            }
          />
          <ChartLegend
            verticalAlign="top"
            content={<ChartLegendContent />}
          />
          {rangeHighlight ? (
            <ReferenceArea
              y1={rangeHighlight.min}
              y2={rangeHighlight.max}
              fill={rangeHighlight.color}
              fillOpacity={0.08}
              label={{
                position: "insideRight",
                value: rangeHighlight.label,
                fill: rangeHighlight.color,
              }}
            />
          ) : null}
          {referenceLine ? (
            <ReferenceLine
              y={referenceLine.value}
              stroke={referenceLine.color}
              strokeDasharray="4 4"
              label={{
                value: `${referenceLine.label} · ${formatNumber(referenceLine.value)} ${unit}`,
                position: "right",
                fill: referenceLine.color,
              }}
            />
          ) : null}
          {secondaryReferenceLine ? (
            <ReferenceLine
              y={secondaryReferenceLine.value}
              stroke={secondaryReferenceLine.color}
              strokeDasharray="4 4"
              label={{
                value: `${secondaryReferenceLine.label} · ${formatNumber(secondaryReferenceLine.value)} ${unit}`,
                position: "right",
                fill: secondaryReferenceLine.color,
              }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey={mainKey}
            stroke={`var(--color-${mainKey})`}
            fill={`url(#${gradientId})`}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={mainLabel}
          />
        </ComposedChart>
      </ChartContainer>
    </article>
  );
};

interface HourlyMetricChartProps {
  title: string;
  testId: string;
  data: MeteorologyRegionSeriesPoint[];
  unit: string;
  color: string;
  formatPeriod: (period: string, style?: "short" | "long") => string;
  yDomain?: [number, number];
}

const HourlyMetricChart = ({ title, testId, data, unit, color, formatPeriod, yDomain }: HourlyMetricChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      value: { label: `${title}`, color },
    }),
    [color, title],
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-sm font-semibold text-[#1f2a37]">{title}</h4>
      <ChartContainer
        config={chartConfig}
        data-testid={testId}
        className="mt-4 h-[240px] w-full"
      >
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => (typeof value === "string" ? formatPeriod(value, "short") : value)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            domain={yDomain}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(72, 98, 132, 0.08)" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => value}
                formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, title]}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            name={title}
            stroke={color}
            fill={`${color}25`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ChartContainer>
    </article>
  );
};

interface HourlyDirectionChartProps {
  title: string;
  testId: string;
  data: MeteorologyRegionDirectionalPoint[];
  color: string;
}

const HourlyDirectionChart = ({ title, testId, data, color }: HourlyDirectionChartProps) => {
  const chartConfig = useMemo<ChartConfig>(
    () => ({
      value: { label: `${title}`, color },
    }),
    [color, title],
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-sm font-semibold text-[#1f2a37]">{title}</h4>
      <ChartContainer
        config={chartConfig}
        data-testid={testId}
        className="mt-4 h-[240px] w-full"
      >
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="period" ticks={HOURLY_TICKS} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, 360]}
            ticks={[0, 90, 180, 270, 360]}
            tickFormatter={(value) => `${value}°`}
          />
          <ChartTooltip
            cursor={{ fill: "rgba(72, 98, 132, 0.08)" }}
            content={
              <ChartTooltipContent
                formatter={(value, _name, payload) => [
                  `${formatNumber(Number(value))}° (${payload?.payload.label ?? ""})`,
                  title,
                ]}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ChartContainer>
    </article>
  );
};

interface HourlyPhenomenonTimelineProps {
  title: string;
  testId: string;
  data: MeteorologyRegionTimelinePoint[];
}

const HourlyPhenomenonTimeline = ({ title, testId, data }: HourlyPhenomenonTimelineProps) => {
  const grouped = useMemo(() => {
    if (!data.length) {
      return [];
    }

    const items: Array<{ start: string; end: string; label: string }> = [];
    let current = { start: data[0].period, end: data[0].period, label: data[0].label };

    for (let index = 1; index < data.length; index += 1) {
      const item = data[index];
      if (item.label === current.label) {
        current.end = item.period;
      } else {
        items.push(current);
        current = { start: item.period, end: item.period, label: item.label };
      }
    }
    items.push(current);

    return items;
  }, [data]);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <h4 className="text-sm font-semibold text-[#1f2a37]">{title}</h4>
      <div
        data-testid={testId}
        className="mt-4 flex flex-col gap-2 text-xs text-[#1f2937]"
      >
        {grouped.map((item) => (
          <div
            key={`${item.start}-${item.end}-${item.label}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#0f172a]">{item.label}</span>
              <span className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                {item.start} — {item.end}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="h-2 w-2 rounded-full bg-[#1d4ed8]" />
              почасовой диапазон
            </div>
          </div>
        ))}
      </div>
    </article>
  );
};

