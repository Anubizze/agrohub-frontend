import fallbackRecords from "@/modules/statistics/model/meteorology-records.json";

import {
  buildOverviewDataFromBackend,
  buildOverviewDatasetsByYear,
  type BackendRecord,
  type MeteorologyOverviewDataset,
} from "./meteorology-backend-adapter";

const RECORDS_ENDPOINT = "/api/meteorology/records/";
const REGIONS_ENDPOINT = "/api/meteorology/regions/";
const DEFAULT_API_BASE = "http://localhost:8000";
const DEFAULT_REVALIDATE_SECONDS = 60 * 10;

type PaginatedResponse<T> = {
  results?: T[];
  next?: string | null;
};

const normalizeApiBase = (value: string | undefined): string =>
  (value ?? DEFAULT_API_BASE).replace(/\/+$/, "");

const joinUrl = (base: string, path: string): string => {
  if (!path.startsWith("http")) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }
  return path;
};

const fetchCollection = async <T>(path: string): Promise<T[]> => {
  const baseUrl = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  let url = joinUrl(baseUrl, path);
  const result: T[] = [];

  while (url) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: DEFAULT_REVALIDATE_SECONDS,
        tags: ["meteorology"],
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as PaginatedResponse<T> | T[];

    if (Array.isArray(payload)) {
      result.push(...payload);
      break;
    }

    const pageItems = Array.isArray(payload.results) ? payload.results : [];
    result.push(...pageItems);

    const nextUrl = payload.next ? joinUrl(baseUrl, payload.next) : "";
    if (!nextUrl || nextUrl === url) {
      break;
    }

    url = nextUrl;
  }

  return result;
};

export const fetchMeteorologyRecords = async (): Promise<BackendRecord[]> => {
  return fetchCollection<BackendRecord>(`${RECORDS_ENDPOINT}?ordering=observation_datetime`);
};

export const fetchMeteorologyRegions = async (): Promise<{ id: number; name: string }[]> => {
  return fetchCollection<{ id: number; name: string }>(REGIONS_ENDPOINT);
};

const HOURS_OF_INTEREST = [2, 5, 8, 11, 14, 17, 20, 23] as const;
const WIND_DIRECTIONS = [
  "северный",
  "северо-восточный",
  "восточный",
  "юго-восточный",
  "южный",
  "юго-западный",
  "западный",
  "северо-западный",
] as const;
const WEATHER_PHENOMENA = ["ясно", "переменная облачность", "небольшой дождь", "небольшой снег"] as const;

const pad = (value: number): string => value.toString().padStart(2, "0");

const buildMockRecordsForYear = (year: number): BackendRecord[] => {
  const region = { id: 1, name: "Бескарагайский район" };
  let idCounter = year * 10000;

  return Array.from({ length: 12 }, (_, monthIndex) => monthIndex + 1).flatMap((month) =>
    HOURS_OF_INTEREST.map((hour, hourIndex) => {
      idCounter += 1;
      const temperature = Number((-17 + month * 2.4 + hourIndex * 0.6).toFixed(1));
      const precipitation = Number(Math.max(0, (month % 4) * 0.35 - hourIndex * 0.025).toFixed(2));
      const humidity = Math.min(95, 58 + month * 2 + hourIndex);
      const soilMoisture = Number((18 + month * 0.12).toFixed(2));
      const cloudiness = Math.min(100, 28 + month * 3 + hourIndex * 2);
      const pressure = Number((754 - month * 0.4 + hourIndex * 0.1).toFixed(1));
      const windSpeed = Number((2.6 + (month % 5) * 0.35 + hourIndex * 0.12).toFixed(1));
      const visibility = Number(Math.max(4.5, 6 + month * 0.25 - hourIndex * 0.05).toFixed(1));
      const windDirection = WIND_DIRECTIONS[hourIndex % WIND_DIRECTIONS.length];
      const weatherPhenomenon =
        WEATHER_PHENOMENA[(month + hourIndex) % WEATHER_PHENOMENA.length];

      return {
        id: idCounter,
        region,
        observation_datetime: `${year}-${pad(month)}-15T${pad(hour)}:00:00+06:00`,
        temperature_c: temperature,
        precipitation_mm: precipitation,
        humidity_percent: humidity,
        wind_direction: windDirection,
        wind_speed_ms: windSpeed,
        cloudiness_percent: cloudiness,
        pressure_mm: pressure,
        weather_phenomenon: weatherPhenomenon,
        visibility_km: visibility,
        soil_moisture_percent: soilMoisture,
      };
    }),
  );
};

const ensureMockYear = (
  datasets: Record<string, MeteorologyOverviewDataset>,
  year: number,
): Record<string, MeteorologyOverviewDataset> => {
  const yearKey = String(year);

  if (datasets[yearKey]) {
    return datasets;
  }

  return {
    ...datasets,
    [yearKey]: buildOverviewDataFromBackend(buildMockRecordsForYear(year)),
  };
};

const filterRecordsByYear = (records: BackendRecord[], year: number): BackendRecord[] => {
  const prefix = `${year}-`;
  return records.filter((record) => record.observation_datetime.startsWith(prefix));
};

const ensureFallbackYear = (
  datasets: Record<string, MeteorologyOverviewDataset>,
  year: number,
  fallback: BackendRecord[],
): Record<string, MeteorologyOverviewDataset> => {
  const yearKey = String(year);

  if (datasets[yearKey]) {
    return datasets;
  }

  const fallbackRecordsForYear = filterRecordsByYear(fallback, year);
  if (!fallbackRecordsForYear.length) {
    return datasets;
  }

  return {
    ...datasets,
    [yearKey]: buildOverviewDataFromBackend(fallbackRecordsForYear),
  };
};

const buildFallbackOverview = (): Record<string, MeteorologyOverviewDataset> => {
  const typedRecords = fallbackRecords as BackendRecord[];
  const datasets = buildOverviewDatasetsByYear([
    ...typedRecords,
    ...buildMockRecordsForYear(2023),
    ...buildMockRecordsForYear(2024),
  ]);

  const withFallback2022 = ensureFallbackYear(datasets, 2022, typedRecords);
  const withMock2023 = ensureMockYear(withFallback2022, 2023);

  return ensureMockYear(withMock2023, 2024);
};

export const fetchMeteorologyOverview = async (): Promise<
  Record<string, MeteorologyOverviewDataset>
> => {
  try {
    const records = await fetchMeteorologyRecords();

    if (!records.length) {
      throw new Error("Empty meteorology records response");
    }

      const datasets = buildOverviewDatasetsByYear(records);

      const typedFallback = fallbackRecords as BackendRecord[];
      const withFallback2022 = ensureFallbackYear(datasets, 2022, typedFallback);

      const withMock2023 = ensureMockYear(withFallback2022, 2023);

      return ensureMockYear(withMock2023, 2024);
  } catch (error) {
    console.error("[meteorology] fallback to bundled data:", error);
    return buildFallbackOverview();
  }
};

