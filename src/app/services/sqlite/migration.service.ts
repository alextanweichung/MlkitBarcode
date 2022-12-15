import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { DatabaseService } from './database.service';
import { SQLiteService } from './sqlite.service';

export const sys_Parameter_Table: string = `
CREATE TABLE IF NOT EXISTS Sys_Parameter (
  sys_ParameterId INTEGER PRIMARY KEY AUTOINCREMENT, 
  apiUrl VARCHAR(255), 
  imgUrl VARCHAR(255), 
  onlineMode TINYINT(1), 
  lastDownloadAt DATETIME, 
  loadImage TINYINT(1)
); `;

export const create_item_master_table: string = `
CREATE TABLE IF NOT EXISTS Item_Master (
  id INTEGER,
  code VARCHAR(20),
  itemDesc VARCHAR(100),
  brandId INTEGER,
  brandCd VARCHAR(20),
  brandDesc VARCHAR(100),
  groupId INTEGER,
  groupCd VARCHAR(20),
  groupDesc VARCHAR(100),
  catId INTEGER,
  catCd VARCHAR(20),
  catDesc VARCHAR(100),
  varCd VARCHAR(100),
  price DECIMAL(6,6),
  minPrice DECIMAL(6,6),
  discId INTEGER,
  discCd VARCHAR(20),
  discPct DECIMAL(3,2),
  taxId INTEGER,
  taxCd VARCHAR(20),
  taxPct DECIMAL(3,2),
  imgUrl VARCHAR(255)
); `;

export const create_item_barcode_table: string = `
CREATE TABLE IF NOT EXISTS Item_Barcode (
  id INTEGER,
  itemId INTEGER,
  xId INTEGER,
  xCd VARCHAR(20),
  xDesc VARCHAR(255),
  xSeq INTEGER,
  yId INTEGER,
  yCd VARCHAR(20),
  yDesc VARCHAR(255),
  ySeq INTEGER,
  barcode VARCHAR(255),
  sku VARCHAR(255),
  qty DECIMAL(6,0)
);`;

@Injectable()
export class MigrationService {

  constructor(private sqliteService: SQLiteService, private databaseService: DatabaseService) {
  }

  async migrate(): Promise<any> {
    await this.createSystemParamTable();
    await this.createInboundTables();
  }

  async createSystemParamTable(): Promise<void> {
    console.log(`going to create a connection`)
    const db = await this.sqliteService.createConnection(dbConfig.idcpcore, false, "no-encryption", 1);
    console.log(`db ${JSON.stringify(db)}`);

    await db.open();
    console.log(`after db.open`);

    console.log(`query ${sys_Parameter_Table}`);
    const ret: any = await db.execute(sys_Parameter_Table);
    console.log(`ret: ${JSON.stringify(ret)}`);

    await this.sqliteService.closeConnection(dbConfig.idcpcore);
    console.log(`after closeConnection`);
  }

  async createInboundTables(): Promise<void> {
    console.log(`going to create a connection`)
    const db = await this.sqliteService.createConnection(dbConfig.inbounddb, false, "no-encryption", 1);
    console.log(`db ${JSON.stringify(db)}`);

    await db.open();
    console.log(`after db.open`);
    
    console.log(`query ${create_item_master_table}`);
    const ret: any = await db.execute(create_item_master_table);
    console.log(`ret: ${JSON.stringify(ret)}`);
    
    console.log(`query ${create_item_barcode_table}`);
    const ret2: any = await db.execute(create_item_barcode_table);
    console.log(`ret: ${JSON.stringify(ret2)}`);

    await this.sqliteService.closeConnection(dbConfig.inbounddb);
    console.log(`after closeConnection`);
  }

}
