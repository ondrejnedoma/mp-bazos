"use client";

export default function AdCard({ ad }) {
  return (
    <div
      className="border rounded-lg p-4 shadow-md flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-600"
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
        <p className="text-green-600 font-bold">{ad.price}</p>
        <p>A: </p>
        <p>B: </p>
        <p>C: </p>
      </div>
    </div>
  );
}
