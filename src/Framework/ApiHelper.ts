// @ts-nocheck
const Helper = require('@codeceptjs/helper');
const { JsonOperations } = require('./JsonOperations');
const { GlobalVariablesAPI } = require('./bo/GlobalVariablesAPI');
const { ObjectCreation } = require('./bo/ObjectCreation');
const { FileSystemOperations } = require('./FileSystemOperations');
const { Utilities } = require('./Utilities');
const { ApiBo } = require('./bo/ApiBo');

export class ApiHelper extends Helper {

  _before() {
    GlobalVariablesAPI.utilityDump = new Map();
  }

  /**
   * Reads the file based on the name passed as argument from the given directory
   * and returns the json as an object.
   * 
   * eg.
   * ```js
   * await I.getDefaultJsonBody("postRequisition", "./src/eProc/jsonRepository");
   * ```
   * 
   * @param [apiName] Name of the api
   * @param [apiDirectoryPath] Default json body directory path
   * @returns object
   */
  async getDefaultJsonBody(apiName, apiDirectoryPath) {
    return await FileSystemOperations.getDefaultJsonBody(apiName, apiDirectoryPath);
  }

  /**
   * Sets value for all nodes matching the path passed in as argument and returns the updated json object.
   * 
   * eg.
   * ```js
   * await I.setAttributeValue(jsonObject, "item[0].itemName", "Laptop");
   * ```
   * 
   * @param [object] jsonObject
   * @param [string] path (relative | absolute)
   * @param [any] value
   * @returns object
   */
  async setAttributeValue(jsonObject, path, value) {
    return JsonOperations.setAttributeValue(jsonObject, path, value);
  }

  /**
   * Returns value for all nodes matching the path passed in as argument.
   * If only 1 matching node is found, then it will return a single value.
   * Else it will return an array.
   * 
   * eg.
   * ```js
   * await I.getAttributeValue(jsonObject, "item[0].itemName");
   * ```
   * 
   * @param [object] jsonObject
   * @param [string] path (relative | absolute)
   * @returns string | string[]
   */
  async getAttributeValue(jsonObject, path) {
    return await JsonOperations.getAttributeValue(jsonObject, path);
  }

  /**
   * This method is used to check the assertion of response status
   * 
   * ```js
   * await I.assertRequestResponseStatus(response.status,200);
   * ```
   * 
   * @param actualStatusCode Actual response status code
   * @param expectedStatusCode Expected response status code
   */
  async assertRequestResponseStatus(actualStatusCode, expectedStatusCode) {
    await JsonOperations.assertRequestResponseStatus(actualStatusCode, expectedStatusCode);
  }

  /**
   * This method is used to assert the value of any key from the response object.
   * 
   * eg.
   * ```js
   * await I.assertRequestResponseKey(responseObject,"reqItem[0].itemName","Laptop");
   * ```
   * 
   * @param jsonObject Json object
   * @param jsonPath Attribute path
   * @param value Value to be asserted against
   */
  async assertRequestResponseKey(responseObject, jsonPath, value) {
    await JsonOperations.assertRequestResponseKey(responseObject, jsonPath, value);
  }

  /**
   * Sends post request to api.
   * 
   * eg.
   * ```js
   * await I.sendApiPostRequest("getRequisition", jsonObject, GlobalVariablesAPI.apiBo);
   * ```
   * 
   * @param [apiName] Name of the api to which the request should be sent
   * @param [jsonObject] Api request body
   * @param [apiBo] BO class object consisting of api metadata details
   * @returns response
   */
  async sendApiPostRequest(apiName, jsonObject, apiBo) {
    const helper = this.helpers["REST"];
    let response;

    apiBo.endpoint = await JsonOperations.updateEndpointHavingDbKeys(apiBo.endpoint);
    apiBo.headerParams = await JsonOperations.updateHeadersHavingDbKeys(apiBo.headerParams);
    apiBo.formDataFile = await JsonOperations.updateFileParamsHavingDbKeys(apiBo.formDataFile);

    if(apiBo.formData) {
      let formDataArray = await JsonOperations.getFormDataBodyAndHeader(jsonObject, apiBo);
      apiBo.headerParams = formDataArray[1].headerParams;

      response = await helper.sendPostRequest(apiBo.endpoint, formDataArray[0], apiBo.headerParams);
    }
    else {
      console.log(`==================== Json body to be posted: ====================\n${JSON.stringify(jsonObject)}`);
      console.log(`=================================================================`);

      if(apiBo.headerParams) {
        if(Object.keys(apiBo.headerParams).length) {
            response = await helper.sendPostRequest(apiBo.endpoint, jsonObject, apiBo.headerParams);
        }
        else {
            response = await helper.sendPostRequest(apiBo.endpoint, jsonObject);
        }
      }
      else {
          response = await helper.sendPostRequest(apiBo.endpoint, jsonObject);
      }
    }

    console.log(`-------------------- Post Response from api: --------------------\n${JSON.stringify(response.data)}`);
    console.log(`-----------------------------------------------------------------`);

    GlobalVariablesAPI.dumpName = `${apiName}_Dump_${new Date().getTime()}`;
    
    let filePath = `${GlobalVariablesAPI.jsonDumpRepositoryPath}/${GlobalVariablesAPI.dumpName}.json`;
    await FileSystemOperations.dumpJsonToFile(response.data, filePath);

    GlobalVariablesAPI.jsonDumpMap.set(GlobalVariablesAPI.dumpName, response.data);
    
    return response;
  }

  /**
   * Sends get request to api.
   * 
   * eg.
   * ```js
   * await I.sendApiGetRequest("getRequisition", "http://10.121.1.92:54840/eproc/607c3060-3660-44f3-bc19-c441167e936a",'{ContentType":"application/json"}');
   * ```
   * 
   * @param [apiName] Name of the api to which the request should be sent
   * @param [endpoint] Api url
   * @param [headers] Api headers
   * @returns response
   */
  async sendApiGetRequest(apiName, endpoint, headers) {
    const helper = this.helpers["REST"];
    let response;

    endpoint = await JsonOperations.updateEndpointHavingDbKeys(endpoint);
    
    if(headers) {
      if(Object.keys(headers).length) {
        headers = await JsonOperations.updateHeadersHavingDbKeys(headers);
        response = await helper.sendGetRequest(endpoint, headers);
      }
      else {
        response = await helper.sendGetRequest(endpoint);
      }
    }
    else {
        response = await helper.sendGetRequest(endpoint);
    }

    console.log(`-------------------- Get Response from api: --------------------\n${JSON.stringify(response.data)}`);
    console.log(`----------------------------------------------------------------`);

    GlobalVariablesAPI.dumpName = `${apiName}_Dump_${new Date().getTime()}`;
    
    let filePath = `${GlobalVariablesAPI.jsonDumpRepositoryPath}/${GlobalVariablesAPI.dumpName}.json`;
    await FileSystemOperations.dumpJsonToFile(response.data, filePath);

    GlobalVariablesAPI.jsonDumpMap.set(GlobalVariablesAPI.dumpName, response.data);
    
    return response;
  }

  /**
   * Sends delete request to api.
   * 
   * eg.
   * ```js
   * await I.sendApiDeleteRequest("deleteApi", "http://10.121.1.92:54840/eproc/607c3060-3660-44f3-bc19-c441167e936a",'{ContentType":"application/json"}');
   * ```
   * 
   * @param [apiName] Name of the api to which the request should be sent
   * @param [endpoint] Api url
   * @param [headers] Api headers
   * @returns response
   */
  async sendApiDeleteRequest(apiName, endpoint, headers) {
    const helper = this.helpers["REST"];
    let response;

    endpoint = await JsonOperations.updateEndpointHavingDbKeys(endpoint);
    
    if(headers) {
      if(Object.keys(headers).length) {
        headers = await JsonOperations.updateHeadersHavingDbKeys(headers);
        response = await helper.sendDeleteRequest(endpoint, headers);
      }
      else {
        response = await helper.sendDeleteRequest(endpoint);
      }
    }
    else {
        response = await helper.sendDeleteRequest(endpoint);
    }

    console.log(`-------------------- Delete Response from api: --------------------\n${JSON.stringify(response.data)}`);
    console.log(`----------------------------------------------------------------`);

    GlobalVariablesAPI.dumpName = `${apiName}_Dump_${new Date().getTime()}`;
    
    let filePath = `${GlobalVariablesAPI.jsonDumpRepositoryPath}/${GlobalVariablesAPI.dumpName}.json`;
    await FileSystemOperations.dumpJsonToFile(response.data, filePath);

    GlobalVariablesAPI.jsonDumpMap.set(GlobalVariablesAPI.dumpName, response.data);
    
    return response;
  }

  /**
   * Returns json body from the specified dump file and directory.
   * 
   * eg.
   * ```js
   * await I.getJsonBodyFromDump("postRequisitionDump", "./jsonDumpRepository");
   * ```
   * 
   * @param [dumpName] Name of the dump file (file extension should not be included)
   * @returns object
   */
  async getJsonBodyFromDump(dumpName) {
    let defaultJsonObject = await JsonOperations.getJsonBodyFromDump(dumpName);
    return defaultJsonObject;
  }

  /**
   * Updates header attribute of the api and returns the updated header object.
   * 
   * eg.
   * ```js
   * await I.setHeaderValue(GlobalVariablesAPI.apiBo.headerParams, "launchId", "123456789");
   * ```
   * 
   * @param [headerObject] Header object
   * @param [headerFieldName] Name of the header attribute whose value should be updated
   * @param [value] Value to be set for the header attribute
   * @returns object
   */
  async setHeaderValue(headerObject, headerFieldName, value) {
    return await JsonOperations.setHeaderValue(headerObject, headerFieldName, value);
  }

  /**
   * Updates query paramters of the api url and returns the updated url.
   * 
   * eg.
   * ```js
   * await I.setQueryParamValue("http://192.168.15.163:9000/Merlin/rest/invoiceExtraction/getFileDetails?launchId=5edb488719cd22fe4c089b8a&botId=3", "launchId", "123456789");
   * ```
   * 
   * @param [endpoint] Api url
   * @param [parameterName] Name of the api url parameter whose value should be updated
   * @param [parameterValue] Value to be set for the paramter
   * @returns string
   */
  async setQueryParamValue(endpoint, parameterName, parameterValue) {
    return await JsonOperations.setQueryParamValue(endpoint, parameterName, parameterValue);
  }

  /**
   * Updates api url path and returns the updated url.
   * 
   * eg.
   * ```js
   * await I.setEndpointPath("http://10.121.1.92:54840/eproc/endpoint/Requisition/$reqId", "eb9c82f0-c560-4b1d-ae44-eed597e8471d");
   * ```
   * 
   * @param [endpoint] Api url
   * @param [parameterValue] Value to be set for the path
   * @returns string
   */
  async setEndpointPath(endpoint, parameterValue) {
    return await JsonOperations.setEndpointPath(endpoint, parameterValue);
  }
}

module.exports = ApiHelper;