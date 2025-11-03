import { useTranslations } from "next-intl";

import { Badge } from "@/shared/components/ui";

interface CropPriceStructureCardProps {
  name: string;
  insidePrice: string;
  exportPrice: string;
  exportPercentage: string;
}
export const CropPriceStructureCard = ({
  name,
  insidePrice,
  exportPrice,
  exportPercentage,
}: CropPriceStructureCardProps) => {
  const t = useTranslations();
  return (
    <section className="border rounded-xl p-4">
      <div className="flex justify-between items-center">
        <h3>{name}</h3>
        <Badge variant={"low"}>{exportPercentage}</Badge>
      </div>
      <section className="flex   gap-[30%]">
        <div>
          <span className="text-sm text-gray-500">{t("investments.crops.inside")}</span>
          <p>{insidePrice}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">{t("investments.crops.exportLabel")}</span>
          <p>{exportPrice}</p>
        </div>
      </section>
    </section>
  );
};
