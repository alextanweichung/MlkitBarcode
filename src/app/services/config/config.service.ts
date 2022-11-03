import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { CommonQueryService } from 'src/app/shared/database/interface/common-query.service';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { DatabaseService } from '../sqlite/database.service';

export const getSysParams: string = `
SELECT * 
FROM Sys_Parameter
WHERE id = 1
`;

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  sys_parameter: Sys_Parameter;
  item_Masters: PDItemMaster[] = [];
  item_Barcodes: PDItemBarcode[] = [];

  constructor(
    private _databaseService: DatabaseService,
    private commonQueryService: CommonQueryService<Sys_Parameter>
  ) { }

  async load() {
    this.sys_parameter = {
      Sys_ParameterId: 1,
      // apiUrl: 'https://localhost:44351/api/',
      apiUrl: 'https://idcp-demo.com/api/',
      imgUrl: null,
      onlineMode: null,
      firstTimeLogin: null,
      lastDownloadAt: null,
      lastUploadAt: null,
      createdAt: null,
      updatedAt: null
    }
    // this.sys_parameter = await this.commonQueryService.load(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
    // this.sys_parameter.apiUrl = "https://10.0.2.2:44351/api";
  }

  async insert(object: Sys_Parameter) {
    this.sys_parameter = {
      Sys_ParameterId: 1,
      apiUrl: object.apiUrl,
      imgUrl: object.imgUrl,
      onlineMode: true,
      firstTimeLogin: true,
      lastDownloadAt: new Date(),
      lastUploadAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await this.commonQueryService.insert(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
  }

  async insertItemMaster(objects: PDItemMaster[]) {
    await this.commonQueryService.deleteAll("Item_Master", dbConfig.inbounddb);
    await this.commonQueryService.bulkInsert(objects, "Item_Master", dbConfig.inbounddb);
  }

  async loadItemMaster(): Promise<PDItemMaster[]> {
    let ret = await this.commonQueryService.selectAll("Item_Master", dbConfig.inbounddb) as PDItemMaster[];
    this.item_Masters = ret;
    return this.item_Masters;
  }

  async insertItemBarcode(objects: PDItemBarcode[]) {
    await this.commonQueryService.deleteAll("Item_Barcode", dbConfig.inbounddb);
    await this.commonQueryService.bulkInsert(objects, "Item_Barcode", dbConfig.inbounddb);
  }

  async loadItemBarcode(): Promise<PDItemBarcode[]> {
    let ret = await this.commonQueryService.selectAll("Item_Barcode", dbConfig.inbounddb) as PDItemBarcode[];
    this.item_Barcodes = ret;
    return this.item_Barcodes;
  }

}
