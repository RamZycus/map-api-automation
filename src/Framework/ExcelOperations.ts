import {Workbook, Row, Cell, Worksheet} from "exceljs";

export class ExcelOperations {

    /**
     * Reads the api metadata excel sheet based on the path passed as argument.
     * and returns a map of maps where inner map is a combination of columnNames(keys) and columnValues(values)
     * wheres the outer map is a combination of apiName(key) and inner map.
     * 
     * eg.
     * ```js
     * await ExcelOperations.getApiMap("./Resources/Api_List.xlsx");
     * ```
     * 
     * @param [string] apiName
     * @returns Map<string, Map<string, string>>
     */
    static async getApiMap(filePath: string) {
        let apiMap: Map<string, Map<string, string>> = new Map();

        let workbook: Workbook = new Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        
        let sheetName = `${process.env.SETUP}_${process.env.TENANT}`;
        let worksheet: Worksheet | undefined = workbook.getWorksheet(sheetName);
        if(!worksheet) {
            worksheet = workbook.getWorksheet(1);
            if(!worksheet) {
                throw new Error(`No sheet present in the metadata file`);
            }
        }

        console.log(`Reading metadata from '${worksheet.name}' sheet`);
        
        let rowCount = worksheet.rowCount;
        // console.log(`rowCount ${rowCount}`);
        
        let columnCount = worksheet.columnCount;
        // console.log(`columnCount ${columnCount}`);

        await worksheet.eachRow((row, rowNumber) => {
            let rowMap: Map<string, string> = new Map();
            if(rowNumber > 1) {
                for(let i = 2; i <= columnCount; i++) {
                    let columnName = worksheet.getRow(1).getCell(i).value as string;
                    let columnValue = row.getCell(i).value as string;
                    rowMap.set(columnName, columnValue);
                }
                let apiName = row.getCell(1).value as string;
                apiMap.set(apiName, rowMap);
            }
        });

        console.log(`Api metadata map size --> ${apiMap.size}`);
        return apiMap;

    }

    static async getExcelTestData(fileName: string, directoryPath: string) {
        let filePath = `${directoryPath}/${fileName}.xlsx`;
        let testDataMap: Map<string, Map<string, string>> = new Map();

        let workbook: Workbook = new Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        
        let worksheet: Worksheet | undefined = await workbook.getWorksheet("TestData");
        if (!worksheet) {
            throw new Error("TestData worksheet not found");
        }
        if(!worksheet) {
            throw new Error(`Test data sheet should have records kept in sheet named as 'TestData'`);
        }
        
        let rowCount = worksheet.rowCount;
        
        let columnCount = worksheet.columnCount;

        await worksheet.eachRow((row, rowNumber) => {
            let rowMap: Map<string, string> = new Map();
            if(rowNumber > 1) {
                for(let i = 1; i <= columnCount; i++) {
                    let columnName = worksheet.getRow(1).getCell(i).value as string;
                    let columnValue = row.getCell(i).value as string;
                    rowMap.set(columnName, columnValue);
                }
                let uniqueKey = row.getCell(1).value as string;              
                testDataMap.set(uniqueKey, rowMap);
            }
        });

        console.log(`Test data map size --> ${testDataMap.size}`);
        return testDataMap;

    }
    static async getExcelTestDataBasedOnSetUp(fileName: string, directoryPath: string) {
        let filePath = `${directoryPath}/${fileName}.xlsx`;
        let testDataMap: Map<string, Map<string, string>> = new Map();

        let workbook: Workbook = new Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        
        let worksheet: Worksheet | undefined = await workbook.getWorksheet("TestData");
        if (!worksheet) {
            throw new Error("TestData worksheet not found");
        }
        if(!worksheet) {
            throw new Error(`Test data sheet should have records kept in sheet named as 'TestData'`);
        }
        
        let rowCount = worksheet.rowCount;
        
        let columnCount = worksheet.columnCount;

        await worksheet.eachRow((row, rowNumber) => {
            let rowMap: Map<string, string> = new Map();
            if(rowNumber > 1) {
                for(let i = 2; i <= columnCount; i++) {
                    let columnName = worksheet.getRow(1).getCell(i).value as string;
                    let columnValue = row.getCell(i).value as string;
                    rowMap.set(columnName, columnValue);
                }
                let uniqueKey = row.getCell(1).value as string+'_'+row.getCell(2).value as string;              
                testDataMap.set(uniqueKey, rowMap);
            }
        });

        console.log(`Test data map size --> ${testDataMap.size}`);
        return testDataMap;
    }
}