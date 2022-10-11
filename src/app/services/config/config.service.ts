import { Injectable } from '@angular/core';
import { dbConfig } from 'src/app/shared/database/config/db-config';
import { CommonService } from 'src/app/shared/database/interface/common.service';
import { Sys_Parameter } from 'src/app/shared/database/tables/tables';
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
    private commonService: CommonService<Sys_Parameter>
  ) {
  }

  getColumns() {
    // this.repoEntityService.updateAsync(this.config, "Sys_Parameter");
  }

  // async loadConfig(): Promise<Config> {
    // return this._databaseService.executeQuery<any>(async (db: SQLiteDBConnection) => {
    //   var config: DBSQLiteValues = await db.query(getSysParams);
    //   if (config.values.length > 0) {
    //     this.config = config.values[0] as Config;
    //   }
    //   console.log("🚀 ~ file: config.service.ts ~ line 29 ~ ConfigService ~ returnthis._databaseService.executeQuery<any> ~ this.config", JSON.stringify(this.config));
    // }, environment.idcpcoredb);

  //   return null;
  // }

  async loadAll() {

  }

  async load() {
    this.sys_parameter = {
      Sys_ParameterId: 1,
      apiUrl: null,
      imgUrl: null,
      onlineMode: null,
      firstTimeLogin: null,
      lastDownloadAt: null,
      lastUploadAt: null,
      createdAt: null,
      updatedAt: null
    }
    this.sys_parameter = await this.commonService.load(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
    console.log("🚀 ~ file: config.service.ts ~ line 58 ~ ConfigService ~ load ~ this.sys_parameter", JSON.stringify(this.sys_parameter));
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
    await this.commonService.insert(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
  }

}
