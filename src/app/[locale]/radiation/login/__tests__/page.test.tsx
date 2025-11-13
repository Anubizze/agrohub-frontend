import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import React from "react";

import RadiationLoginPage from "../page";

type MockTranslate = ((key: string) => string) & {
  raw: (key: string) => unknown;
};

const mockTranslations: Record<string, string> = {
  "radiation.login.article.title": "mock_title",
  "radiation.login.article.subtitle": "mock_subtitle",
  "radiation.login.article.paragraph1": "mock_p1",
  "radiation.login.article.paragraph2": "mock_p2",
  "radiation.login.article.paragraph3": "mock_p3",
  "radiation.login.article.table.title": "mock_table_title",
  "radiation.login.article.table.columns.product": "mock_col_product",
  "radiation.login.article.table.columns.dose": "mock_col_dose",
  "radiation.login.article.table.columns.before": "mock_col_before",
  "radiation.login.article.table.columns.after": "mock_col_after",
  "radiation.login.title": "mock_login_title",
  "radiation.login.description": "mock_login_desc",
  "radiation.login.loggingIn": "mock_logging_in",
  "radiation.login.login": "mock_login",
  "radiation.login.demoAccess": "mock_demo",
};

const mockRawTranslations: Record<string, unknown> = {
  "radiation.login.article.table.rows": [
    {
      product: "mock_product_1",
      dose: "3–9",
      before: "mock_before",
      after: "mock_after",
    },
    {
      product: "mock_product_2",
      dose: "3–9",
      before: "mock_before",
      after: "mock_after",
    },
    {
      product: "mock_product_3",
      dose: "3–9",
      before: "mock_before",
      after: "mock_after",
    },
    {
      product: "mock_product_4",
      dose: "3–9",
      before: "mock_before",
      after: "mock_after",
    },
  ],
};

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const translate = ((key: string) => mockTranslations[key]) as MockTranslate;
    translate.raw = (key: string) => mockRawTranslations[key];
    return translate;
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@i18/routing", () => ({
  routing: {
    locales: ["ru", "en", "kk"],
    defaultLocale: "ru",
  },
}));

vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({
    Link: () => null,
    redirect: vi.fn(),
    usePathname: () => "",
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
    getPathname: () => "",
  }),
}));

describe("Страница радиационного входа", () => {
  it("отображает информационный блок о стерилизации над формой доступа", () => {
    render(<RadiationLoginPage />);

    const articleTitle = screen.getByRole("heading", {
      name: mockTranslations["radiation.login.article.title"],
      level: 2,
    });

    expect(articleTitle).toBeInTheDocument();
    expect(
      screen.getByText(mockTranslations["radiation.login.article.subtitle"]),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockTranslations["radiation.login.article.paragraph1"]),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockTranslations["radiation.login.article.paragraph2"]),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockTranslations["radiation.login.article.paragraph3"]),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", {
      name: mockTranslations["radiation.login.article.table.title"],
    });

    expect(table).toBeInTheDocument();

    const columnHeaders = within(table).getAllByRole("columnheader");
    expect(columnHeaders.map((header) => header.textContent)).toEqual([
      mockTranslations["radiation.login.article.table.columns.product"],
      mockTranslations["radiation.login.article.table.columns.dose"],
      mockTranslations["radiation.login.article.table.columns.before"],
      mockTranslations["radiation.login.article.table.columns.after"],
    ]);

    const tableRows = within(table).getAllByRole("row").slice(1);
    expect(tableRows).toHaveLength(4);
    expect(
      within(tableRows[0]).getByText(
        (
          mockRawTranslations["radiation.login.article.table.rows"] as Array<{
            product: string;
          }>
        )[0].product,
      ),
    ).toBeInTheDocument();

    const restrictedAccessTitle = screen.getByText(
      mockTranslations["radiation.login.title"],
    );

    // Новый блок должен располагаться выше карточки с ограниченным доступом
    expect(
      articleTitle.compareDocumentPosition(table) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      articleTitle.compareDocumentPosition(restrictedAccessTitle) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

