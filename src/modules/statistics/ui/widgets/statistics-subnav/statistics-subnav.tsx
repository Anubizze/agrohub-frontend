"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/shared/configs/i18/navigation";
import { cn } from "@/shared/lib/utils";

interface StatisticsNavItem {
  href: string;
  key: "meteorology";
}

const STATISTICS_NAV_ITEMS: StatisticsNavItem[] = [
  { href: "/statistics/meteorology", key: "meteorology" },
];

export const StatisticsSubnav = () => {
  const t = useTranslations("statistics.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("title")} className="flex flex-wrap gap-3">
      {STATISTICS_NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-4 py-2 text-sm transition-colors",
              isActive
                ? "bg-[#486284] text-white"
                : "bg-white text-[#486284] border border-[#486284]/30 hover:bg-[#486284]/5"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};

