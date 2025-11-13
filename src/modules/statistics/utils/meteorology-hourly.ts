import type {
  MeteorologyHourlyMetricSeries,
  MeteorologyRegionDirectionalPoint,
  MeteorologyRegionSeriesPoint,
  MeteorologyRegionTimelinePoint,
} from "../ui/widgets/meteorology-overview/meteorology-overview";

export interface MeteorologyHourlyRecord {
  region: string;
  timestamp: string;
  temperature: number;
  precipitation: number | null;
  airHumidity: number;
  soilMoisture: number | null;
  cloudiness?: number | null;
  pressure?: number | null;
  windSpeed?: number | null;
  visibility?: number | null;
  windDirection?: string | null;
  weatherPhenomenon?: string | null;
}

type HourlyAccumulator = {
  temperature: { sum: number; count: number };
  precipitation: { sum: number; count: number };
  airHumidity: { sum: number; count: number };
  soilMoisture: { sum: number; count: number };
  cloudiness: { sum: number; count: number };
  pressure: { sum: number; count: number };
  windSpeed: { sum: number; count: number };
  visibility: { sum: number; count: number };
  windDirection: { value: number | null; label: string | null };
  weatherPhenomenon: { label: string | null };
};

const HOURS_IN_DAY = 24;
const HOURS_OF_INTEREST = [2, 5, 8, 11, 14, 17, 20, 23];
const ZERO_PAD = (value: number) => value.toString().padStart(2, "0");

const ensureValue = (
  values: Array<number | null>,
  index: number,
  fallback = 0,
): number => {
  if (values[index] != null) {
    return values[index] as number;
  }

  const previous = index > 0 ? values[index - 1] : null;
  if (previous != null) {
    values[index] = previous;
    return previous;
  }

  const next = values.find((value) => value != null);
  if (next != null) {
    values[index] = next;
    return next;
  }

  values[index] = fallback;
  return fallback;
};

const createAccumulator = (): HourlyAccumulator => ({
  temperature: { sum: 0, count: 0 },
  precipitation: { sum: 0, count: 0 },
  airHumidity: { sum: 0, count: 0 },
  soilMoisture: { sum: 0, count: 0 },
  cloudiness: { sum: 0, count: 0 },
  pressure: { sum: 0, count: 0 },
  windSpeed: { sum: 0, count: 0 },
  visibility: { sum: 0, count: 0 },
  windDirection: { value: null, label: null },
  weatherPhenomenon: { label: null },
});

const buildSeries = (
  values: Array<number | null>,
  formatter: (value: number) => number,
): MeteorologyRegionSeriesPoint[] => {
  return HOURS_OF_INTEREST.map((hour) => {
    const ensured = ensureValue(values, hour);
    return {
      period: `${ZERO_PAD(hour)}:00`,
      value: ensured === null ? 0 : formatter(ensured),
    };
  });
};

const average = ({ sum, count }: { sum: number; count: number }) =>
  count > 0 ? sum / count : null;

const DIRECTION_DEGREES: Record<string, number> = {
  северный: 0,
  "северо-восточный": 45,
  "восточный": 90,
  "юго-восточный": 135,
  южный: 180,
  "юго-западный": 225,
  "западный": 270,
  "северо-западный": 315,
};

const normalizeDirection = (label: string): { value: number; label: string } => {
  const normalized = label.trim().toLowerCase();
  const value = DIRECTION_DEGREES[normalized];
  return {
    value: value ?? 0,
    label: label || "не указано",
  };
};

const ensureDirectionalPoint = (
  values: Array<number | null>,
  labels: Array<string | null>,
  index: number,
): { value: number; label: string } => {
  if (values[index] != null && labels[index]) {
    return {
      value: values[index]!,
      label: labels[index]!,
    };
  }

  if (index > 0 && values[index - 1] != null && labels[index - 1]) {
    values[index] = values[index - 1];
    labels[index] = labels[index - 1];
    return { value: values[index]!, label: labels[index]! };
  }

  const nextIndex = values.findIndex((value, idx) => value != null && labels[idx]);
  if (nextIndex !== -1) {
    values[index] = values[nextIndex];
    labels[index] = labels[nextIndex];
    return { value: values[index]!, label: labels[index]! };
  }

  values[index] = 0;
  labels[index] = "не указано";
  return { value: 0, label: "не указано" };
};

const ensureLabel = (labels: Array<string | null>, index: number): string => {
  if (labels[index]) {
    return labels[index]!;
  }

  if (index > 0 && labels[index - 1]) {
    labels[index] = labels[index - 1];
    return labels[index]!;
  }

  const next = labels.find((label) => label != null);
  if (next) {
    labels[index] = next;
    return next;
  }

  labels[index] = "—";
  return labels[index]!;
};

const buildDirectionalSeries = (
  values: Array<number | null>,
  labels: Array<string | null>,
): MeteorologyRegionDirectionalPoint[] => {
  return HOURS_OF_INTEREST.map((hour) => {
    const ensured = ensureDirectionalPoint(values, labels, hour);
    return {
      period: `${ZERO_PAD(hour)}:00`,
      value: ensured.value ?? 0,
      label: ensured.label ?? "—",
    };
  });
};

const buildTimelineSeries = (
  labels: Array<string | null>,
): MeteorologyRegionTimelinePoint[] => {
  return HOURS_OF_INTEREST.map((hour) => {
    const label = ensureLabel(labels, hour);
    return {
      period: `${ZERO_PAD(hour)}:00`,
      label: label ?? "—",
    };
  });
};

export const buildHourlySeriesByRegion = (
  records: MeteorologyHourlyRecord[],
): Record<string, Record<string, MeteorologyHourlyMetricSeries>> => {
  const regionMonthMap = new Map<
    string,
    Map<string, Map<number, HourlyAccumulator>>
  >();

  for (const record of records) {
    const date = new Date(record.timestamp);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const regionKey = record.region;
    const monthKey = `${date.getUTCFullYear()}-${ZERO_PAD(
      date.getUTCMonth() + 1,
    )}`;
    const hour = date.getUTCHours();

    if (!regionMonthMap.has(regionKey)) {
      regionMonthMap.set(regionKey, new Map());
    }
    const monthMap = regionMonthMap.get(regionKey)!;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, new Map());
    }
    const hourMap = monthMap.get(monthKey)!;

    if (!hourMap.has(hour)) {
      hourMap.set(hour, createAccumulator());
    }
    const accumulator = hourMap.get(hour)!;

    accumulator.temperature.sum += record.temperature;
    accumulator.temperature.count += 1;

    if (record.precipitation != null) {
      accumulator.precipitation.sum += record.precipitation;
      accumulator.precipitation.count += 1;
    }

    accumulator.airHumidity.sum += record.airHumidity;
    accumulator.airHumidity.count += 1;

    if (record.soilMoisture != null) {
      accumulator.soilMoisture.sum += record.soilMoisture;
      accumulator.soilMoisture.count += 1;
    }

    if (record.cloudiness != null) {
      accumulator.cloudiness.sum += record.cloudiness;
      accumulator.cloudiness.count += 1;
    }

    if (record.pressure != null) {
      accumulator.pressure.sum += record.pressure;
      accumulator.pressure.count += 1;
    }

    if (record.windSpeed != null) {
      accumulator.windSpeed.sum += record.windSpeed;
      accumulator.windSpeed.count += 1;
    }

    if (record.visibility != null) {
      accumulator.visibility.sum += record.visibility;
      accumulator.visibility.count += 1;
    }

    if (record.windDirection) {
      const normalizedDirection = normalizeDirection(record.windDirection);
      accumulator.windDirection.value = normalizedDirection.value;
      accumulator.windDirection.label = normalizedDirection.label;
    }

    if (record.weatherPhenomenon && record.weatherPhenomenon.trim()) {
      accumulator.weatherPhenomenon.label = record.weatherPhenomenon.trim();
    }
  }

  const result: Record<string, Record<string, MeteorologyHourlyMetricSeries>> = {};

  for (const [region, months] of regionMonthMap.entries()) {
    result[region] = {};

    const sortedMonthKeys = Array.from(months.keys()).sort();
    for (const monthKey of sortedMonthKeys) {
      const hourMap = months.get(monthKey)!;

      const temperatureValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const precipitationValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const airHumidityValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const soilMoistureValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const cloudinessValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const pressureValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const windSpeedValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const visibilityValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const windDirectionValues: Array<number | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const windDirectionLabels: Array<string | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );
      const phenomenonLabels: Array<string | null> = Array.from(
        { length: HOURS_IN_DAY },
        () => null,
      );

      for (const [hour, metrics] of hourMap.entries()) {
        temperatureValues[hour] = average(metrics.temperature);
        precipitationValues[hour] = average(metrics.precipitation);
        airHumidityValues[hour] = average(metrics.airHumidity);
        soilMoistureValues[hour] = average(metrics.soilMoisture);
        cloudinessValues[hour] = average(metrics.cloudiness);
        pressureValues[hour] = average(metrics.pressure);
        windSpeedValues[hour] = average(metrics.windSpeed);
        visibilityValues[hour] = average(metrics.visibility);
        windDirectionValues[hour] = metrics.windDirection.value;
        windDirectionLabels[hour] = metrics.windDirection.label;
        phenomenonLabels[hour] = metrics.weatherPhenomenon.label;
      }

      result[region][monthKey] = {
        temperature: buildSeries(temperatureValues, (value) =>
          Number(value.toFixed(2)),
        ),
        precipitation: buildSeries(precipitationValues, (value) =>
          Number(value.toFixed(2)),
        ),
        airHumidity: buildSeries(airHumidityValues, (value) =>
          Number(value.toFixed(2)),
        ),
        soilMoisture: buildSeries(soilMoistureValues, (value) =>
          Number(value.toFixed(2)),
        ),
        cloudiness: buildSeries(cloudinessValues, (value) =>
          Number(value.toFixed(2)),
        ),
        pressure: buildSeries(pressureValues, (value) =>
          Number(value.toFixed(1)),
        ),
        windSpeed: buildSeries(windSpeedValues, (value) =>
          Number(value.toFixed(2)),
        ),
        visibility: buildSeries(visibilityValues, (value) =>
          Number(value.toFixed(2)),
        ),
        windDirection: buildDirectionalSeries(
          windDirectionValues,
          windDirectionLabels,
        ),
        weatherPhenomenon: buildTimelineSeries(phenomenonLabels),
      };
    }
  }

  return result;
};

