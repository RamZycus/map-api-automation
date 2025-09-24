import { ExcelOperations } from "../ExcelOperations";
import { ApiBo } from "./ApiBo";
import { GlobalVariablesAPI } from "./GlobalVariablesAPI";
import { JsonOperations } from "../JsonOperations";
import { DataLoader } from "../DataLoader";

export class ObjectCreation {

    static async getObjectOfApi(apiName: string) {
        if(!GlobalVariablesAPI.apiMap.has(apiName)) {
            throw new Error(`Api '${apiName}' not found in metadata sheet`);
        }

        let map = GlobalVariablesAPI.apiMap.get(apiName) as Map<string, string>;

        GlobalVariablesAPI.apiBo = new ApiBo();
        GlobalVariablesAPI.apiBo.apiIdentifier = apiName;
        GlobalVariablesAPI.apiBo.apiDescription = (map.get("API Description") as string).trim();
        GlobalVariablesAPI.apiBo.module = (map.get("Module") as string).trim();
        GlobalVariablesAPI.apiBo.endpoint = (map.get("EndPoint") as string).trim();
        GlobalVariablesAPI.apiBo.method = (map.get("Method(get/post/delete)") as string).trim();
        GlobalVariablesAPI.apiBo.formData = (map.get("Request With Form Data") as string).toLowerCase().trim() === "yes";

        GlobalVariablesAPI.apiBo.headerParams = await this.getHeaders(map.get("Header Params") as string);

        GlobalVariablesAPI.apiBo.formDataFile = await this.getFormDataFileParams(map.get("Files To Attach") as string);

        return GlobalVariablesAPI.apiBo;
    }


    static async getHeaders(headerParams: string) {
        let obj: any = {};

        if(headerParams) {
            let headerParamsArray = headerParams.trim().split("\n");
            for(let i = 0; i < headerParamsArray.length; i++) {
                let keyValueArray = headerParamsArray[i].split(":");
                obj[keyValueArray[0]] = keyValueArray[1];
            }
        }

        return obj;
    }

    static async getFormDataFileParams(formDataFileParams: string) {
        let obj: any = {};

        if(formDataFileParams && formDataFileParams.toLowerCase() !== "no") {
            let fileParamArray = formDataFileParams.trim().split("\n");
            for(let i = 0; i < fileParamArray.length; i++) {
                if(!fileParamArray[i].includes(":")) {
                    throw new Error(`File key and path should be separated by ':' (eg.'file:test123.pdf')\nCurrent file path passed '${fileParamArray[i]}'`);
                }
                let keyValueArray = fileParamArray[i].split(":");
                obj[keyValueArray[0]] = keyValueArray[1];
            }
        }

        return obj;
    }
}