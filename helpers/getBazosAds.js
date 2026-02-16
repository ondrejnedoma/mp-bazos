import * as cheerio from "cheerio";

const bannedKeyworks = [
  "hodinky",
  "tablet",
  "ipad",
  "pencil",
  "airpods",
  "nokia",
  "aligator",
  "huawei",
  "lenovo",
  "sony",
  "asus",
  "infinix",
  "niceboy",
  "LG",
  "apple watch",
  "sběratel",
  "retro",
  "senior",
];

export default async function getBazosAds() {
  let ads = [];
  for (let i = 0; ads.length < 10; i += 20) {
    const bazosPageRequest = await fetch("https://mobil.bazos.cz/" + i + "/", {
      next: { revalidate: 300 },
    });
    const bazosPage = await bazosPageRequest.text();
    const $ = cheerio.load(bazosPage);
    ads.push(
      ...$(".inzeraty.inzeratyflex")
        .map((i, el) => {
          const price = $(el).find("div.inzeratycena").text().trim();
          const priceInt = parseInt(price.split(" ").slice(0, -1).join(""));
          const ad = {
            title: $(el).find("h2.nadpis").text(),
            description: $(el).find("div.popis").text(),
            isTop: $(el).find("span.ztop").text() === "TOP",
            link: "https://mobil.bazos.cz" + $(el).find("a").attr("href"),
            price,
            priceInt,
            image: $(el).find("img.obrazek").attr("src"),
          };
          const titleAndDescription = (
            ad.title +
            " " +
            ad.description
          ).toLowerCase();
          if (
            !ad.isTop &&
            !bannedKeyworks.some((keyword) =>
              titleAndDescription.includes(keyword),
            ) &&
            ad.image !== "https://www.bazos.cz/obrazky/empty.gif" &&
            ad.priceInt !== 1
          ) {
            return ad;
          }
        })
        .toArray(),
    );
  }
  return ads;
}
