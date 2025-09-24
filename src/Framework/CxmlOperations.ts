import * as assert from "assert";
import { DOMParser, XMLSerializer } from "xmldom";
import { JsonOperations } from "./JsonOperations";
import { FileSystemOperations } from "./FileSystemOperations";
import { GlobalVariablesAPI } from "./bo/GlobalVariablesAPI";

let serializer = new XMLSerializer();

export class CxmlOperations {
    
    /**
     * Returns a map of element name and index.
     * 
     * eg.
     * ```js
     * await CxmlOperations.getElementNameAndIndex("itemName");
     * await CxmlOperations.getElementNameAndIndex("itemName[9]");
     * ```
     * 
     * @param [elementName] Name of the cxml element
     * @returns map
     */
    static async getElementNameAndIndex(elementName: string) {
        let index;
        let elementIndexMap: Map<string, number> = new Map();
        if(elementName.includes("[") && elementName.includes("]")) {
            index = parseInt(elementName.substring(elementName.indexOf("[") + 1, elementName.indexOf("]")));
            elementName = elementName.substring(0, elementName.indexOf("["));
        }
        
        elementIndexMap.set(elementName, index);

        return elementIndexMap;
    }

    /**
     * Sets value for all nodes matching the element name passed in as argument and returns the updated cxml document.
     * 
     * eg.
     * ```js
     * await CxmlOperations.setCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName", "Laptop");
     * await CxmlOperations.setCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName", "Laptop");
     * await CxmlOperations.setCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName", "$ITEM_NAME");
     * await CxmlOperations.setCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName", "#generateRandomStringOfLength(6)");
     * await CxmlOperations.setCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName", "Laptop||$ITEM_NAME||#generateRandomStringOfLength(6)");
     * ```
     * 
     * @param [cxmlDocument] CXML document object
     * @param [elementName] Name of the xml element
     * @param [attributeName] Name of the attrbute
     * @returns Document
     */
    static async setCxmlAttributeValue(cxmlDocument: Document, elementName: string, attributeName: string, attributeValue: any) {
        return await this.setCxmlValue(cxmlDocument, elementName, attributeValue, attributeName);
    }

    /**
     * Returns value for all nodes matching the element name passed in as argument.
     * If only 1 matching node is found, then it will return a single value.
     * Else it will return an array.
     * 
     * eg.
     * ```js
     * await CxmlOperations.getCxmlAttributeValue(cxmlDocument, "RequisitionItem", "itemName");
     * ```
     * 
     * @param [cxmlDocument] CXML document object
     * @param [elementName] Name of the xml element
     * @param [attributeName] Name of the attribute
     * @returns string | string[]
     */
    static async getCxmlAttributeValue(cxmlDocument: Document, elementName: string, attributeName: string) {
        let elementNodeMap = await this.getElementNameAndIndex(elementName);
        let tagName = elementNodeMap.keys().next().value as string;
        let index = elementNodeMap.values().next().value as number;
        let valueArray: any[] = new Array();
        
        if(index) {
            let value = cxmlDocument.getElementsByTagName(tagName)[index].getAttribute(attributeName) as string;
            valueArray.push(value);
        }
        else {
            let elementCollection = cxmlDocument.getElementsByTagName(tagName);
            for(let i = 0; i < elementCollection.length; i++) {
                let value = cxmlDocument.getElementsByTagName(tagName)[i].getAttribute(attributeName) as string;
                valueArray.push(value);
            }
        }

        if(valueArray.length === 1) {
            return valueArray[0];
        }
        else {
            return valueArray;
        }
    }

    /**
     * Checks if element has the specified attribute and throws an exception if not present.
     * 
     * eg.
     * ```js
     * await CxmlOperations.checkIfElementHasAttribute(element, "itemName");
     * ```
     * 
     * @param [element] CXML element object
     * @param [attributeName] Name of the attrbute
     */
    static async checkIfElementHasAttribute(element: Element, attributeName: string) {
        if(!element.hasAttribute(attributeName)) {
            let elementName = element.nodeName;
            let parentNodeName = (element.parentNode as Node).nodeName;
            throw new Error(`Attribute '${attributeName} not present in element ${elementName} under parent element ${parentNodeName}`);
        }
    }

    /**
     * This method is used to check the assertion of response body
     * 
     * ```js
     * await CxmlOperations.assertCxmlRequestResponseBody(actualCxmlBody, expectedCxmlBody);
     * ```
     * 
     * @param [actualCxmlBody] Response CXML string
     * @param [expectedCxmlBody] Expected CXML document object
     */
    static async assertCxmlRequestResponseBody(actualCxmlBody: string, expectedCxmlBody: Document) {
        try {
            assert.strictEqual(actualCxmlBody, serializer.serializeToString(expectedCxmlBody));
            console.log("Response body matched")
        } catch (error) {
            throw new Error("Response body different than expected. \n Expected:" + serializer.serializeToString(expectedCxmlBody) + " \nActual:" + actualCxmlBody);
        }

    }

    /**
     * This method is used to assert the value of any key from the response object.
     * If case of multiple attributes, multiple values can be passed for assertion with the help of pipe separator "||".
     * 
     * eg.
     * ```js
     * await CxmlOperations.assertCxmlRequestResponseKey(cxmlDocument,"RequisitionItem", "itemName", "Laptop");
     * await CxmlOperations.assertCxmlRequestResponseKey(cxmlDocument,"RequisitionItem", "itemName", 1);
     * await CxmlOperations.assertCxmlRequestResponseKey(cxmlDocument,"RequisitionItem", "itemName", 1);
     * await CxmlOperations.assertCxmlRequestResponseKey(cxmlDocument,"RequisitionItem", "itemName", "1||$BUSINESS_UNIT");
     * ```
     * 
     * @param [actualCxmlDocument] Response CXML document object
     * @param [elementName] Name of the xml element
     * @param [attributeName] Name of the attrbute
     * @param [expectedValue] Expected value for assertion
     */
    static async assertCxmlRequestResponseKey(cxmlString: string, elementName: string, attributeName: string, expectedValue: any) {
        let cxmlDocument = new DOMParser().parseFromString(cxmlString, "application/xml");

        let actual = await this.getCxmlAttributeValue(cxmlDocument, elementName, attributeName);
        let actualArrayCount = 0;

        let expected = await JsonOperations.getValueArray(attributeName, expectedValue);
        let expectedArrayCount = 0;
        
        let flag = actual instanceof Array;
        if(!flag) {
            actual = [actual];
        }
        
        try {
            for(actualArrayCount; actualArrayCount < actual.length; actualArrayCount++) {
                if(expectedArrayCount === expected.length) {
                    expectedArrayCount = 0;
                }
                console.log(`Actual: ${actual[actualArrayCount]}, Expected: ${expected[expectedArrayCount]}`);
                assert.equal(expected[expectedArrayCount++], actual[actualArrayCount]);
            }
        } catch (error) {
            throw new Error(`Response value different than expected for attribute "${attributeName}"\nExpected: ${expected[--expectedArrayCount]}, Actual: ${actual[actualArrayCount]}`);
        }
    }

    /**
     * Returns cxml document object from the specified dump file and directory.
     * 
     * eg.
     * ```js
     * await CxmlOperations.getCxmlBodyFromDump("postRequisitionDump", "./cxmlDumpRepository");
     * ```
     * 
     * @param [dumpName] Name of the dump file (file extension should not be included)
     * @param [cxmlDumpRepositoryPath] Parent directory of the dump file
     * @returns document
     */
    static async getCxmlBodyFromDump(dumpName, cxmlDumpRepositoryPath) {
        let defaultCxmlObject = await FileSystemOperations.getDefaultCxmlBody(dumpName, cxmlDumpRepositoryPath);
        // let defaultCxmlObject = GlobalVariablesAPI.cxmlDumpMap.get(dumpName);
        return defaultCxmlObject;
    }

    /**
     * Sets text for the given element and returns the udpated cxml document object.
     * 
     * eg.
     * ```js
     * await CxmlOperations.setCxmlElementText(cxmlDocument,"RequisitionItem", "Laptop");
     * await CxmlOperations.setCxmlElementText(cxmlDocument,"RequisitionItem[1]", "123");
     * ```
     * 
     * @param [cxmlDocument] CXML document object
     * @param [elementName] Name of the xml element
     * @param [text] Text to be set for the element
     */
    static async setCxmlElementText(cxmlDocument: Document, elementName: string, text: string) {
        return await this.setCxmlValue(cxmlDocument, elementName, text);
    }

    /**
     * Sets text or value for an attribute for the given element and returns the udpated cxml document object.
     * 
     * eg.
     * ```js
     * await CxmlOperations.setCxmlValue(cxmlDocument,"RequisitionItem", "Laptop", "itemName");
     * await CxmlOperations.setCxmlValue(cxmlDocument,"RequisitionItem[1]", "123");
     * ```
     * 
     * @param [cxmlDocument] CXML document object
     * @param [elementName] Name of the xml element
     * @param [attributeValue] Value to be set for the attribute
     * @param [attributeName] [Optional] Attribute name for which the value should be set.
     * If this parameter is not passed, then attributeValue parameter will be set as text for the element.
     */
    static async setCxmlValue(cxmlDocument: Document, elementName: string, attributeValue: any, attributeName?: string) {
        let elementNodeMap = await this.getElementNameAndIndex(elementName);
        let tagName = elementNodeMap.keys().next().value as string;
        let index = elementNodeMap.values().next().value as number;

        let valueArray = new Array();
        let valueArrayCounter = 0;

        if (attributeName) valueArray = await JsonOperations.getValueArray(attributeName, attributeValue);
        else valueArray = await JsonOperations.getValueArray(elementName, attributeValue);

        if(index || (elementName.includes("[") && elementName.includes("]"))) {
            if(attributeName) {
                await this.checkIfElementHasAttribute(cxmlDocument.getElementsByTagName(tagName)[index], attributeName);
                cxmlDocument.getElementsByTagName(tagName)[index].setAttribute(attributeName, valueArray[0]);
            }
            else {
                cxmlDocument.getElementsByTagName(tagName)[index].childNodes[0].textContent = valueArray[0];
            }
        }
        else {
            let elementCollection = cxmlDocument.getElementsByTagName(tagName);
            for(let i = 0; i < elementCollection.length; i++) {
                if(valueArrayCounter === valueArray.length) {
                    valueArrayCounter = 0;
                }
                if(attributeName) {
                    await this.checkIfElementHasAttribute(cxmlDocument.getElementsByTagName(tagName)[i], attributeName);
                    cxmlDocument.getElementsByTagName(tagName)[i].setAttribute(attributeName, valueArray[valueArrayCounter++]);
                }
                else {
                    cxmlDocument.getElementsByTagName(tagName)[i].childNodes[0].textContent = valueArray[valueArrayCounter++];
                }
            }
        }
        
        return cxmlDocument;
    }

}