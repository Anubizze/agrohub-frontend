import { routing } from "@i18/routing";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";

import { Footer, Header } from "@/shared/components";
import { Toaster } from "@/shared/components/ui";
import { QueryProvider } from "@/shared/providers";

import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroHub — платформа сельского хозяйства Абайской области",
  description:
    "Цифровая платформа для развития сельского хозяйства Абайской области",
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Явно импортируем словари по параметру локали, чтобы исключить авто-детеκт
  const messages = (await import("../../../messages/" + locale + ".json")).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </QueryProvider>
      <Toaster richColors closeButton />
        </NextIntlClientProvider>
  );
}
