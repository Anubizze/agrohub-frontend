import { Calculator } from "lucide-react";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui";
import { useTranslations } from "next-intl";

export const ROICalculator = () => {
  const t = useTranslations();
  return (
    <section className="space-y-5">
      <h2 className="flex items-center gap-2">
        <Calculator />
        <span>{t("investments.roi.title")}</span>
      </h2>
      <section className="flex flex-col md:flex-row justify-between gap-6">
        <form className="space-y-3 w-full md:w-1/2">
          <div className="space-y-2">
            <Label>{t("investments.roi.amount")}</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>{t("investments.roi.period")}</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("investments.roi.choosePeriod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("investments.roi.y1")}</SelectItem>
                <SelectItem value="3">{t("investments.roi.y3")}</SelectItem>
                <SelectItem value="5">{t("investments.roi.y5")}</SelectItem>
                <SelectItem value="10">{t("investments.roi.y10")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("investments.roi.sector")}</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("investments.roi.chooseSector")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agriculture">{t("investments.sector.items.0")}</SelectItem>
                <SelectItem value="livestock">{t("investments.sector.items.1")}</SelectItem>
                <SelectItem value="processing">{t("investments.sector.items.2")}</SelectItem>
                <SelectItem value="logistics">{t("investments.sector.items.3")}</SelectItem>
                <SelectItem value="technology">{t("investments.sector.items.4")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("investments.roi.risk")}</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("investments.roi.chooseRisk")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("investments.roi.low")}</SelectItem>
                <SelectItem value="medium">{t("investments.roi.medium")}</SelectItem>
                <SelectItem value="high">{t("investments.roi.high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>{t("investments.roi.calculate")}</Button>
        </form>
        <section className="flex-1 flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold mb-2">{t("investments.roi.results")}</h3>
          <section className="flex flex-col justify-center min-h-52 items-center gap-2">
            <Calculator size={48} className="text-gray-400" />
            <span className="text-gray-400">{t("investments.roi.hint")}</span>
          </section>
        </section>
      </section>
    </section>
  );
};
