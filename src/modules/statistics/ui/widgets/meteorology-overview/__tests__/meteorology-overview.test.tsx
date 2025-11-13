import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import {
  MeteorologyOverview,
  type MeteorologyOverviewDataset,
  type MeteorologyHourlyMetricSeries,
  type MeteorologyOverviewAnalysis,
  type MeteorologyOverviewLabels,
  type MeteorologyOverviewYearOption,
  type MeteorologyOverviewRanges,
  type MeteorologyOverviewUnits,
  type MeteorologyRegionData,
  type MeteorologyRegionMetric,
} from "../meteorology-overview";

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
      configurable: true,
      value: () => false,
    });
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
      configurable: true,
      value: () => undefined,
    });
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: () => undefined,
    });
  }
});

const labels: MeteorologyOverviewLabels = {
  temperature: "Температура",
  precipitation: "Осадки",
  airHumidity: "Влажность воздуха",
  soilMoisture: "Влажность почвы",
  cloudiness: "Облачность",
  pressure: "Давление",
  windSpeed: "Скорость ветра",
  visibility: "Видимость",
  windDirection: "Направление ветра",
  weatherPhenomenon: "Явления погоды",
  optimal: "Опт.",
  lastYear: "Прошлый год",
};

const units: MeteorologyOverviewUnits = {
  temperature: "°C",
  precipitation: "мм",
  humidity: "%",
  pressure: "мм рт. ст.",
  windSpeed: "м/с",
  visibility: "км",
};

const ranges: MeteorologyOverviewRanges = {
  airHumidity: { min: 55, max: 65 },
  soilMoisture: { min: 15, max: 20 },
};

const analysis: MeteorologyOverviewAnalysis = {
  title: "Анализ показателей",
  summary: "{metric}: {value}{unit}. {optimal}. {trend}.",
  rangeSummary: "{metric}: {value}{unit}. {range}.",
  optimal: {
    higher: "Выше оптимума на {difference}{unit}",
    lower: "Ниже оптимума на {difference}{unit}",
    equal: "Соответствует оптимуму",
  },
  trend: {
    up: "Рост на {difference}{unit}",
    down: "Падение на {difference}{unit}",
    equal: "Без изменений",
  },
  range: {
    above: "Выше диапазона {min}-{max}{unit}",
    below: "Ниже диапазона {min}-{max}{unit}",
    inside: "В пределах диапазона {min}-{max}{unit}",
  },
};

const buildMonthlyMetric = (value: number, optimal: number, lastYear: number): MeteorologyRegionMetric => ({
  value,
  optimal,
  lastYear,
});

const monthlyMetric = buildMonthlyMetric(21.5, 22, 20.8);
const precipitationMetric = buildMonthlyMetric(410, 430, 390);

const region2022: MeteorologyRegionData = {
  name: "Тестовый регион",
  temperature: monthlyMetric,
  precipitation: precipitationMetric,
  airHumidity: 60,
  soilMoisture: 18.4,
  temperatureSeries: [
    { period: "2022-01", value: 20, optimal: 20, lastYear: 19 },
    { period: "2022-02", value: 21, optimal: 21, lastYear: 20 },
  ],
  precipitationSeries: [
    { period: "2022-01", value: 380, optimal: 380, lastYear: 360 },
    { period: "2022-02", value: 390, optimal: 390, lastYear: 380 },
  ],
  airHumiditySeries: [
    { period: "2022-01", value: 58 },
    { period: "2022-02", value: 60 },
  ],
  soilMoistureSeries: [
    { period: "2022-01", value: 17.8 },
    { period: "2022-02", value: 18.1 },
  ],
  monthKeys: ["2022-01", "2022-02"],
  monthlySummaries: {
    "2022-01": {
      temperature: monthlyMetric,
      precipitation: precipitationMetric,
      airHumidity: 60,
      soilMoisture: 18.4,
      cloudiness: 45,
      pressure: 755,
      windSpeed: 5,
      visibility: 8,
    },
    "2022-02": {
      temperature: buildMonthlyMetric(22.1, 22.5, 21.4),
      precipitation: buildMonthlyMetric(420, 435, 410),
      airHumidity: 61,
      soilMoisture: 18.6,
      cloudiness: 40,
      pressure: 754,
      windSpeed: 4.5,
      visibility: 9,
    },
  },
};

const region2023Temperature = buildMonthlyMetric(25.5, 24.8, 24.3);
const region2023Precipitation = buildMonthlyMetric(460, 440, 430);

const region2023: MeteorologyRegionData = {
  name: "Тестовый регион",
  temperature: region2023Temperature,
  precipitation: region2023Precipitation,
  airHumidity: 62,
  soilMoisture: 19.2,
  temperatureSeries: [
    { period: "2023-01", value: 24.3, optimal: 24.3, lastYear: 23.8 },
    { period: "2023-02", value: 25.5, optimal: 25.5, lastYear: 24.3 },
  ],
  precipitationSeries: [
    { period: "2023-01", value: 430, optimal: 430, lastYear: 420 },
    { period: "2023-02", value: 460, optimal: 460, lastYear: 430 },
  ],
  airHumiditySeries: [
    { period: "2023-01", value: 61 },
    { period: "2023-02", value: 62 },
  ],
  soilMoistureSeries: [
    { period: "2023-01", value: 18.9 },
    { period: "2023-02", value: 19.2 },
  ],
  monthKeys: ["2023-01", "2023-02"],
  monthlySummaries: {
    "2023-01": {
      temperature: buildMonthlyMetric(24.3, 24.3, 23.8),
      precipitation: buildMonthlyMetric(430, 430, 420),
      airHumidity: 61,
      soilMoisture: 18.9,
      cloudiness: 38,
      pressure: 752,
      windSpeed: 4.1,
      visibility: 9.5,
    },
    "2023-02": {
      temperature: region2023Temperature,
      precipitation: region2023Precipitation,
      airHumidity: 62,
      soilMoisture: 19.2,
      cloudiness: 42,
      pressure: 751,
      windSpeed: 4.8,
      visibility: 10,
    },
  },
};

const region2024Temperature = buildMonthlyMetric(26.8, 26.2, 25.7);
const region2024Precipitation = buildMonthlyMetric(490, 470, 445);

const region2024: MeteorologyRegionData = {
  name: "Тестовый регион",
  temperature: region2024Temperature,
  precipitation: region2024Precipitation,
  airHumidity: 63,
  soilMoisture: 19.8,
  temperatureSeries: [
    { period: "2024-01", value: 25.9, optimal: 25.9, lastYear: 25.5 },
    { period: "2024-02", value: 26.8, optimal: 26.8, lastYear: 26.1 },
  ],
  precipitationSeries: [
    { period: "2024-01", value: 460, optimal: 460, lastYear: 450 },
    { period: "2024-02", value: 490, optimal: 490, lastYear: 470 },
  ],
  airHumiditySeries: [
    { period: "2024-01", value: 62 },
    { period: "2024-02", value: 63 },
  ],
  soilMoistureSeries: [
    { period: "2024-01", value: 19.4 },
    { period: "2024-02", value: 19.8 },
  ],
  monthKeys: ["2024-01", "2024-02"],
  monthlySummaries: {
    "2024-01": {
      temperature: buildMonthlyMetric(25.9, 25.9, 25.5),
      precipitation: buildMonthlyMetric(460, 460, 450),
      airHumidity: 62,
      soilMoisture: 19.4,
      cloudiness: 36,
      pressure: 750,
      windSpeed: 4.2,
      visibility: 10.2,
    },
    "2024-02": {
      temperature: region2024Temperature,
      precipitation: region2024Precipitation,
      airHumidity: 63,
      soilMoisture: 19.8,
      cloudiness: 39,
      pressure: 749,
      windSpeed: 4.6,
      visibility: 10.5,
    },
  },
};

const HOURS_OF_INTEREST = ["02:00", "05:00", "08:00", "11:00", "14:00", "17:00", "20:00", "23:00"];

const buildHourlySeries = (base: number, step = 1) =>
  HOURS_OF_INTEREST.map((period, index) => ({
    period,
    value: base + index * step,
  }));

const hourlySeries2022: Record<string, Record<string, Record<string, MeteorologyHourlyMetricSeries>>> = {
  "Тестовый регион": {
    "2022-01": {
      "2022-01-15": {
        temperature: buildHourlySeries(-10, 1),
        precipitation: buildHourlySeries(0.1, 0),
        airHumidity: buildHourlySeries(70, 0),
        soilMoisture: buildHourlySeries(18, 0),
        cloudiness: buildHourlySeries(40, 0),
        pressure: buildHourlySeries(755, 0),
        windSpeed: buildHourlySeries(3, 0),
        visibility: buildHourlySeries(5, 0),
        windDirection: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          value: (index * 45) % 360,
          label: "северный",
        })),
        weatherPhenomenon: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          label: index % 2 === 0 ? "ясно" : "пасмурно",
        })),
      },
    },
  },
};

const hourlySeries2023: Record<string, Record<string, Record<string, MeteorologyHourlyMetricSeries>>> = {
  "Тестовый регион": {
    "2023-01": {
      "2023-01-18": {
        temperature: buildHourlySeries(-5, 0.5),
        precipitation: buildHourlySeries(0.2, 0),
        airHumidity: buildHourlySeries(72, 0),
        soilMoisture: buildHourlySeries(19, 0),
        cloudiness: buildHourlySeries(35, 0),
        pressure: buildHourlySeries(752, 0),
        windSpeed: buildHourlySeries(3.5, 0),
        visibility: buildHourlySeries(8, 0),
        windDirection: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          value: (index * 45) % 360,
          label: "южный",
        })),
        weatherPhenomenon: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          label: index % 2 === 0 ? "облачно" : "небольшой снег",
        })),
      },
    },
    "2023-02": {
      "2023-02-20": {
        temperature: buildHourlySeries(-2, 0.4),
        precipitation: buildHourlySeries(0.05, 0),
        airHumidity: buildHourlySeries(70, 0),
        soilMoisture: buildHourlySeries(19.2, 0),
        cloudiness: buildHourlySeries(30, 0),
        pressure: buildHourlySeries(751, 0),
        windSpeed: buildHourlySeries(3.8, 0),
        visibility: buildHourlySeries(9.5, 0),
        windDirection: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          value: (index * 60) % 360,
          label: "юго-западный",
        })),
        weatherPhenomenon: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          label: index % 2 === 0 ? "ясно" : "облачно",
        })),
      },
    },
  },
};

const hourlySeries2024: Record<string, Record<string, Record<string, MeteorologyHourlyMetricSeries>>> = {
  "Тестовый регион": {
    "2024-01": {
      "2024-01-18": {
        temperature: buildHourlySeries(-1, 0.5),
        precipitation: buildHourlySeries(0.12, 0),
        airHumidity: buildHourlySeries(69, 0),
        soilMoisture: buildHourlySeries(19.5, 0),
        cloudiness: buildHourlySeries(32, 0),
        pressure: buildHourlySeries(750, 0),
        windSpeed: buildHourlySeries(3.9, 0),
        visibility: buildHourlySeries(9.8, 0),
        windDirection: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          value: (index * 70) % 360,
          label: "северо-восточный",
        })),
        weatherPhenomenon: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          label: index % 2 === 0 ? "облачно" : "небольшой дождь",
        })),
      },
    },
    "2024-02": {
      "2024-02-16": {
        temperature: buildHourlySeries(0.5, 0.45),
        precipitation: buildHourlySeries(0.08, 0),
        airHumidity: buildHourlySeries(68, 0),
        soilMoisture: buildHourlySeries(19.7, 0),
        cloudiness: buildHourlySeries(30, 0),
        pressure: buildHourlySeries(749, 0),
        windSpeed: buildHourlySeries(4.1, 0),
        visibility: buildHourlySeries(10.1, 0),
        windDirection: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          value: (index * 80) % 360,
          label: "восточный",
        })),
        weatherPhenomenon: HOURS_OF_INTEREST.map((period, index) => ({
          period,
          label: index % 2 === 0 ? "ясно" : "облачно",
        })),
      },
    },
  },
};

const datasets: Record<string, MeteorologyOverviewDataset> = {
  "2022": {
    regions: [region2022],
    hourlySeries: hourlySeries2022,
  },
  "2023": {
    regions: [region2023],
    hourlySeries: hourlySeries2023,
  },
  "2024": {
    regions: [region2024],
    hourlySeries: hourlySeries2024,
  },
};

const yearOptions: MeteorologyOverviewYearOption[] = [
  { value: "2022", label: "Метеоданные за 2022 год" },
  { value: "2023", label: "Метеоданные за 2023 год" },
  { value: "2024", label: "Метеоданные за 2024 год" },
];

describe("Метеорологический обзор", () => {
  it("показывает переключатель годов и данные выбранного года", async () => {
    const user = userEvent.setup();

    render(
      <MeteorologyOverview
        title="Метеорологический анализ"
        subtitle="Пояснение"
        labels={labels}
        units={units}
        ranges={ranges}
        analysis={analysis}
        datasets={datasets}
        yearOptions={yearOptions}
        defaultYear="2023"
      />,
    );

    expect(screen.getByRole("heading", { name: "Тестовый регион" })).toBeInTheDocument();
    expect(screen.getByText("Выберите год")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Выберите год" })).toHaveTextContent(
      "Метеоданные за 2023 год",
    );
    await user.click(screen.getByRole("combobox", { name: "Выберите год" }));
    expect(screen.getByText("Метеоданные за 2024 год")).toBeInTheDocument();
    expect(screen.getByText(/Температура.*25\.5.*Осадки.*460/i)).toBeInTheDocument();
  });
});

