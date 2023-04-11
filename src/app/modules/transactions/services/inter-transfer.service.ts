import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { InterTransferHeader, InterTransferList, InterTransferRoot } from '../models/inter-transfer';
import { MasterList } from 'src/app/shared/models/master-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemList } from 'src/app/shared/models/item-list';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class InterTransferService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  /* #region hold object value */

  header: InterTransferHeader;
  itemInCart: TransactionDetail[] = [];
  setHeader(header: any) {
    this.header = header;
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
    this.itemInCart.forEach(r => {
      r.locationId = this.header.locationId;
    })
  }

  removeHeader() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  resetVariables() {
    this.removeHeader();
    this.removeItems();
  }

  /* #endregion */

  getObjectList(dateStart: string, dateEnd: string) {
    return this.http.get<InterTransferList[]>(this.baseUrl + "MobileInterTransfer/listing/" + dateStart + "/" + dateEnd);
  }

  getObjectById(objectId: number) {
    return this.http.get<InterTransferRoot>(this.baseUrl + "MobileInterTransfer/" + objectId);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileInterTransfer/masterlist");
  }

  getStaticLov() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileInterTransfer/staticLov");
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + "MobileInterTransfer/item/itemList", { context: background_load() });
  }

  insertObject(object: InterTransferRoot) {
    return this.http.post(this.baseUrl + "MobileInterTransfer", object, httpObserveHeader);
  }

}
