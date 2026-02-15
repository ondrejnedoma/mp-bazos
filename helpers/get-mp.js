import * as fs from "fs"

if (!fs.existsSync("mp.json")) {
    fs.writeFileSync("mp.json", "[]")
}

const manufecturersRequest = await fetch("https://www.mp.cz/api/new/buyout/product-selector/manufacturers/telefony/")
const manufecturersBody = await manufecturersRequest.json()
for (const manufecturer of manufecturersBody) {
    const metaMastersRequest = await fetch("https://www.mp.cz/api/new/buyout/product-selector/meta-masters/telefony/" + manufecturer.seo_name + "/")
    const metaMastersBody = await metaMastersRequest.json()
    for (const metaMaster of metaMastersBody.meta_masters) {
        const attrChoicesRequest = await fetch("https://www.mp.cz/api/new/buyout/product-selector/attr-choices/" + metaMaster.seo_name + "/")
        const attrChoicesBody = await attrChoicesRequest.json()
        for (const attrChoice of attrChoicesBody.attr_values) {
            const colorChoicesRequest = await fetch("https://www.mp.cz/api/new/buyout/product-selector/color-choices/" + attrChoice.master_product.seo_name + "/")
            const colorChoicesBody = await colorChoicesRequest.json()
            for (const colorChoice of colorChoicesBody) {
                const qualitiesRequest = await fetch("https://www.mp.cz/api/new/buyout/product-selector/qualities/" + colorChoice.seo_name + "/")
                let qualitiesBody = await qualitiesRequest.json()
                let startIndex = 0
                if (qualitiesBody[0].quality.short_name === "A+") {
                    qualitiesBody.shift()
                }
                if (qualitiesBody[qualitiesBody.length - 1].quality.short_name === "D") {
                    qualitiesBody.pop()
                }
                let prices = {}
                for (const quality of qualitiesBody) {
                    prices[quality.quality.short_name] = parseInt(quality.price)
                }
                const result = {model: colorChoice.name, prices}
                console.log(result)
                const existingData = JSON.parse(fs.readFileSync("mp.json", "utf-8"))
                const existingIndex = existingData.findIndex((item) => item.model === result.model)
                if (existingIndex !== -1) {
                    existingData.splice(existingIndex, 1)
                }
                existingData.push(result)
                fs.writeFileSync("mp.json", JSON.stringify(existingData, null, 2))
            }
        }
    }
}