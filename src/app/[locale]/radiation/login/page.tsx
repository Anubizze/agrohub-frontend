"use client";

import { Lock, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/shared/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

type RadiationTableRow = {
  product: string;
  dose: string;
  before: string;
  after: string;
};

/**
 * Страница входа для специалистов экологического мониторинга
 * Простой доступ по кнопке без регистрации
 */
export default function RadiationLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Имитация задержки входа
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Сохраняем состояние авторизации в localStorage
    localStorage.setItem("radiation_access", "granted");
    localStorage.setItem("radiation_user", "Специалист");
    
    // Перенаправляем на страницу мониторинга
    router.push("/radiation");
  };

  const articleParagraphs = [
    t("radiation.login.article.paragraph1"),
    t("radiation.login.article.paragraph2"),
    t("radiation.login.article.paragraph3"),
  ];

  const tableRows = (t.raw("radiation.login.article.table.rows") as RadiationTableRow[]) ?? [];
  const tableColumns = {
    product: t("radiation.login.article.table.columns.product"),
    dose: t("radiation.login.article.table.columns.dose"),
    before: t("radiation.login.article.table.columns.before"),
    after: t("radiation.login.article.table.columns.after"),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 lg:px-12">
        <section className="grid gap-12 text-gray-900 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start lg:gap-14 lg:pl-0">
          <div className="space-y-6 lg:pr-6">
            <h2 className="text-[2.3rem] font-bold leading-tight text-gray-900 sm:text-[2.6rem]">
              {t("radiation.login.article.title")}
            </h2>
            <p className="text-base font-semibold text-red-700 sm:text-lg">
              {t("radiation.login.article.subtitle")}
            </p>
            <div className="space-y-5 text-[0.95rem] leading-relaxed text-gray-700 sm:text-base">
              {articleParagraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph}`}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-2xl font-semibold text-slate-900 sm:text-[1.55rem]">
              {t("radiation.login.article.table.title")}
            </h3>
            <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-[0_18px_35px_-25px_rgba(15,23,42,0.4)] sm:p-6 [&_[data-slot=table-container]]:overflow-hidden [&_[data-slot=table-container]]:rounded-2xl [&_[data-slot=table-container]]:border [&_[data-slot=table-container]]:border-slate-300 [&_[data-slot=table-head]]:border [&_[data-slot=table-head]]:border-slate-300 [&_[data-slot=table-cell]]:border [&_[data-slot=table-cell]]:border-slate-300 [&_[data-slot=table]]:w-full [&_[data-slot=table]]:min-w-full">
              <Table
                aria-label={t("radiation.login.article.table.title")}
                className="table-auto border-collapse text-sm sm:text-base"
              >
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="px-5 py-3 text-left text-slate-700 whitespace-normal font-semibold">
                      {tableColumns.product}
                    </TableHead>
                    <TableHead className="px-5 py-3 text-center text-slate-700 whitespace-normal font-semibold">
                      {tableColumns.dose}
                    </TableHead>
                    <TableHead className="px-5 py-3 text-center text-slate-700 whitespace-normal font-semibold">
                      {tableColumns.before}
                    </TableHead>
                    <TableHead className="px-5 py-3 text-center text-slate-700 whitespace-normal font-semibold">
                      {tableColumns.after}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row, index) => (
                    <TableRow
                      key={`${row.product}-${row.dose}`}
                      className={`last:[&_td]:border-b-0 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                    >
                      <TableCell className="px-5 py-3 font-medium text-slate-900 whitespace-normal break-words">
                        {row.product}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center text-slate-800 whitespace-normal">
                        {row.dose}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center text-slate-800 whitespace-normal">
                        {row.before}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-center font-semibold text-emerald-600 whitespace-normal">
                        {row.after}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        <div className="flex justify-center lg:justify-start">
          <Button
            asChild
            className="rounded-full bg-slate-900 px-8 py-6 text-base font-semibold tracking-wide hover:bg-slate-800"
          >
            <Link href="#research">
              {t("radiation.login.article.cta")}
            </Link>
          </Button>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardHeader className="p-4 text-center sm:p-6">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 sm:mb-4 sm:h-12 sm:w-12">
                <Shield className="h-5 w-5 text-red-600 sm:h-6 sm:w-6" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 sm:text-2xl">
                {t("radiation.login.title")}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t("radiation.login.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 text-center sm:p-6">
              <Button
                onClick={handleLogin}
                className="w-full bg-red-600 text-sm sm:text-base"
                disabled={isLoading}
              >
                <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {isLoading ? t("radiation.login.loggingIn") : t("radiation.login.login")}
              </Button>
              <p className="mt-4 text-xs text-gray-500">* {t("radiation.login.demoAccess")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
