"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Line } from "recharts";

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
import { useTranslations } from "next-intl";

const makeData = (m: string[]) => [
  { month: m[0], publications: 18 },
  { month: m[1], publications: 22 },
  { month: m[2], publications: 24 },
  { month: m[3], publications: 28 },
  { month: m[4], publications: 30 },
  { month: m[5], publications: 27 },
  { month: m[6], publications: 25 },
  { month: m[7], publications: 29 },
  { month: m[8], publications: 35 },
  { month: m[9], publications: 38 },
  { month: m[10], publications: 40 },
  { month: m[11], publications: 45 },
];

const PRIMARY_COLOR = "#6366f1"; // indigo-500

const chartConfig = (label: string) => ({
  publications: {
    label,
    color: PRIMARY_COLOR,
  },
}) as const;

export const PublicationsTrendWidget: React.FC = () => {
  const t = useTranslations();
  const months = [
    t("science.months.0"),
    t("science.months.1"),
    t("science.months.2"),
    t("science.months.3"),
    t("science.months.4"),
    t("science.months.5"),
    t("science.months.6"),
    t("science.months.7"),
    t("science.months.8"),
    t("science.months.9"),
    t("science.months.10"),
    t("science.months.11"),
  ];
  const data = makeData(months);
  const label = t("science.publications.seriesLabel");
  return (
    <Card className="bg-gradient-to-b from-white to-sky-50/40">
      <CardHeader>
        <CardTitle>{t("science.publications.title")}</CardTitle>
        <CardDescription>{t("science.publications.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig(label)}
          className="h-72 max-w-[760px] mx-auto"
        >
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              label={{
                value: t("science.publications.yAxis"),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillPublications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY_COLOR} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={PRIMARY_COLOR}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="publications"
              type="monotone"
              stroke={PRIMARY_COLOR}
              fill="url(#fillPublications)"
            />
            <Line
              dataKey="publications"
              type="monotone"
              stroke={PRIMARY_COLOR}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PublicationsTrendWidget;
