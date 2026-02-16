const jobId = "update-catalogue";
import * as fs from "fs";
import path from "path";
import { getJobStatus, setJobStatus } from "@/helpers/jobStatusManager";

const updateCatalogue = async () => {
  try {
    setJobStatus(jobId, "running");
    console.log("Updating catalogue...");
    let allModels = [];
    const manufecturersRequest = await fetch(
      "https://www.mp.cz/api/new/buyout/product-selector/manufacturers/telefony/",
    );
    const manufecturersBody = await manufecturersRequest.json();
    for (const manufecturer of manufecturersBody) {
      const metaMastersRequest = await fetch(
        "https://www.mp.cz/api/new/buyout/product-selector/meta-masters/telefony/" +
          manufecturer.seo_name +
          "/",
      );
      const metaMastersBody = await metaMastersRequest.json();
      for (const metaMaster of metaMastersBody.meta_masters) {
        const attrChoicesRequest = await fetch(
          "https://www.mp.cz/api/new/buyout/product-selector/attr-choices/" +
            metaMaster.seo_name +
            "/",
        );
        const attrChoicesBody = await attrChoicesRequest.json();
        for (const attrChoice of attrChoicesBody.attr_values) {
          const model = attrChoice.master_product.name;
          const colorChoicesRequest = await fetch(
            "https://www.mp.cz/api/new/buyout/product-selector/color-choices/" +
              attrChoice.master_product.seo_name +
              "/",
          );
          const colorChoicesBody = await colorChoicesRequest.json();
          const qualitiesRequest = await fetch(
            "https://www.mp.cz/api/new/buyout/product-selector/qualities/" +
              colorChoicesBody[0].seo_name +
              "/",
          );
          let qualitiesBody = await qualitiesRequest.json();
          if (qualitiesBody[0].quality.short_name === "A+") {
            qualitiesBody.shift();
          }
          if (
            qualitiesBody[qualitiesBody.length - 1].quality.short_name === "D"
          ) {
            qualitiesBody.pop();
          }
          let prices = {};
          for (const quality of qualitiesBody) {
            prices[quality.quality.short_name] = parseInt(quality.buying_price);
          }
          const result = { model, prices };
          console.log(result);
          allModels.push(result);
        }
      }
    }
    fs.writeFileSync(
      path.join(process.cwd(), "cache/mp.json"),
      JSON.stringify(allModels),
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
  updateCatalogue();
  return Response.json({ message: "Job started" });
}
