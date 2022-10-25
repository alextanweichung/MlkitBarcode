import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { InventoryLevel, InventoryVariationLevel } from '../models/check-balance';

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
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  //Load item list in background
  getItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + 'inventoryLevel/itemlist', { context: background_load() }).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  // getItemThumbnailById(itemId: number) {
  //   return this.http.get(this.baseUrl + 'inventoryLevel/itemInfoThumbnail/' + itemId, { observe: 'response' as 'response', responseType: 'blob' });
  // }

  getInventoryLevelByItem(itemId: number) {
    return this.http.get<InventoryLevel[]>(this.baseUrl + "inventoryLevel/item/" + itemId);
  }

  getInventoryLevelByVariation(itemId: number) {
    return this.http.get<InventoryVariationLevel[]>(this.baseUrl + "inventoryLevel/variation/" + itemId);
  }
  
}
