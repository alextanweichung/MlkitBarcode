import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { ItemBarcodeModel } from 'src/app/shared/models/item-barcode';
import { MasterList } from 'src/app/shared/models/master-list';
import { InventoryCountBatchCriteria, InventoryCountBatchList, StockCount, StockCountDetail, StockCountHeader, StockCountList, StockCountRoot } from '../models/stock-count';

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

  stockCountHeader: StockCountHeader;
  setHeader(stockCountHeader: StockCountHeader) {
    this.stockCountHeader = stockCountHeader;
  }
  
  stockCountLines: StockCountDetail[] = []
  setLines(stockCountLines: StockCountDetail[]) {
    this.stockCountLines = stockCountLines;
    console.log("🚀 ~ file: stock-count.service.ts ~ line 37 ~ StockCountService ~ setLines ~ this.stockCountLines", this.stockCountLines)
  }

  removeHeader() {
    this.stockCountHeader = null
  }

  removeLines() {
    this.stockCountLines = [];
  }

  resetVariables() {
    this.removeHeader();
    this.removeLines();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileInventoryCount/masterList");
  }

  getInventoryCountByDate(startDate, endDate) {
    return this.http.get<StockCount[]>(this.baseUrl + "MobileInventoryCount/listing/" + startDate + "/" + endDate);
  }

  getInventoryCountList() {
    return this.http.get<StockCountList[]>(this.baseUrl + "MobileInventoryCount/iclist");
  }

  getInventoryCount(inventoryCountId: number) {
    return this.http.get<StockCountRoot>(this.baseUrl + "MobileInventoryCount/" + inventoryCountId);
  }

  getInventoryCountBatchByLocationId(locationId: number) {
    return this.http.get<InventoryCountBatchList[]>(this.baseUrl + "MobileInventoryCount/batchlist/" + locationId);
  }
  
  getInventoryCountBatchCriteria(inventoryCountBatchId: number) {
    return this.http.get<InventoryCountBatchCriteria>(this.baseUrl + "MobileInventoryCount/batchRandomList/" + inventoryCountBatchId);
  }

  getItemInfoByBarcode(barcode: string) {
    return this.http.get<ItemBarcodeModel>(this.baseUrl + "MobileInventoryCount/itemByBarcode/" + barcode);
  }

  insertInventoryCount(inventoryCountRoot: StockCountRoot) {
    return this.http.post(this.baseUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
  }

  updateInventoryCount(inventoryCountRoot: StockCountRoot) {
    return this.http.put(this.baseUrl + "MobileInventoryCount", inventoryCountRoot, httpObserveHeader);
  }
  
}
