import { CropPriceStructureCard } from "../components/CropPriceStructureCard";
import { useTranslations } from "next-intl";

const mockCropPriceData = [
  {
    name: "Пшеница",
    insidePrice: "120 000 ₸/т",
    exportPrice: "145 000 ₸/т",
    exportPercentage: "+20.8% экспорт",
  },
  {
    name: "Кукуруза",
    insidePrice: "87 000 ₸/т",
    exportPrice: "105 000 ₸/т",
    exportPercentage: "+20.7% экспорт",
  },
  {
    name: "Подсолнечник",
    insidePrice: "170 000 ₸/т",
    exportPrice: "210 000 ₸/т",
    exportPercentage: "+23.5% экспорт",
  },
  {
    name: "Ячмень",
    insidePrice: "95 000 ₸/т",
    exportPrice: "115 000 ₸/т",
    exportPercentage: "+21.1% экспорт",
  },
];

export const CropPriceStructureView = () => {
  const t = useTranslations();
  const cropNames = [
    t("investments.crops.items.0"),
    t("investments.crops.items.1"),
    t("investments.crops.items.2"),
    t("investments.crops.items.3"),
  ];
  const localized = mockCropPriceData.map((c, i) => ({
    ...c,
    name: cropNames[i],
    exportPercentage: c.exportPercentage.replace("экспорт", t("investments.crops.export")),
  }));
  return (
    <section>
      <h2 className="text-lg font-bold mb-4">{t("investments.crops.title")}</h2>
      <section className="space-y-4">
        {localized.map((item) => (
          <CropPriceStructureCard key={item.name} {...item} />
        ))}
      </section>
    </section>
  );
};
