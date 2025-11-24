export * from './types';
export * from './encrypted';
export * from './basic';

// import { ConfigDatabase } from './config-db';
// import { StateDatabase } from './state-db';
// import { DatabaseConfig } from './types';

// export class HarvesterDatabase {
//   public config: ConfigDatabase;
//   public state: StateDatabase;

//   constructor(dbConfig: DatabaseConfig) {
//     this.config = new ConfigDatabase(dbConfig);
//     this.state = new StateDatabase(dbConfig);
//   }

//   static create(rootFolder: string, configName: string = 'production', nodeEnv: string = 'production'): HarvesterDatabase {
//     const dbConfig: DatabaseConfig = {
//       rootFolder,
//       configName,
//       nodeEnv
//     };
//     return new HarvesterDatabase(dbConfig);
//   }
// }
