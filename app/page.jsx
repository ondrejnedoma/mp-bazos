import * as cheerio from "cheerio";
import Link from "next/link";

  export default async function Home({ searchParams }) {
  const page = parseInt((await searchParams).page) || 1;
  let navigationPageNumbers = [1]
  for (let i = page - 5; i <= page + 5; i++) {
    if (i > 1) {
      navigationPageNumbers.push(i);
    }
  }

  const bazosPageRequest = await fetch("https://mobil.bazos.cz/" + (page - 1) * 20, {
    cache: "no-store",
  });
  const bazosPage = await bazosPageRequest.text();
  const $ = cheerio.load(bazosPage);
  const ads = $(".inzeraty.inzeratyflex")
    .map((i, el) => {
      return {
        title: $(el).find("h2.nadpis").text(),
        description: $(el).find("div.popis").text(),
        isTop: $(el).find("span.ztop").text() === "TOP",
        price: $(el).find("div.inzeratycena").text().trim(),
        image: $(el).find("img.obrazek").attr("src"),
      };
    })
    .toArray();
  return (
    <div className="w-full p-4 flex flex-col gap-4">
      {ads.map((ad, index) => (
        <div key={index} className="border rounded-lg p-4 shadow-md flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-600">
          <img src={ad.image} alt={ad.title} className="w-24 object-cover rounded-md " />
          <div>
            <h2 className="text-sm lg:text-xl font-semibold">{ad.title}{ad.isTop && <span className="ml-2 text-red-600">TOP</span>}</h2>
            <p className="text-sm lg:text-lg text-gray-100">{ad.description}</p>
            <p className="text-green-600 font-bold">{ad.price}</p>
          </div>
        </div>
      ))}
      <div className="flex flex-row gap-2 my-4 w-full justify-between">
        {navigationPageNumbers.map((pageNumber) => (
          <Link key={pageNumber} href={`?page=${pageNumber}`} className={"hover:underline " + (pageNumber === page ? "font-bold" : "text-gray-400")}>
            {pageNumber}
          </Link>
        ))}
      </div>
    </div>
  );
}