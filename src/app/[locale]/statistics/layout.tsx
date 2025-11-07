import type { ReactNode } from "react";

import { StatisticsSubnav } from "@/modules/statistics";

export default function StatisticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="bg-slate-50 py-8">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 xl:px-0">
        <StatisticsSubnav />
        <div>{children}</div>
      </div>
    </section>
  );
}

