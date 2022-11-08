import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { StockCountList, StockCountRoot } from '../models/stock-count';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class StockCountService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileInventoryCount/masterList");
  }

  getInventoryCountList() {
    return this.http.get<StockCountList[]>(this.baseUrl + "MobileInventoryCount/iclist");
  }

  getInventoryCount(inventoryCountId: number) {
    return this.http.get<StockCountRoot>(this.baseUrl + "MobileInventoryCount/" + inventoryCountId);
  }

  getInventoryCountBatchByLocationId(locationId: number) {
    return this.http.get(this.baseUrl + "MobileInventoryCount/batchlist/" + locationId);
  }
  
}
