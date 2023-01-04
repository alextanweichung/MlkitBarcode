import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { dbConfig, inboundDb_Tables } from 'src/app/shared/database/config/db-config';
import { CommonQueryService } from 'src/app/shared/database/interface/common-query.service';
import { FireStoreReturn, Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { DatabaseService } from '../sqlite/database.service';
import { ToastService } from '../toast/toast.service';

export const getSysParams: string = 
`SELECT * 
FROM Sys_Parameter
WHERE id = 1`;

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  sys_parameter: Sys_Parameter;
  item_Masters: PDItemMaster[] = [];
  item_Barcodes: PDItemBarcode[] = [];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private _databaseService: DatabaseService,
    private commonQueryService: CommonQueryService<Sys_Parameter>
  ) { }
  
  getApiUrl(activationCode: string) {
    return this.http.get<FireStoreReturn>("https://firestore.googleapis.com/v1/projects/idcp-34e86/databases/(default)/documents/urlList/" + activationCode, {
      headers:
      {
        skip: "true"
      }
    });
  }
  
  async load() {
    if (Capacitor.getPlatform() === 'web') {
      this.sys_parameter = {
        Sys_ParameterId: 1,
        // apiUrl: 'https://localhost:44351/api/',
        apiUrl: 'https://idcp-demo.com/api/',
        imgUrl: null,
        onlineMode: true,
        lastDownloadAt: null,
        loadImage: false
      }
    } else {
      this.sys_parameter = await this.commonQueryService.load(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
    }
  }

  async insert(object: Sys_Parameter) {
    this.sys_parameter = {
      Sys_ParameterId: 1,
      apiUrl: object.apiUrl,
      imgUrl: object.imgUrl,
      onlineMode: true,
      lastDownloadAt: null,
      loadImage: true
    }
    await this.commonQueryService.insert(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
  }

  async update(object: Sys_Parameter) {
    await this.commonQueryService.update(object, "Sys_Parameter", dbConfig.idcpcore);
  }

  async syncInboundData(itemMasters: PDItemMaster[], itemBarcodes: PDItemBarcode[]) {
    await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Master, itemMasters);
    console.log('done sync item master')
    await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Barcode, itemBarcodes);
    console.log('done sync item barcode')
    try {
      let obj = this.sys_parameter;
      obj.lastDownloadAt = new Date;
      await this.update(obj);
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  async loadItemMaster(): Promise<PDItemMaster[]> {
    let ret = await this.commonQueryService.selectAll("Item_Master", dbConfig.inbounddb) as PDItemMaster[];
    this.item_Masters = ret;
    return this.item_Masters;
  }

  async loadItemBarcode(): Promise<PDItemBarcode[]> {
    let ret = await this.commonQueryService.selectAll("Item_Barcode", dbConfig.inbounddb) as PDItemBarcode[];
    this.item_Barcodes = ret;
    return this.item_Barcodes;
  }

}
