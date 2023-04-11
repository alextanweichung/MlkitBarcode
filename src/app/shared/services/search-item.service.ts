import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { Item, ItemImage } from 'src/app/modules/transactions/models/item';
import { ConfigService } from 'src/app/services/config/config.service';
import { TransactionDetail } from '../models/transaction-detail';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SearchItemService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    @Inject('apiObject') private apiObject: string
  ) {
    this.apiObject = apiObject;
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getItemInfo(itemId: number, trxDate: string, keyId: number, locationId: number) {
    return this.http.get<TransactionDetail>(this.baseUrl + this.apiObject + "/item/" + itemId + "/" + trxDate + "/" + keyId + "/" + locationId, { context: background_load() });
  }

  getItemInfoByKeyword(keyword: string, trxDate: string, keyId: number, locationId: number) {
    return this.http.get<TransactionDetail[]>(this.baseUrl + this.apiObject + "/item/itemList/" + keyword + "/" + trxDate + "/" + keyId + "/" + locationId);
  }

  getItemImageFile(keyword: string) {
    return this.http.get<ItemImage[]>(this.baseUrl + this.apiObject + "/itemList/imageFile/" + keyword, { context: background_load() });
  }

  getItemInfoWithoutPrice(keyword: string) {
    return this.http.get<TransactionDetail[]>(this.baseUrl + this.apiObject + "/item/itemList/" + keyword);
  }

}
