import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { dbConfig, inboundDb_Tables } from 'src/app/shared/database/config/db-config';
import { CommonQueryService } from 'src/app/shared/database/interface/common-query.service';
import { FireStoreReturn, Sys_Parameter } from 'src/app/shared/database/tables/tables';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { DatabaseService } from '../sqlite/database.service';
import { ToastService } from '../toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  sys_parameter: Sys_Parameter[] = [];
  selected_sys_param: Sys_Parameter;
  item_Masters: PDItemMaster[] = [];
  item_Barcodes: PDItemBarcode[] = [];

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private _databaseService: DatabaseService,
    private commonQueryService: CommonQueryService<Sys_Parameter>
  ) { }

  getApiUrl(activationCode: string) {
    try {
      return this.http.get<FireStoreReturn>("https://firestore.googleapis.com/v1/projects/idcp-34e86/databases/(default)/documents/urlList/" + activationCode, {
        headers:
        {
          skip: "true"
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  async load() {
    try {
      // for web development
      if (Capacitor.getPlatform() === 'web') {
        this.sys_parameter.push({
          Sys_ParameterId: 1,
          // apiUrl: 'https://localhost:44351/api/',
          apiUrl: 'https://idcp-demo.com/api/',
          // apiUrl: 'https://idcp-testing.motorparts.asia/api/',
          // apiUrl: 'https://idcp.motorparts.asia/api/',
          // apiUrl: 'https://idcp-ararat.com:8081/api/',
          imgUrl: null,
          lastDownloadAt: null
        })
        this.sys_parameter.push({
          Sys_ParameterId: 2,
          // apiUrl: 'https://localhost:44351/api/',
          // apiUrl: 'https://idcp-demo.com/api/',
          apiUrl: 'https://idcp-testing.motorparts.asia/api/',
          // apiUrl: 'https://idcp.motorparts.asia/api/',
          // apiUrl: 'https://idcp-ararat.com:8081/api/',
          imgUrl: null,
          lastDownloadAt: null
        })
        // if (this.sys_parameter && this.sys_parameter.length === 1) {
          this.selected_sys_param = this.sys_parameter[0];
        // }
      }
      else { // live
        this.sys_parameter = await this.commonQueryService.load(this.sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
        if (this.sys_parameter && this.sys_parameter.length === 1) {
          this.selected_sys_param = this.sys_parameter[0];
        } else {
          // let user select in login screen
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async insert(object: Sys_Parameter) {
    try {
      let sys_parameter: Sys_Parameter = {
        Sys_ParameterId: object.Sys_ParameterId,
        apiUrl: object?.apiUrl,
        imgUrl: object.imgUrl,
        lastDownloadAt: null,
      }
      await this.commonQueryService.insert(sys_parameter, "Sys_Parameter", dbConfig.idcpcore);
      // reload.
      await this.load();
    } catch (e) {
      console.error(e);
    }
  }

  async update(object: Sys_Parameter) {
    try {
      await this.commonQueryService.update(object, "Sys_Parameter", dbConfig.idcpcore);
    } catch (e) {
      console.error(e);
    }
  }

  async deleteSys_Param() {
    try {
      await this.commonQueryService.delete(this.selected_sys_param, "Sys_Parameter", dbConfig.idcpcore);
    } catch (e) {
      console.error(e);
    }
  }

  async syncInboundData(itemMasters: PDItemMaster[], itemBarcodes: PDItemBarcode[]) {
    try {
      await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Master, itemMasters);
      this.item_Masters = itemMasters;
      console.log('done sync item master')
      await this.commonQueryService.syncInboundData(inboundDb_Tables.item_Barcode, itemBarcodes);
      this.item_Barcodes = itemBarcodes;
      console.log('done sync item barcode')
    } catch (e) {
      console.error(e);
    }
    try {
      let obj = this.selected_sys_param;
      obj.lastDownloadAt = new Date;
      await this.update(obj);
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  async loadItemMaster(): Promise<PDItemMaster[]> {
    try {
      let ret = await this.commonQueryService.selectAll("Item_Master", dbConfig.inbounddb) as PDItemMaster[];
      this.item_Masters = ret;
      return this.item_Masters;
    } catch (e) {
      console.error(e);
    }
  }

  async loadItemBarcode(): Promise<PDItemBarcode[]> {
    try {
      let ret = await this.commonQueryService.selectAll("Item_Barcode", dbConfig.inbounddb) as PDItemBarcode[];
      this.item_Barcodes = ret;
      return this.item_Barcodes;
    } catch (e) {
      console.error(e);
    }
  }

}
