import type { MeteorologyHourlyRecord } from "../utils/meteorology-hourly";

type RegionConfig = {
  name: string;
  temperatureBase: number;
  humidityBase: number;
  precipitationBase: number;
  soilMoistureBase: number;
  cloudinessBase: number;
  pressureBase: number;
  windSpeedBase: number;
  visibilityBase: number;
};

const REGION_CONFIGS: RegionConfig[] = [
  {
    name: "Абайский район",
    temperatureBase: -22,
    humidityBase: 60,
    precipitationBase: 0.2,
    soilMoistureBase: 18,
    cloudinessBase: 45,
    pressureBase: 755,
    windSpeedBase: 3,
    visibilityBase: 6,
  },
  {
    name: "Аксуский район",
    temperatureBase: -18,
    humidityBase: 58,
    precipitationBase: 0.18,
    soilMoistureBase: 16.5,
    cloudinessBase: 40,
    pressureBase: 752,
    windSpeedBase: 2.5,
    visibilityBase: 7,
  },
  {
    name: "Карагандинский район",
    temperatureBase: -20,
    humidityBase: 59,
    precipitationBase: 0.21,
    soilMoistureBase: 17.5,
    cloudinessBase: 50,
    pressureBase: 754,
    windSpeedBase: 3.5,
    visibilityBase: 5.5,
  },
  {
    name: "Темиртауский район",
    temperatureBase: -16,
    humidityBase: 55,
    precipitationBase: 0.15,
    soilMoistureBase: 14.2,
    cloudinessBase: 35,
    pressureBase: 751,
    windSpeedBase: 2.8,
    visibilityBase: 6.5,
  },
  {
    name: "Шетский район",
    temperatureBase: -19,
    humidityBase: 57,
    precipitationBase: 0.19,
    soilMoistureBase: 15.5,
    cloudinessBase: 42,
    pressureBase: 753,
    windSpeedBase: 3.2,
    visibilityBase: 6.8,
  },
];

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const WIND_DIRECTIONS = [
  "северный",
  "северо-восточный",
  "восточный",
  "юго-восточный",
  "южный",
  "юго-западный",
  "западный",
  "северо-западный",
];

const WEATHER_PHENOMENA = [
  "ясно",
  "небольшой снег",
  "туман",
  "пасмурно",
  "гололедица",
  "морось",
  "без явлений",
];

const generateRecord = (
  region: RegionConfig,
  year: number,
  month: number,
  hour: number,
): MeteorologyHourlyRecord => {
  const monthFactor = Math.sin(((month - 3) / 12) * Math.PI * 2);
  const hourFactor = Math.cos((hour / 24) * Math.PI * 2) * 5;

  const temperature =
    region.temperatureBase +
    monthFactor * 10 +
    hourFactor +
    Math.sin(hour) * 0.5;

  const airHumidity =
    region.humidityBase + Math.cos(month / 12) * 5 + Math.sin(hour) * 2;

  const precipitation =
    Math.max(0, region.precipitationBase + Math.sin(month) * 0.05) +
    (hour % 6 === 0 ? 0.1 : 0);

  const soilMoisture =
    region.soilMoistureBase +
    Math.sin(month / 6) * 0.3 +
    Math.cos(hour / 12) * 0.2;

  const cloudiness =
    region.cloudinessBase +
    Math.sin(hour / 4) * 10 +
    Math.cos(month / 3) * 5;

  const pressure =
    region.pressureBase +
    Math.sin(month / 5) * 2 +
    Math.cos(hour / 6) * 1.2;

  const windSpeed =
    region.windSpeedBase +
    Math.abs(Math.sin(hour / 2)) * 1.5 +
    Math.cos(month) * 0.5;

  const visibility =
    region.visibilityBase -
    Math.abs(Math.sin(hour / 3)) * 1.2 +
    Math.cos(month / 2) * 0.4;

  const windDirection =
    WIND_DIRECTIONS[(hour + month) % WIND_DIRECTIONS.length];
  const weatherPhenomenon =
    WEATHER_PHENOMENA[(hour + month) % WEATHER_PHENOMENA.length];

  return {
    region: region.name,
    timestamp: new Date(
      Date.UTC(year, month - 1, 1, hour, 0, 0),
    ).toISOString(),
    temperature: Number(temperature.toFixed(1)),
    precipitation: Number(precipitation.toFixed(2)),
    airHumidity: Number(airHumidity.toFixed(1)),
    soilMoisture: Number(soilMoisture.toFixed(2)),
    cloudiness: Math.min(100, Math.max(0, Number(cloudiness.toFixed(1)))),
    pressure: Number(pressure.toFixed(1)),
    windSpeed: Math.max(0, Number(windSpeed.toFixed(2))),
    visibility: Math.max(0, Number(visibility.toFixed(2))),
    windDirection,
    weatherPhenomenon,
  };
};

export const METEOROLOGY_HOURLY_DATA: MeteorologyHourlyRecord[] = [];

