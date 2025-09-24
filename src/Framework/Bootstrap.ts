import { DatabaseOperations } from "./DatabaseOperations";
import { properties } from "./config.js";
import { GlobalVariablesAPI } from "./bo/GlobalVariablesAPI";
import { ExcelOperations } from "./ExcelOperations";

export async function bootstrap() {
   
   
    GlobalVariablesAPI.apiMap = await ExcelOperations.getApiMap(GlobalVariablesAPI.apiMetaDataSheetPath);

    let columnName = `${process.env.SETUP}_${process.env.TENANT}`;
    let query = `SELECT FIELD_NAME, ${columnName} FROM ${properties.globalDataTable}`;
    GlobalVariablesAPI.globalDataMap = await DatabaseOperations.getTestData(properties.globalDataTable);
    
    //GlobalVariablesAPI.moduleDataMap = await DatabaseOperations.getDataFromModuleTable(); 
}

export async function teardown() {

}