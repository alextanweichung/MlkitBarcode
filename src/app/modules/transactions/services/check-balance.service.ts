import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { InventoryLevel, InventoryVariationLevel, ItemPriceBySegment } from '../models/check-balance';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class CheckBalanceService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    console.log("🚀 ~ file: check-balance.service.ts:26 ~ CheckBalanceService ~ apiUrl:")
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  //Load item list in background
  getItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + 'mobileInventoryLevel/itemlist', { context: background_load() }).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  // getItemThumbnailById(itemId: number) {
  //   return this.http.get(this.baseUrl + 'inventoryLevel/itemInfoThumbnail/' + itemId, { observe: 'response' as 'response', responseType: 'blob' });
  // }

  getInventoryLevelByItem(itemId: number) {
    return this.http.get<InventoryLevel[]>(this.baseUrl + "mobileInventoryLevel/item/" + itemId);
  }

  getInventoryLevelByVariation(itemId: number) {
    return this.http.get<InventoryVariationLevel[]>(this.baseUrl + "mobileInventoryLevel/variation/" + itemId);
  }

  getSegmentItemPriceBySalesAgent(salesAgentId: number, itemId: number) {
    return this.http.get<ItemPriceBySegment[]>(this.baseUrl + "mobileInventoryLevel/price/" + salesAgentId + "/" + itemId);
  }
  
}
