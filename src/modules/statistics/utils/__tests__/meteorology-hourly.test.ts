import { describe, expect, it } from "vitest";

import {
  buildHourlySeriesByRegion,
  type MeteorologyHourlyRecord,
} from "../meteorology-hourly";

const buildSample = (
  region: string,
  month: string,
  hourValues: Array<{
    hour: number;
    temperature: number;
    humidity: number;
    precipitation: number;
    soilMoisture: number;
    cloudiness: number;
    pressure: number;
    windSpeed: number;
    visibility: number;
    windDirection: string;
    weatherPhenomenon: string;
  }>,
): MeteorologyHourlyRecord[] =>
  hourValues.map(
    ({
      hour,
      temperature,
      humidity,
      precipitation,
      soilMoisture,
      cloudiness,
      pressure,
      windSpeed,
      visibility,
      windDirection,
      weatherPhenomenon,
    }) => ({
      region,
      timestamp: `2022-${month.padStart(2, "0")}-01T${hour
        .toString()
        .padStart(2, "0")}:00:00Z`,
      temperature,
      precipitation,
      airHumidity: humidity,
      soilMoisture,
      cloudiness,
      pressure,
      windSpeed,
      visibility,
      windDirection,
      weatherPhenomenon,
    }),
  );

describe("Агрегация почасовых метеоданных", () => {
  it("формирует почасовые серии по регионам и месяцам", () => {
    const records: MeteorologyHourlyRecord[] = [
      ...buildSample("Абайский район", "01", [
        {
          hour: 2,
          temperature: -8,
          humidity: 74,
          precipitation: 0.1,
          soilMoisture: 18.2,
          cloudiness: 34,
          pressure: 753,
          windSpeed: 2.8,
          visibility: 5.8,
          windDirection: "восточный",
          weatherPhenomenon: "небольшой снег",
        },
        {
          hour: 5,
          temperature: -10,
          humidity: 76,
          precipitation: 0.15,
          soilMoisture: 18.25,
          cloudiness: 36,
          pressure: 752,
          windSpeed: 3.1,
          visibility: 5.6,
          windDirection: "северо-восточный",
          weatherPhenomenon: "снег",
        },
        {
          hour: 8,
          temperature: -7,
          humidity: 78,
          precipitation: 0.05,
          soilMoisture: 18.3,
          cloudiness: 38,
          pressure: 751,
          windSpeed: 3.3,
          visibility: 5.9,
          windDirection: "восточный",
          weatherPhenomenon: "небольшой снег",
        },
      ]),
      ...buildSample("Абайский район", "02", [
        {
          hour: 2,
          temperature: -5,
          humidity: 68,
          precipitation: 0.0,
          soilMoisture: 18.4,
          cloudiness: 28,
          pressure: 752,
          windSpeed: 1.6,
          visibility: 6,
          windDirection: "юго-восточный",
          weatherPhenomenon: "ясно",
        },
        {
          hour: 5,
          temperature: -4,
          humidity: 69,
          precipitation: 0.0,
          soilMoisture: 18.5,
          cloudiness: 30,
          pressure: 751,
          windSpeed: 1.4,
          visibility: 6.2,
          windDirection: "юго-восточный",
          weatherPhenomenon: "ясно",
        },
      ]),
      ...buildSample("Аксуский район", "01", [
        {
          hour: 2,
          temperature: -7,
          humidity: 65,
          precipitation: 0.4,
          soilMoisture: 17.5,
          cloudiness: 40,
          pressure: 750,
          windSpeed: 3,
          visibility: 5,
          windDirection: "юго-западный",
          weatherPhenomenon: "туман",
        },
      ]),
    ];

    const result = buildHourlySeriesByRegion(records);
    const abaiSeries = result["Абайский район"];
    const seriesJan = abaiSeries["2022-01"];
    const seriesFeb = abaiSeries["2022-02"];

    expect(Object.keys(result)).toEqual(["Абайский район", "Аксуский район"]);
    expect(seriesJan.temperature).toHaveLength(8);
    expect(seriesJan.temperature[0]).toEqual({ period: "02:00", value: -8 });
    expect(seriesJan.temperature[1]).toEqual({ period: "05:00", value: -10 });

    expect(seriesJan.airHumidity[0]).toEqual({ period: "02:00", value: 74 });
    expect(seriesJan.precipitation[0]).toEqual({ period: "02:00", value: 0.1 });
    expect(seriesJan.soilMoisture[0]).toEqual({ period: "02:00", value: 18.2 });
    expect(seriesJan.cloudiness[0]).toEqual({ period: "02:00", value: 34 });
    expect(seriesJan.pressure[0]).toEqual({ period: "02:00", value: 753 });
    expect(seriesJan.windSpeed[0]).toEqual({ period: "02:00", value: 2.8 });
    expect(seriesJan.visibility[0]).toEqual({ period: "02:00", value: 5.8 });
    expect(seriesJan.windDirection[0]).toEqual({
      period: "02:00",
      value: 90,
      label: "восточный",
    });
    expect(seriesJan.weatherPhenomenon[0]).toEqual({
      period: "02:00",
      label: "небольшой снег",
    });

    expect(seriesFeb.temperature[0]).toEqual({ period: "02:00", value: -5 });
    expect(seriesFeb.temperature[1]).toEqual({ period: "05:00", value: -4 });
  });
});

