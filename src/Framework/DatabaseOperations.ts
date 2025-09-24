import parser from "mssql-connection-string";
import { createConnection } from "mysql";
import { properties } from "./config";
import { GlobalVariablesAPI } from "./bo/GlobalVariablesAPI";
import fs from "fs";

export class DatabaseOperations {

    /**
     * Reads data from the table based on the query and returns a map.
     * 
     * @param [tableName] Test data table name
     * @returns Map<string, string>
     */
    static async getTestData(tableName: string): Promise<Map<string, string>> {
        let testDataMap: Map<string, string> = new Map();
        
        let jsonObject = JSON.parse(fs.readFileSync(`${GlobalVariablesAPI.testDataFilePath}/${process.env.SETUP}_TestData_${process.env.PRODUCT}.json`, "utf-8"));
        
        let tenantSetupObject = jsonObject[`${process.env.SETUP}_${process.env.TENANT}`];

        if (!Object.getOwnPropertyNames(tenantSetupObject).includes(tableName)) {
            console.log(`Table '${tableName}' not found in database`);
        }
        else {
            console.log(`Table '${tableName}' found in database`);
            for (const [key, value] of (Object.entries(tenantSetupObject[tableName]) as [string, string][])) {
                testDataMap.set(key, value);
            }
        }

        console.log(`${tableName} map size --> ${testDataMap.size}`);

        return testDataMap;
    }

    /**
     * Reads data from the module tables and returns a map
     * where inner map is a combination of columnNames(keys) and columnValues(values)
     * wheres the outer map is a combination of module names(key) and inner map.
     * 
     * @param [string] query
     * @returns Map<string,Map<string, string>>
     */
    static async getDataFromModuleTable(): Promise<Map<string,Map<string, string>>> {
        let apiNameSet: Set<string> = new Set();
        GlobalVariablesAPI.apiMap.forEach((value, key) => {
            apiNameSet.add(value.get("Module") as string);
        });

        let testDataMap: Map<string, string> = new Map();
        let moduleDataMap: Map<string, Map<string, string>> = new Map();

        for (const module of apiNameSet) {
            testDataMap = await this.getTestData(`Api_${module}_Data`);
            moduleDataMap.set(module, testDataMap);
        }

        return moduleDataMap;
    }
}