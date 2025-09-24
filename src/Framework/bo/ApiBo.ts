export class ApiBo {
    apiIdentifier: string = "";
    apiDescription: string = "";
    module: string = "";
    endpoint: string = "";
    method: string = "";
    headerParams: object = {};
    isHerited: boolean = false;
    formData: boolean = false;
    formDataFile: object = {};
}