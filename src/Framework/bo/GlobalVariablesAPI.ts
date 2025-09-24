import { ApiBo } from "./ApiBo";

export class GlobalVariablesAPI {
    static defaultJsonString: string;
    static defaultJsonObject: object;
    static defaultCxmlDocument: Document;
    static defaultCxmlString: string;
    static apiBo: ApiBo;
    static response: any;

    static globalDataMap: Map<string, string>;
    static moduleDataMap: Map<string, Map<string, string>>;
    static apiMap: Map<string, Map<string, string>>;

    static apiMetaDataSheetPath = `./DataFiles/${process.env.PRODUCT}/API_List.xlsx`;
    static jsonRepositoryDirectoryPath = `./src/${process.env.PRODUCT}/jsonRepository`;
    static cxmlRepositoryDirectoryPath = `./src/${process.env.PRODUCT}/cxmlRepository`;
    static jsonDumpRepositoryPath = "./jsonDumpRepository";
    static cxmlDumpRepositoryPath = "./cxmlDumpRepository";
    static jsonDumpMap: Map<string, object> = new Map();
    static cxmlDumpMap: Map<string, Document> = new Map();
    static utilityDump: Map<string, any> = new Map();
    static dumpName: string;
    static dumpJsonObject: object;

    static cxmlDocType: string;

    static excelIterationData: Map<string, Map<string, string>>;
    static excelSheetDirectory = `./DataFiles/${process.env.PRODUCT}`;
    static testDataFilePath = `./src/${process.env.PRODUCT}/DataRepository`;
    static zDocEmail: string;
    static RoleIdZdoc: string;
    static dateFormat: any;
    static timeFormat: any;
    static currency: any;
    static timeZone: any;
    static numberformat: any;
    static roles: any;
    static tokenId: any;
    static zDocEmail2: string;
    static email: any;
    static rm:any;
    static tmp1:any;
    static purposeCom: "COMMON";
    static purposeExt: "EXTERNAL_INTEGRATION";
    static entityTypeCRMS: "TMSUSER";
    static entityTypeUser: "USER";
    static entityTypeScope: "USER_SCOPE";
    static entityTypeDefault: "USER_DEFAULT";
    static eventTypeCreate: "CREATE";
    static eventTypeUpdate: "UPDATE";
    static unqid:string;
    static oldOU:any;
    static tmp2:any;
    static tmp3:any;
    static tmp4:any;
    static smartID:any;
    static request:any;
    static processId:any;
}