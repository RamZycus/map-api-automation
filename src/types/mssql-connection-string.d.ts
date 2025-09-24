declare module 'mssql-connection-string' {
  interface ConnectionConfig {
    server: string;
    database: string;
    user: string;
    password: string;
    port?: number;
    options?: any;
  }
  
  function parse(connectionString: string): ConnectionConfig;
  export = parse;
}
