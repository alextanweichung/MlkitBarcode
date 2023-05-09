import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { InventoryLevel, InventoryVariationLevel, ItemPriceBySegment } from '../models/inventory-level';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class InventoryLevelService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
  }

  fullMasterList: MasterList[] = [];
  locationMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);
  }

  //Load item list in background
  getItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + 'mobileInventoryLevel/itemlist', { context: background_load() }).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "mobileInventoryLevel/masterlist").toPromise();
  }

  // getItemThumbnailById(itemId: number) {
  //   return this.http.get(this.baseUrl + 'inventoryLevel/itemInfoThumbnail/' + itemId, { observe: 'response' as 'response', responseType: 'blob' });
  // }

  getInventoryLevelByItem(itemId: number, loginUserType: string, salesAgentId?: number) {
    return this.http.get<InventoryLevel[]>(this.baseUrl + "mobileInventoryLevel/item/" + itemId + "/" + loginUserType + "/" + salesAgentId);
  }

  getInventoryLevelByVariation(itemId: number, loginUserType: string, salesAgentId?: number) {
    return this.http.get<InventoryVariationLevel[]>(this.baseUrl + "mobileInventoryLevel/variation/" + itemId + "/" + loginUserType + "/" + salesAgentId);
  }

  getSegmentItemPriceBySalesAgent(itemId: number, loginUserType: string, salesAgentId?: number) {
    return this.http.get<ItemPriceBySegment[]>(this.baseUrl + "mobileInventoryLevel/price/" + itemId + "/" + loginUserType + "/" + salesAgentId);
  }
  
}
