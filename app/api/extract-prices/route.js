import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { promises as fs } from "fs";
import dotenv from "dotenv";
import getBazosAds from "@/app/getBazosAds";
import path from "path";
dotenv.config();

const mpData = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "app/mp.json"), "utf-8"),
);

const phoneStatus = z.object({
  model: z.enum(mpData.map((item) => item.model)).nullable(),
});

const extractPrices = async () => {
  console.log("Extracting prices...");
  const ads = await getBazosAds();
  const allPhoneStatuses = z.object({
    data: z.array(phoneStatus).length(ads.length),
  });
  const client = new OpenAI();
  const response = await client.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: `Choose the model of each described phone from the enum options you are provided as accurately as possible, if it's not in the enum list or it's not a phone, return null, if the storage capacity is not specified, select the lowest available one for that model.`,
      },
      {
        role: "user",
        content: `Extract phone information for each ad in the following list of ads:

${ads.map((el, i) => `LISTING ${i + 1}: ${el.title} - ${el.description}`).join("\n\n")}`,
      },
    ],
    text: {
      format: zodTextFormat(allPhoneStatuses, "event"),
    },
  });

  const event = response.output_parsed;
  console.log(event);
  const processedExtractedPrices = event.data.map((el, i) => {
    if (el.model === null) {
      return {};
    }
    const mpModelData = mpData.find((item) => item.model === el.model);
    return {
      link: ads[i].link,
      model: el.model,
      prices: mpModelData.prices,
    };
  });
  await fs.writeFile(
    path.join(process.cwd(), "app/extractedData.json"),
    JSON.stringify(processedExtractedPrices),
  );
};

export async function POST() {
  extractPrices();
  return Response.json({ status: 200 });
}
