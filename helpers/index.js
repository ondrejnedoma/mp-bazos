import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const mpData = JSON.parse(fs.readFileSync("mp.json", "utf-8"));

const phoneStatus = z.object({
  model: z.enum(mpData.map((item) => item.model)).nullable(),
  condition: z.enum(["A", "B", "C", "D"]),
});
const allPhoneStatuses = z.array(phoneStatus);

const client = new OpenAI();

const response = await client.responses.parse({
  model: "gpt-5-nano",
  input: [
    {
      role: "system",
      content:
        "Extract the phones' information. Model: Choose the model of the described phone from the enum options you are provided as accurately as possible, if it's not in the enum list, return null, if the storage capacity is not specified, select the lowest available one for that model. Condition: A - excelent, B - light scratches, C - deep groves, D - cracked or needs repair. If unsure, choose C. If the battery condition is specified and it's less than 80%, choose D regardless of other factors.",
    },
    {
      role: "user",
      content: ``,
    },
  ],
  text: {
    format: zodTextFormat(phoneStatus, "event"),
  },
});

const event = response.output_parsed;
console.log(event);
