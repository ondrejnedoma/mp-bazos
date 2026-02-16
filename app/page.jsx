import AdCard from "./AdCard";
import JobButton from "./JobButton";
import getBazosAds from "@/helpers/getBazosAds";
import { promises as fs } from "fs";
import path from "path";

export default async function Home() {
  const ads = await getBazosAds();
  const extractedPricesData = await fs.readFile(
    path.join(process.cwd(), "cache/extractedPrices.json"),
    "utf-8",
  );
  const adsWithMpPrices = ads.map((ad) => {
    const extractedData = JSON.parse(extractedPricesData).find(
      (item) => item.link === ad.link,
    );
    const assumedModel = extractedData ? extractedData.model : null;
    const mpPrices = extractedData ? extractedData.prices : null;
    const cRatio = mpPrices ? (mpPrices.C - ad.priceInt) / ad.priceInt : 0;
    return { ...ad, assumedModel, mpPrices, cRatio };
  });
  adsWithMpPrices.sort((a, b) => b.cRatio - a.cRatio);
  return (
    <div className="w-full p-4 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <JobButton
          className="bg-indigo-600 hover:bg-indigo-700"
          endpoint="update-catalogue"
          buttonText="Update mp.cz price catalogue"
        />
        <JobButton
          className="bg-emerald-600 hover:bg-emerald-700"
          endpoint="extract-prices"
          buttonText="Extract mp.cz Bazoš prices"
        />
      </div>
      {adsWithMpPrices.map((ad, index) => (
        <AdCard key={index} ad={ad} />
      ))}
    </div>
  );
}
