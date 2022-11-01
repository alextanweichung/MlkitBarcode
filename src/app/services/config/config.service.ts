import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { CommonQueryService } from 'src/app/shared/database/interface/common-query.service';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { PDItemMaster } from 'src/app/shared/models/pos-download';
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

  constructor(
    private _databaseService: DatabaseService,
    private commonQueryService: CommonQueryService<Sys_Parameter>
  ) {
  }

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
    objects.forEach(async r => {
      await this.commonQueryService.insert(r, "Item_Master", dbConfig.inbounddb);
    })
  }

}
