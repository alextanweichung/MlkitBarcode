import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { environment } from 'src/environments/environment';
import { DatabaseService } from './database.service';
import { SQLiteService } from './sqlite.service';

export const createIdcpCore: string = `
CREATE TABLE IF NOT EXISTS Sys_Parameter (
  sys_ParameterId INTEGER PRIMARY KEY AUTOINCREMENT, 
  apiUrl VARCHAR(255), 
  imgUrl VARCHAR(255), 
  onlineMode TINYINT(1), 
  firstTimeLogin TINYINT(1), 
  lastDownloadAt DATETIME, 
  lastUploadAt DATETIME, 
  createdAt DATETIME NOT NULL, 
  updatedAt DATETIME NOT NULL
  );
`;

@Injectable()
export class MigrationService {

  constructor(private sqliteService: SQLiteService, private databaseService: DatabaseService) {
  }

  async migrate(): Promise<any> {
    await this.createSystemParamTable();
  }

  // async createSystemParamTable(): Promise<void> {
  //   await this.databaseService.executeQuery(async (db) => {
  //     await db.execute(createIdcpCore);
  //   });
  // }

  async createSystemParamTable(): Promise<void> {
    console.log(`going to create a connection`)
    const db = await this.sqliteService.createConnection(dbConfig.idcpcore, false, "no-encryption", 1);
    console.log(`db ${JSON.stringify(db)}`);
    await db.open();
    console.log(`after db.open`);
    console.log(`query ${createIdcpCore}`);

    const ret: any = await db.execute(createIdcpCore);
    console.log(`ret: ${JSON.stringify(ret)}`);
    await this.sqliteService.closeConnection(dbConfig.idcpcore);
    console.log(`after closeConnection`);
  }

}
