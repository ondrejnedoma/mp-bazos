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

const phoneModel = z.object({
  model: z.enum(mpData.map((item) => item.model)).nullable(),
});

const extractPrices = async () => {
  console.log("Extracting prices...");
  const ads = await getBazosAds();
  const allPhoneModels = z.object({
    data: z.array(phoneModel).length(ads.length),
  });
  const prompt = `${ads.map((el, i) => `LISTING ${i + 1}: ${el.title} ${el.description.replace(/(?:\r\n|\r|\n)+/g, " ")}`).join("\n\n")}`;
  console.log(prompt);
  const client = new OpenAI();
  const response = await client.responses.parse({
    model: "gpt-5-nano",
    input: [
      {
        role: "system",
        content:
          "Extract offered phone models from marketplace listings, set to null if the detected phone model is not available in the provided enum list or if it's not a phone. If the storage capacity is not specified, select the lowest available one for that model.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    text: {
      format: zodTextFormat(allPhoneModels, "allPhoneModels"),
    },
  });

  const models = response.output_parsed;
  console.log(models);
  const processedExtractedPrices = models.data.map((el, i) => {
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
