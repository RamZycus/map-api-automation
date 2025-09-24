import * as fs from "fs";
import { DOMParser, XMLSerializer } from "xmldom";
import { GlobalVariablesAPI } from "./bo/GlobalVariablesAPI";
import FormData = require("form-data");
import { JsonOperations } from "./JsonOperations";

let serializer = new XMLSerializer();

export class FileSystemOperations {

    /**
     * Reads the file based on the name passed as argument from the given directory
     * and returns the json as an object.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.getDefaultJsonBody("postRequisition", "./src/eProc/jsonRepository");
     * ```
     * 
     * @param [apiName] Name of the api
     * @param [apiDirectoryPath] Default json body directory path
     * @returns object
     */
    static async getDefaultJsonBody(apiName: string, apiDirectoryPath: string) {
        apiName = `${apiName}.json`;

        console.log(`Default api directory --> ${apiDirectoryPath}`);

        let path = await this.getFilePath(apiDirectoryPath, apiName) as string;
        if(!path) {
            throw new Error(`File not found under directory ${apiDirectoryPath}`);
        }
        else {
            console.log(`Json file ${apiName} found under directory ${apiDirectoryPath}`);
        }
        
        let defaultJsonObject = JSON.parse(fs.readFileSync(path, "utf-8"));

      //  defaultJsonObject = await JsonOperations.getDefaultJsonBodyWithDatabaseValues(defaultJsonObject);

        return defaultJsonObject;
    }

    /**
     * Reads the file based on the name passed as argument from jsonRepository directory
     * and returns the jsonObject in the from of string.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.getFilePath("./src/jsonRepository", "postRequisition.json");
     * ```
     * 
     * @param [string] directoryPath
     * @param [string] fileName
     * @returns string
     */
    static async getFilePath(directoryPath: string, fileName: string) {
        if(fs.statSync(directoryPath).isDirectory()) {
            let fileArray = fs.readdirSync(directoryPath);
            if(fileArray.includes(fileName)) {
                directoryPath = `${directoryPath}/${fileName}`;
                return directoryPath;
            }

            for(let i = 0; i < fileArray.length; i++) {
                fileArray[i] = `${directoryPath}/${fileArray[i]}`;
                let value = await this.getFilePath(fileArray[i], fileName) as string;
                if(value) {
                    return value;
                }
            }
        }
    }

    /**
     * Dumps the json object to file [apiname]Dump.json under the given directory
     * 
     * eg.
     * ```js
     * await FileSystemOperations.dumpJsonToFile(response.data, "./jsonDumpRepository");
     * ```
     * 
     * @param [object] jsonObject
     * @param [filePath] File path of dump
     */
    static async dumpJsonToFile(jsonObject: object, filePath: string) {
        let directoryPath = filePath.substring(0, filePath.lastIndexOf("/"));
        if(!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }
        fs.writeFileSync(filePath, JSON.stringify(jsonObject));
        console.log(`Json dumped successfully to file ${filePath}`);
    }

    /**
     * Reads the file based on the path passed as argument
     * and returns the jsonObject in the form of string.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.readFileAsString("./src/jsonRepository/Requisition/postRequisition");
     * ```
     * 
     * @param [string] filePath
     * @returns string
     */
    static async readFileAsString(filePath: string) {
        let defaultJsonString = fs.readFileSync(filePath, "utf-8");
        return defaultJsonString;
    }

    /**
     * Reads the file based on the name passed as argument from the given directory
     * and returns the cxml document object.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.getDefaultCxmlBody("postRequisition", "./src/eProc/cxmlRepository");
     * ```
     * 
     * @param [apiName] Name of the api
     * @param [apiDirectoryPath] Default cxml document directory path
     * @returns Document
     */
    static async getDefaultCxmlBody(apiName: string, apiDirectoryPath: string) {
        apiName = `${apiName}.xml`;

        console.log(`Default api directory --> ${apiDirectoryPath}`);

        let path = await this.getFilePath(apiDirectoryPath, apiName) as string;
        if(!path) {
            throw new Error(`File not found under directory ${apiDirectoryPath}`);
        }
        else {
            console.log(`Cxml file ${apiName} found under directory ${apiDirectoryPath}`);
        }
        
        let cxmlString = fs.readFileSync(path, "utf-8");

        let defaultCxmlDocument = new DOMParser().parseFromString(cxmlString, "application/xml");
        
        if(cxmlString.includes("<!DOCTYPE")) {
            defaultCxmlDocument = await this.updateCxmlDoctype(cxmlString, defaultCxmlDocument);
        }

        return defaultCxmlDocument;
    }

    /**
     * Returns an array of cxml doctype object.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.getCxmlDocTypeAttributeValueArray(cxmlString);
     * ```
     * 
     * @param [cxmlString] CXML in string format
     * @returns string[]
     */
    static async getCxmlDocTypeAttributeValueArray(cxmlString: string) {
        let cxmlArray: string[] = cxmlString.split("\n");
        cxmlArray = cxmlArray.filter(value => value.includes("<!DOCTYPE"));

        let doctypeArray = cxmlArray[0].split(" ");
        doctypeArray = doctypeArray.filter(value => !value.includes("<!DOCTYPE"));

        if(doctypeArray[doctypeArray.length - 1].includes('">')) {
            let value = doctypeArray[doctypeArray.length - 1];
            value = value.replace(/"/g, "");
            value = value.substring(0, value.lastIndexOf(">"));
            doctypeArray[doctypeArray.length - 1] = value;
        }

        return doctypeArray;
    }

    /**
     * Updates doctype of cxml object.
     * 
     * eg.
     * ```js
     * await FileSystemOperations.updateCxmlDoctype(cxmlString, cxmlDocument);
     * ```
     * 
     * @param [cxmlString] CXML in string format
     * @param [cxmlDocument] CXML in document format
     * @returns Document
     */
    static async updateCxmlDoctype(cxmlString: string, cxmlDocument: Document) {
        let doctypeArray = await this.getCxmlDocTypeAttributeValueArray(cxmlString);

        // let docTypeNode = cxmlDocument.implementation.createDocumentType("cXML", "", "http://xml.cXML.org/schemas/cXML/1.2.021/cXML.dtd");
        let docTypeNode;
        if(doctypeArray[1].includes("SYSTEM")) {
            docTypeNode = cxmlDocument.implementation.createDocumentType(doctypeArray[0], "", doctypeArray[2]);
        }
        else {
            docTypeNode = cxmlDocument.implementation.createDocumentType(doctypeArray[0], doctypeArray[1], doctypeArray[2]);
        }

        for(let i = 0; i < cxmlDocument.childNodes.length; i++) {
            if(cxmlDocument.childNodes[i].nodeType === cxmlDocument.DOCUMENT_TYPE_NODE) {
                // cxmlDocument.replaceChild(docTypeNode, cxmlDocument.childNodes[i]);
                cxmlDocument.removeChild(cxmlDocument.childNodes[i]);
                cxmlDocument.insertBefore(docTypeNode, cxmlDocument.childNodes[++i]);
                break;
            }
        }

        return cxmlDocument;
    }

    /**
     * Dumps the cxml document object to file [apiname]Dump.xml under the given directory
     * 
     * eg.
     * ```js
     * await FileSystemOperations.dumpCxmlToFile(response.data, "./cxmlDumpRepository");
     * ```
     * 
     * @param [cxmlDocument] CXML document object
     * @param [filePath] File path of dump
     */
    static async dumpCxmlToFile(cxmlString: string, filePath: string) {
        let directoryPath = filePath.substring(0, filePath.lastIndexOf("/"));
        if(!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
        }

        // let cxmlString = serializer.serializeToString(cxmlDocument);
        fs.writeFileSync(filePath, cxmlString, "utf8");
        console.log(`Cxml dumped successfully to file ${filePath}`);
    }

    static async uploadFile() {
        let filePath = "./Resources/SocketTimeoutIssue.PNG";
        // let filePath = "C:/Users/om.pawar/Pictures/test.zip";
        let formData = new FormData();
        // formData.append("file", fs.createReadStream(filePath));
        // formData.append("tenantId", "227dcd65-eeea-4954-bf8c-0f35a4af6cc9");
        // formData.append("uniqueId", "121516");
        // formData.append("requester", "12316546");
        formData.append("launcherData", '{"launchId":null,"launchType":"MANUAL","simulationMode":null,"botCategory":"AI","botType":"APMAILBOX","schedulerDetails":null}');
        formData.append("botSpecificRequestData", '{"username":"merlin.poc@zycus.com","password":"pass@123","url":"https://outlook.office365.com/EWS/Exchange.asmx","startTime":1592477901000,"endTime":null,"endTimeLaunchOccurrence":"true","emailConfig":{"option":"","customerEmailId":""}}');
        return formData;
    }
}