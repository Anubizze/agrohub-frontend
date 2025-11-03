"use client";

import React from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Progress } from "@/shared/components/ui/progress";
import { useTranslations } from "next-intl";

const makeData = (t: (k: string) => string) => [
  { name: t("science.fields.crop"), value: 42, fill: "#10b981" },
  { name: t("science.fields.livestock"), value: 28, fill: "#f59e0b" },
  { name: t("science.fields.agrotech"), value: 15, fill: "#3b82f6" },
  { name: t("science.fields.eco"), value: 10, fill: "#14b8a6" },
  { name: t("science.fields.soil"), value: 5, fill: "#6b7280" },
];

const chartConfig = {
  crop: { label: "crop", color: "#10b981" },
  livestock: { label: "livestock", color: "#f59e0b" },
  agrotech: { label: "agrotech", color: "#3b82f6" },
  eco: { label: "eco", color: "#14b8a6" },
  soil: { label: "soil", color: "#6b7280" },
} as const;

export const ResearchFieldsDistributionWidget: React.FC = () => {
  const t = useTranslations();
  const data = makeData(t);
  return (
    <Card className="bg-gradient-to-b from-white to-emerald-50/40">
      <CardHeader>
        <CardTitle>{t("science.fields.title")}</CardTitle>
        <CardDescription>{t("science.fields.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] items-center gap-8">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[260px] flex items-center justify-center"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                strokeWidth={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="space-y-3 w-full">
            {data.map((d) => (
              <div
                key={d.name}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-sm text-foreground">{d.name}</span>
                </div>
                <Progress
                  value={d.value}
                  className="h-2 bg-muted"
                  progressStyles="!bg-current"
                  style={{ color: d.fill }}
                />
                <span className="text-sm font-medium tabular-nums">
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchFieldsDistributionWidget;
