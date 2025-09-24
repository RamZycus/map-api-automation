import * as fs from 'fs';
import * as path from 'path';

export class JsonOperations {
  static readJsonFile(filename: string): any {
    const filePath = path.join(process.cwd(), 'src', 'jsonRepository', filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  }

  static writeJsonFile(filename: string, data: any): void {
    const filePath = path.join(process.cwd(), 'src', 'jsonRepository', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  static getTestData(key: string): any {
    const testData = this.readJsonFile('test-data.json');
    return this.getNestedValue(testData, key);
  }

  static createDynamicTestData(baseData: any, overrides: any = {}): any {
    return { ...baseData, ...overrides };
  }

  static generateTestDataVariations(baseData: any, variations: any[]): any[] {
    return variations.map(variation => ({ ...baseData, ...variation }));
  }

  static deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  static compareJsonObjects(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
