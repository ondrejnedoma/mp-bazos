"use client";

import React from "react";

export default function PriceExtractor() {
  const onClick = async () => {
    const response = await fetch("/api/extract-prices", {
      method: "POST",
    });
    alert(response.status);
  };
  return (
    <button
      className="bg-green-600 rounded-lg p-4 text-center font-semibold hover:bg-green-700 cursor-pointer"
      onClick={onClick}
    >
      Call MP.cz AI Price Extractor
    </button>
  );
}
