import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { Item } from 'src/app/modules/transactions/models/item';
import { ConfigService } from 'src/app/services/config/config.service';

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

  getItemListWithTax(keyword: string, trxDate: string, customerId: number, locationId: number) {
    return this.http.get<Item[]>(this.baseUrl + this.apiObject + "/item/itemListWithTax/" + keyword + "/" + trxDate + "/" + customerId + "/" + locationId, { context: background_load() });
  }
  
}
