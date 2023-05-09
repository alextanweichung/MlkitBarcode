import { Injectable } from '@angular/core';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { Customer } from '../models/customer';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ConfigService } from 'src/app/services/config/config.service';
import { HttpClient } from '@angular/common/http';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { BackToBackOrderHeader, BackToBackOrderList, BackToBackOrderRoot } from '../models/backtoback-order';
import { format } from 'date-fns';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class BackToBackOrderService {

  baseUrl: string;
  
  promotionMaster: PromotionMaster[] = [];

  fullMasterList: MasterList[] = [];
  customerMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  shipMethodMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  areaMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  termPeriodMasterList: MasterListDetails[] = [];
  countryMasterList: MasterListDetails[] = [];

  salesTypeList: MasterListDetails[] = [];

  customers: Customer[] = [];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLovList();
    await this.loadCustomer();
  }

  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.discountGroupMasterList = this.fullMasterList.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);
    this.areaMasterList = this.fullMasterList.filter(x => x.objectName == 'Area').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.currencyMasterList = this.fullMasterList.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.termPeriodMasterList = this.fullMasterList.filter(x => x.objectName == 'TermPeriod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.countryMasterList = this.fullMasterList.filter(x => x.objectName == 'Country').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  async loadStaticLovList() {
    let fullMasterList = await this.getStaticLovList();
    this.salesTypeList = fullMasterList.filter(x => x.objectName == 'SalesType' && x.details != null).flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  async loadCustomer() {
    this.customers = await this.getCustomerList();
    await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
  }

  /* #region  for insert */

  object: BackToBackOrderRoot;
  objectHeader: BackToBackOrderHeader;
  itemInCart: TransactionDetail[] = [];
  async setHeader(objectHeader: BackToBackOrderHeader) {
    this.objectHeader = objectHeader;
    // load promotion first after customer confirmed or whenever header changed.
    this.promotionMaster = await this.getPromotion(format(new Date(this.objectHeader.trxDate), 'yyyy-MM-dd'), this.objectHeader.customerId);
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setObjectRoot(object: BackToBackOrderRoot) {
    this.object = object;
  }

  removeCustomer() {
    this.objectHeader = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeObject() {
    this.object = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeObject();
  }

  hasSalesAgent(): boolean {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
      return false;
    }
    return true
  }

  /* #endregion */

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileBackToBackOrder/masterlist").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileBackToBackOrder/staticLov").toPromise();
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileBackToBackOrder/customer").toPromise();
  }

  getPromotion(trxDate: string, customerId: number) {
    return this.http.get<PromotionMaster[]>(this.baseUrl + 'MobileBackToBackOrder/promotion/' + trxDate + '/' + customerId).toPromise();
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + "MobileBackToBackOrder/item/itemList", { context: background_load() });
  }

  // getObjectList() {
  //   return this.http.get<BackToBackOrderList[]>(this.baseUrl + "MobileBackToBackOrder/b2blist");
  // }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<BackToBackOrderList[]>(this.baseUrl + "MobileBackToBackOrder/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<BackToBackOrderRoot>(this.baseUrl + "MobileBackToBackOrder/" + objectId);
  }

  insertObject(object: BackToBackOrderRoot) {
    return this.http.post(this.baseUrl + "MobileBackToBackOrder", object, httpObserveHeader);
  }

  getCreditInfo(customerId: number) {
    return this.http.get<CreditInfo>(this.baseUrl + 'MobileBackToBackOrder/creditInfo/' + customerId);
  }

  // downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
  //   return this.http.post(this.baseUrl + "MobileBackToBackOrder/exportPdf",
  //     {
  //       "appCode": appCode,
  //       "format": format,
  //       "documentIds": [documentId],
  //       "reportName": reportName??null
  //     },
  //     { responseType: "blob" });
  // }

  // bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
  //   return this.http.post(this.baseUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  // }

  // getStatus(salesOrderId: number) {
  //   return this.http.get<SalesOrderStatus>(this.baseUrl + "MobileBackToBackOrder/status/" + salesOrderId);
  // }

}
