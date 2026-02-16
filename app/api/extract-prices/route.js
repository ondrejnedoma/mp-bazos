const jobId = "extract-prices";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { promises as fs } from "fs";
import dotenv from "dotenv";
import getBazosAds from "@/helpers/getBazosAds";
import path from "path";
import { getJobStatus, setJobStatus } from "@/helpers/jobStatusManager";
dotenv.config();

const extractPrices = async () => {
  try {
    setJobStatus(jobId, "running");
    console.log("Extracting prices...");
    const mpData = JSON.parse(
      await fs.readFile(path.join(process.cwd(), "cache/mp.json"), "utf-8"),
    );
    const ads = await getBazosAds();
    const previousExtractedPrices = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "cache/extractedPrices.json"),
        "utf-8",
      ),
    );
    const filteredAds = ads.filter(
      (ad) => !previousExtractedPrices.some((item) => item.link === ad.link),
    );
    const phoneModel = z.object({
      model: z.enum(mpData.map((item) => item.model)).nullable(),
    });
    const allPhoneModels = z.object({
      data: z.array(phoneModel).length(filteredAds.length),
    });
    const prompt = `${filteredAds.map((el, i) => `LISTING ${i + 1}: ${el.title} ${el.description.replace(/(?:\r\n|\r|\n)+/g, " ")}`).join("\n\n")}`;
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
        link: filteredAds[i].link,
        model: el.model,
        prices: mpModelData.prices,
      };
    });
    const updatedExtractedPrices = [
      ...previousExtractedPrices,
      ...processedExtractedPrices,
    ];
    await fs.writeFile(
      path.join(process.cwd(), "cache/extractedPrices.json"),
      JSON.stringify(updatedExtractedPrices),
    );

    setJobStatus(jobId, "idle");
  } catch (error) {
    setJobStatus(jobId, "error", error.message);
  }
};

export async function POST() {
  if (getJobStatus(jobId).status === "running") {
    return Response.json(
      { message: "Job is already running" },
      { status: 400 },
    );
  }
  extractPrices();
  return Response.json({ message: "Job started" });
}
