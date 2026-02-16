"use client";

import chroma from "chroma-js";

export default function AdCard({ ad }) {
  const getColor = (buy, sell) => {
    const ratio = (sell - buy) / buy;
    if (ratio === 0) return "#ffffff";
    if (ratio < 0) {
      return chroma.scale(["#ffffff", "#ff0000"]).domain([0, -2])(ratio).hex();
    }
    return chroma.scale(["#ffffff", "#00ff00"]).domain([0, 2])(ratio).hex();
  };
  return (
    <div
      className="border rounded-lg p-4 shadow-md flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-800 transition-colors"
      onClick={() => window.open(ad.link, "_blank")}
    >
      <img
        src={ad.image}
        alt={ad.title}
        className="w-24 object-cover rounded-md "
      />
      <div>
        <h2 className="text-sm lg:text-xl font-semibold">
          {ad.title}
          {ad.isTop && <span className="ml-2 text-red-600">TOP</span>}
        </h2>
        <p className="text-sm lg:text-lg text-gray-100">{ad.description}</p>
        <p className="text-blue-300 font-bold">{ad.price}</p>
        {ad.assumedModel && (
          <p className="text-xs lg:text-sm text-gray-300 mt-4">
            {ad.assumedModel}
          </p>
        )}
        {ad.mpPrices && (
          <>
            <p style={{ color: getColor(ad.priceInt, ad.mpPrices.A) }}>
              A: {ad.mpPrices.A}
            </p>
            <p style={{ color: getColor(ad.priceInt, ad.mpPrices.B) }}>
              B: {ad.mpPrices.B}
            </p>
            <p style={{ color: getColor(ad.priceInt, ad.mpPrices.C) }}>
              C: {ad.mpPrices.C}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
