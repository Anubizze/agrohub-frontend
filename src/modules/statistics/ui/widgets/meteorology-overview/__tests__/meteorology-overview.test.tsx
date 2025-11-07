import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MeteorologyOverview,
  type MeteorologyOverviewLabels,
  type MeteorologyOverviewUnits,
  type MeteorologyRegionData,
} from "../meteorology-overview";

const labels: MeteorologyOverviewLabels = {
  temperature: "Температура",
  precipitation: "Осадки",
  airHumidity: "Влажность воздуха",
  soilMoisture: "Влажность почвы",
  optimal: "Опт.",
  lastYear: "Прошлый год",
};

const units: MeteorologyOverviewUnits = {
  temperature: "°C",
  precipitation: "мм",
  humidity: "%",
};

const regions: MeteorologyRegionData[] = [
  {
    name: "Тестовый регион",
    temperature: { value: 21.5, optimal: 22, lastYear: 20.8 },
    precipitation: { value: 410, optimal: 430, lastYear: 390 },
    airHumidity: 60,
    soilMoisture: 18.4,
  },
];

describe("Метеорологический обзор", () => {
  it("отображает основные метрики региона", () => {
    render(
      <MeteorologyOverview
        title="Метеорологический анализ"
        subtitle="Пояснение"
        yearLabel="Метеоданные за 2022 год"
        labels={labels}
        units={units}
        regions={regions}
      />
    );

    expect(screen.getByText("Тестовый регион")).toBeInTheDocument();
    expect(screen.getByText(/21\.5/)).toBeInTheDocument();
    expect(screen.getByText(labels.precipitation)).toBeInTheDocument();
    expect(screen.getByText(labels.airHumidity)).toBeInTheDocument();
    expect(screen.getByText(labels.soilMoisture)).toBeInTheDocument();
    expect(screen.getByText("Метеоданные за 2022 год")).toBeInTheDocument();
  });
});

