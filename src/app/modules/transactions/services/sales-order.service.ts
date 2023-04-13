import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { CreditInfo } from 'src/app/shared/models/credit-info';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { SalesOrderStatus } from 'src/app/shared/models/sales-order-status';
import { SalesSearchModal } from 'src/app/shared/models/sales-search-modal';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { Customer } from '../models/customer';
import { SalesOrderHeader, SalesOrderList, SalesOrderRoot, SalesOrderSummary } from '../models/sales-order';
import { format } from 'date-fns';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {

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

  customers: Customer[] = [];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
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
  }

  async loadCustomer() {
    this.customers = await this.getCustomerList();
    await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
  }

  /* #region  for insert */

  header: SalesOrderHeader;
  itemInCart: TransactionDetail[] = [];
  salesOrderSummary: SalesOrderSummary;
  async setHeader(header: SalesOrderHeader) {
    this.header = header;
    // load promotion first after customer confirmed or whenever header changed.
    this.promotionMaster = await this.getPromotion(format(new Date(this.header.trxDate), 'yyyy-MM-dd'), this.header.customerId);
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setSalesOrderSummary(ss: SalesOrderSummary) {
    this.salesOrderSummary = ss;
  }

  removeCustomer() {
    this.header = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeSummary() {
    this.salesOrderSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeSummary();
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
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/masterlist").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/staticLov");
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileSalesOrder/customer").toPromise();
  }

  getPromotion(trxDate: string, customerId: number) {
    return this.http.get<PromotionMaster[]>(this.baseUrl + 'MobileSalesOrder/promotion/' + trxDate + '/' + customerId).toPromise();
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.baseUrl + "MobileSalesOrder/item/itemList", { context: background_load() });
  }

  getObjectList() {
    return this.http.get<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/solist");
  }

  getObjectListByDate(searchObject: SalesSearchModal) {
    return this.http.post<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/listing", searchObject);
  }

  getObjectById(objectId: number) {
    return this.http.get<SalesOrderRoot>(this.baseUrl + "MobileSalesOrder/" + objectId);
  }

  insertObject(object: SalesOrderRoot) {
    return this.http.post(this.baseUrl + "MobileSalesOrder", object, httpObserveHeader);
  }

  getCreditInfo(customerId: number) {
    return this.http.get<CreditInfo>(this.baseUrl + 'MobileSalesOrder/creditInfo/' + customerId);
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
    return this.http.post(this.baseUrl + "MobileSalesOrder/exportPdf",
      {
        "appCode": appCode,
        "format": format,
        "documentIds": [documentId]
      },
      { responseType: "blob" });
  }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.baseUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

  getStatus(salesOrderId: number) {
    return this.http.get<SalesOrderStatus>(this.baseUrl + "MobileSalesOrder/status/" + salesOrderId);
  }

}
