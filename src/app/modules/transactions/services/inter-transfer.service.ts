import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { InterTransferHeader, InterTransferList, InterTransferRoot } from '../models/inter-transfer';
import { MasterList } from 'src/app/shared/models/master-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemList } from 'src/app/shared/models/item-list';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';

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

  removeHeader() {
    this.header = null;
  }

  resetVariables() {
    this.removeHeader();
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

}
