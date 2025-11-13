import type {
  MeteorologyHourlyMetricSeries,
  MeteorologyRegionData,
  MeteorologyRegionDirectionalPoint,
  MeteorologyRegionMetric,
  MeteorologyRegionMonthlySummary,
  MeteorologyRegionSeriesPoint,
  MeteorologyRegionTimelinePoint,
  MeteorologyOverviewDataset,
} from "../ui/widgets/meteorology-overview/meteorology-overview";

const HOURS_OF_INTEREST = [2, 5, 8, 11, 14, 17, 20, 23] as const;
const HOURS_OF_INTEREST_SET = new Set<number>(HOURS_OF_INTEREST);
const ZERO_PAD = (value: number) => value.toString().padStart(2, "0");

export type BackendRecord = {
  id: number;
  region: {
    id: number;
    name: string;
  };
  observation_datetime: string;
  temperature_c: number;
  precipitation_mm: number | null;
  humidity_percent: number;
  wind_direction: string | null;
  wind_speed_ms: number | null;
  cloudiness_percent: number | null;
  pressure_mm: number | null;
  weather_phenomenon: string | null;
  visibility_km: number | null;
  soil_moisture_percent?: number | null;
};

const WIND_DIRECTION_DEGREES: Record<string, number> = {
  северный: 0,
  "северо-восточный": 45,
  восточный: 90,
  "юго-восточный": 135,
  южный: 180,
  "юго-западный": 225,
  западный: 270,
  "северо-западный": 315,
};

const normalizeString = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const normalizePhenomenon = (value: string | null | undefined): string => {
  const trimmed = normalizeString(value).trim();

  if (!trimmed) {
    return "Без явлений";
  }

  return trimmed[0].toUpperCase() + trimmed.slice(1);
};

const toHour = (timestamp: string): number =>
  Number.parseInt(timestamp.slice(11, 13), 10);

const toMonthKey = (timestamp: string): string => timestamp.slice(0, 7);
const toDayKey = (timestamp: string): string => timestamp.slice(0, 10);
const toHourLabel = (hour: number): string => `${ZERO_PAD(hour)}:00`;

interface DayAccumulator {
  temperature: Map<number, number>;
  precipitation: Map<number, number>;
  airHumidity: Map<number, number>;
  soilMoisture: Map<number, number>;
  cloudiness: Map<number, number>;
  pressure: Map<number, number>;
  windSpeed: Map<number, number>;
  visibility: Map<number, number>;
  windDirection: Map<number, { value: number | null; label: string }>;
  weatherPhenomenon: Map<number, string>;
}

interface MonthAccumulator {
  temperatureValues: number[];
  precipitationValues: number[];
  airHumidityValues: number[];
  soilMoistureValues: number[];
  cloudinessValues: number[];
  pressureValues: number[];
  windSpeedValues: number[];
  visibilityValues: number[];
  days: Map<string, DayAccumulator>;
}

interface RegionAccumulator {
  id: number;
  name: string;
  months: Map<string, MonthAccumulator>;
}

const ensureDayAccumulator = (map: Map<string, DayAccumulator>, key: string): DayAccumulator => {
  let accumulator = map.get(key);

  if (!accumulator) {
    accumulator = {
      temperature: new Map(),
      precipitation: new Map(),
      airHumidity: new Map(),
      soilMoisture: new Map(),
      cloudiness: new Map(),
      pressure: new Map(),
      windSpeed: new Map(),
      visibility: new Map(),
      windDirection: new Map(),
      weatherPhenomenon: new Map(),
    };
    map.set(key, accumulator);
  }

  return accumulator;
};

const ensureMonthAccumulator = (map: Map<string, MonthAccumulator>, key: string): MonthAccumulator => {
  let accumulator = map.get(key);

  if (!accumulator) {
    accumulator = {
      temperatureValues: [],
      precipitationValues: [],
      airHumidityValues: [],
      soilMoistureValues: [],
      cloudinessValues: [],
      pressureValues: [],
      windSpeedValues: [],
      visibilityValues: [],
      days: new Map(),
    };
    map.set(key, accumulator);
  }

  return accumulator;
};

const average = (values: number[]): number =>
  values.length ? values.reduce((total, next) => total + next, 0) / values.length : 0;

const sum = (values: number[]): number =>
  values.reduce((total, next) => total + next, 0);

const toMetric = (value: number, previousValue: number | null): MeteorologyRegionMetric => ({
  value,
  optimal: value,
  lastYear: previousValue ?? value,
});

const buildSeriesFromMap = (map: Map<number, number | null>): MeteorologyRegionSeriesPoint[] => {
  return HOURS_OF_INTEREST.map((hour) => {
    const value = map.get(hour);
    return {
      period: toHourLabel(hour),
      value: Number((value ?? 0).toFixed(2)),
    };
  });
};

const buildDirectionalSeriesFromMap = (
  map: Map<number, { value: number | null; label: string }>,
): MeteorologyRegionDirectionalPoint[] => {
  return HOURS_OF_INTEREST.map((hour) => {
    const record = map.get(hour);
    return {
      period: toHourLabel(hour),
      value: record?.value ?? 0,
      label: record?.label ?? "—",
    };
  });
};

const buildTimelineSeriesFromMap = (map: Map<number, string>): MeteorologyRegionTimelinePoint[] => {
  let previousLabel: string | null = null;
  return HOURS_OF_INTEREST.map((hour) => {
    const label = map.get(hour) ?? previousLabel ?? "—";
    previousLabel = label;
    return {
      period: toHourLabel(hour),
      label,
    };
  });
};

type ConvertedRecord = {
  region: string;
  timestamp: string;
  temperature: number;
  precipitation: number;
  airHumidity: number;
  soilMoisture: number;
  cloudiness: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
  windDirection: string;
  weatherPhenomenon: string;
};

const convertRecord = (record: BackendRecord): ConvertedRecord | null => {
  const hour = toHour(record.observation_datetime);

  if (!HOURS_OF_INTEREST_SET.has(hour)) {
    return null;
  }

  return {
    region: normalizeString(record.region.name),
    timestamp: record.observation_datetime,
    temperature: record.temperature_c,
    precipitation: record.precipitation_mm ?? 0,
    airHumidity: record.humidity_percent,
    soilMoisture: record.soil_moisture_percent ?? 0,
    cloudiness: record.cloudiness_percent ?? 0,
    pressure: record.pressure_mm ?? 0,
    windSpeed: record.wind_speed_ms ?? 0,
    visibility: record.visibility_km ?? 0,
    windDirection: normalizeString(record.wind_direction ?? ""),
    weatherPhenomenon: normalizePhenomenon(record.weather_phenomenon),
  };
};

export type MeteorologyOverviewBackendData = MeteorologyOverviewDataset;

export const buildOverviewDataFromBackend = (
  backendRecords: BackendRecord[],
): MeteorologyOverviewBackendData => {
  const regionMap = new Map<string, RegionAccumulator>();

  backendRecords.forEach((backendRecord) => {
    const converted = convertRecord(backendRecord);

    if (!converted) {
      return;
    }

    const regionName = converted.region;
    const monthKey = toMonthKey(converted.timestamp);
    const dayKey = toDayKey(converted.timestamp);
    const hour = toHour(converted.timestamp);
    let regionAccumulator = regionMap.get(regionName);

    if (!regionAccumulator) {
      regionAccumulator = {
        id: backendRecord.region.id,
        name: regionName,
        months: new Map(),
      };
      regionMap.set(regionName, regionAccumulator);
    }

    const monthAccumulator = ensureMonthAccumulator(regionAccumulator.months, monthKey);
    const dayAccumulator = ensureDayAccumulator(monthAccumulator.days, dayKey);

    monthAccumulator.temperatureValues.push(converted.temperature);
    monthAccumulator.precipitationValues.push(converted.precipitation);
    monthAccumulator.airHumidityValues.push(converted.airHumidity);
    monthAccumulator.soilMoistureValues.push(converted.soilMoisture);
    monthAccumulator.cloudinessValues.push(converted.cloudiness ?? 0);
    monthAccumulator.pressureValues.push(converted.pressure ?? 0);
    monthAccumulator.windSpeedValues.push(converted.windSpeed ?? 0);
    monthAccumulator.visibilityValues.push(converted.visibility ?? 0);

    dayAccumulator.temperature.set(hour, converted.temperature);
    dayAccumulator.precipitation.set(hour, converted.precipitation);
    dayAccumulator.airHumidity.set(hour, converted.airHumidity);
    dayAccumulator.soilMoisture.set(hour, converted.soilMoisture);
    dayAccumulator.cloudiness.set(hour, converted.cloudiness ?? 0);
    dayAccumulator.pressure.set(hour, converted.pressure ?? 0);
    dayAccumulator.windSpeed.set(hour, converted.windSpeed ?? 0);
    dayAccumulator.visibility.set(hour, converted.visibility ?? 0);

    const directionLabel = normalizeString(converted.windDirection ?? "");
    dayAccumulator.windDirection.set(hour, {
      value: WIND_DIRECTION_DEGREES[directionLabel.toLowerCase()] ?? null,
      label: directionLabel || "—",
    });

    dayAccumulator.weatherPhenomenon.set(hour, normalizePhenomenon(converted.weatherPhenomenon));
  });

  const hourlySeries: Record<
    string,
    Record<string, Record<string, MeteorologyHourlyMetricSeries>>
  > = {};

  const regions: MeteorologyRegionData[] = [];

  Array.from(regionMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((regionAccumulator) => {
      const monthKeys = Array.from(regionAccumulator.months.keys()).sort();
      const monthlySummaries: Record<string, MeteorologyRegionMonthlySummary> = {};

      const temperatureSeries = monthKeys.map<MeteorologyRegionSeriesPoint>((monthKey, index) => {
        const data = regionAccumulator.months.get(monthKey)!;
        const previousKey = index > 0 ? monthKeys[index - 1] : null;
        const previousData = previousKey ? regionAccumulator.months.get(previousKey)! : null;

        const temperatureAvg = average(data.temperatureValues);
        const precipitationSum = sum(data.precipitationValues);
        const airHumidityAvg = average(data.airHumidityValues);
        const soilMoistureAvg = average(data.soilMoistureValues);
        const cloudinessAvg = average(data.cloudinessValues);
        const pressureAvg = average(data.pressureValues);
        const windSpeedAvg = average(data.windSpeedValues);
        const visibilityAvg = average(data.visibilityValues);

        const previousTemperatureAvg = previousData ? average(previousData.temperatureValues) : null;
        const previousPrecipitationSum = previousData ? sum(previousData.precipitationValues) : null;

        monthlySummaries[monthKey] = {
          temperature: toMetric(Number(temperatureAvg.toFixed(2)), previousTemperatureAvg),
          precipitation: toMetric(Number(precipitationSum.toFixed(2)), previousPrecipitationSum),
          airHumidity: Number(airHumidityAvg.toFixed(2)),
          soilMoisture: Number(soilMoistureAvg.toFixed(2)),
          cloudiness: Number(cloudinessAvg.toFixed(2)),
          pressure: Number(pressureAvg.toFixed(2)),
          windSpeed: Number(windSpeedAvg.toFixed(2)),
          visibility: Number(visibilityAvg.toFixed(2)),
        };

        return {
          period: monthKey,
          value: Number(temperatureAvg.toFixed(2)),
          optimal: Number(temperatureAvg.toFixed(2)),
          lastYear:
            previousTemperatureAvg !== null
              ? Number(previousTemperatureAvg.toFixed(2))
              : Number(temperatureAvg.toFixed(2)),
        };
      });

      const precipitationSeries = monthKeys.map<MeteorologyRegionSeriesPoint>((monthKey) => {
        const summary = monthlySummaries[monthKey];
        return {
          period: monthKey,
          value: Number(summary.precipitation.value.toFixed(2)),
          optimal: Number(summary.precipitation.value.toFixed(2)),
          lastYear: Number(summary.precipitation.lastYear.toFixed(2)),
        };
      });

      const airHumiditySeries = monthKeys.map<MeteorologyRegionSeriesPoint>((monthKey) => ({
        period: monthKey,
        value: Number(monthlySummaries[monthKey].airHumidity.toFixed(2)),
      }));

      const soilMoistureSeries = monthKeys.map<MeteorologyRegionSeriesPoint>((monthKey) => ({
        period: monthKey,
        value: Number(monthlySummaries[monthKey].soilMoisture.toFixed(2)),
      }));

      const lastMonthKey = monthKeys.at(-1);
      const lastSummary = lastMonthKey ? monthlySummaries[lastMonthKey] : null;

      regions.push({
        name: regionAccumulator.name,
        temperature: lastSummary?.temperature ?? toMetric(0, null),
        precipitation: lastSummary?.precipitation ?? toMetric(0, null),
        airHumidity: lastSummary?.airHumidity ?? 0,
        soilMoisture: lastSummary?.soilMoisture ?? 0,
        temperatureSeries,
        precipitationSeries,
        airHumiditySeries,
        soilMoistureSeries,
        monthKeys,
        monthlySummaries,
      });

      const monthSeries: Record<string, Record<string, MeteorologyHourlyMetricSeries>> = {};

      monthKeys.forEach((monthKey) => {
        const monthData = regionAccumulator.months.get(monthKey)!;
        const dayEntries = Array.from(monthData.days.keys()).sort();
        const daySeries: Record<string, MeteorologyHourlyMetricSeries> = {};

        dayEntries.forEach((dayKey) => {
          const dayData = monthData.days.get(dayKey)!;

          daySeries[dayKey] = {
            temperature: buildSeriesFromMap(dayData.temperature),
            precipitation: buildSeriesFromMap(dayData.precipitation),
            airHumidity: buildSeriesFromMap(dayData.airHumidity),
            soilMoisture: buildSeriesFromMap(dayData.soilMoisture),
            cloudiness: buildSeriesFromMap(dayData.cloudiness),
            pressure: buildSeriesFromMap(dayData.pressure),
            windSpeed: buildSeriesFromMap(dayData.windSpeed),
            visibility: buildSeriesFromMap(dayData.visibility),
            windDirection: buildDirectionalSeriesFromMap(dayData.windDirection),
            weatherPhenomenon: buildTimelineSeriesFromMap(dayData.weatherPhenomenon),
          };
        });

        monthSeries[monthKey] = daySeries;
      });

      hourlySeries[regionAccumulator.name] = monthSeries;
    });

  return { regions, hourlySeries };
};

export const buildOverviewDatasetsByYear = (
  backendRecords: BackendRecord[],
): Record<string, MeteorologyOverviewDataset> => {
  if (!backendRecords.length) {
    return {};
  }

  const recordsByYear = new Map<string, BackendRecord[]>();

  backendRecords.forEach((record) => {
    const year = record.observation_datetime.slice(0, 4);
    if (!year) {
      return;
    }

    const bucket = recordsByYear.get(year);
    if (bucket) {
      bucket.push(record);
    } else {
      recordsByYear.set(year, [record]);
    }
  });

  const result: Record<string, MeteorologyOverviewDataset> = {};

  Array.from(recordsByYear.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([year, records]) => {
      result[year] = buildOverviewDataFromBackend(records);
    });

  return result;
};
