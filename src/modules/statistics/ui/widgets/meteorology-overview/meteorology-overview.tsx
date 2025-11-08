import type { LucideIcon } from "lucide-react";
import { CloudRain, Thermometer } from "lucide-react";
import { memo } from "react";

export interface MeteorologyOverviewLabels {
  temperature: string;
  precipitation: string;
  airHumidity: string;
  soilMoisture: string;
  optimal: string;
  lastYear: string;
}

export interface MeteorologyOverviewUnits {
  temperature: string;
  precipitation: string;
  humidity: string;
}

export interface MeteorologyRegionMetric {
  value: number;
  optimal: number;
  lastYear: number;
}

export interface MeteorologyRegionData {
  name: string;
  temperature: MeteorologyRegionMetric;
  precipitation: MeteorologyRegionMetric;
  airHumidity: number;
  soilMoisture: number;
}

export interface MeteorologyOverviewProps {
  title: string;
  subtitle: string;
  yearLabel: string;
  labels: MeteorologyOverviewLabels;
  units: MeteorologyOverviewUnits;
  regions: MeteorologyRegionData[];
}

export const MeteorologyOverview = memo(
  ({ title, subtitle, yearLabel, labels, units, regions }: MeteorologyOverviewProps) => {
    return (
      <section className="flex flex-col gap-6">
        <header className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f2a37] md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-3xl text-base text-[#4b5563]">{subtitle}</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-[#486284] bg-white px-4 py-2 text-sm font-medium text-[#486284] shadow-sm hover:bg-[#486284]/5"
          >
            {yearLabel}
          </button>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          {regions.map((region) => (
            <article
              key={region.name}
              className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#1f2a37]">
                {region.name}
              </h2>
              <section className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  title={labels.temperature}
                  metric={region.temperature}
                  unit={units.temperature}
                  labels={labels}
                  Icon={Thermometer}
                  accentColor="#de4c4c"
                />
                <MetricCard
                  title={labels.precipitation}
                  metric={region.precipitation}
                  unit={units.precipitation}
                  labels={labels}
                  Icon={CloudRain}
                  accentColor="#375e95"
                />
              </section>
              <div className="grid gap-2 text-sm text-[#4b5563] md:grid-cols-2">
                <SimpleMetric
                  label={labels.airHumidity}
                  value={region.airHumidity}
                  unit={units.humidity}
                />
                <SimpleMetric
                  label={labels.soilMoisture}
                  value={region.soilMoisture}
                  unit={units.humidity}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }
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
}

const SimpleMetric = ({ label, value, unit }: SimpleMetricProps) => {
  return (
    <p className="text-sm text-[#4b5563]">
      <span className="font-medium text-[#1f2a37]">{label}</span>: {value}
      <span className="ml-1 text-[#6b7280]">{unit}</span>
    </p>
  );
};

