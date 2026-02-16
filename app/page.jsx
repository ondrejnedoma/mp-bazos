import AdCard from "./AdCard";
import PriceExtractor from "./PriceExtractor";
import getBazosAds from "./getBazosAds";

export default async function Home() {
  const ads = await getBazosAds();
  return (
    <div className="w-full p-4 flex flex-col gap-4">
      <PriceExtractor />
      {ads.map((ad, index) => (
        <AdCard key={index} ad={ad} />
      ))}
    </div>
  );
}
