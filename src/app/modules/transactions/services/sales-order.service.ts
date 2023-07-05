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
import { SalesOrderHeader, SalesOrderList, SalesOrderRoot } from '../models/sales-order';
import { format } from 'date-fns';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { map } from 'rxjs/operators';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  
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
    this.bindCustomerList();
  }

  customerSearchDropdownList: SearchDropdownList[] = [];
  bindCustomerList() {
    this.customerSearchDropdownList = [];
    this.customers.forEach(r => {
      this.customerSearchDropdownList.push({
        id: r.customerId,
        code: r.customerCode,
        oldCode: r.oldCustomerCode,
        description: r.name
      })
    })
  }
  
  /* #region  for insert */

  header: SalesOrderHeader;
  itemInCart: TransactionDetail[] = [];
  object: SalesOrderRoot;
  async setHeader(header: SalesOrderHeader) {
    this.header = header;
    // load promotion first after customer confirmed or whenever header changed.
    this.promotionMaster = await this.getPromotion(format(new Date(this.header.trxDate), 'yyyy-MM-dd'), this.header.customerId);
    console.log("🚀 ~ file: sales-order.service.ts:100 ~ SalesOrderService ~ setHeader ~ this.promotionMaster:", this.promotionMaster)
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setObject(object: SalesOrderRoot) {
    this.object = object;
  }

  removeCustomer() {
    this.header = null;
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
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/masterlist").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/staticLov");
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/customer", { context: background_load() }).toPromise();
  }

  getPromotion(trxDate: string, customerId: number) {
    return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + 'MobileSalesOrder/promotion/' + trxDate + '/' + customerId).toPromise();
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/item/itemList", { context: background_load() });
  }

  getObjectList() {
    return this.http.get<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/solist");
  }

  getObjectListByDate(searchObject: SalesSearchModal) {
    return this.http.post<SalesOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/listing", searchObject);
  }

  getObjectById(objectId: number) {
    return this.http.get<SalesOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/" + objectId);
  }

  insertObject(object: SalesOrderRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder", object, httpObserveHeader);
  }

  updateObject(object: SalesOrderRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder", object, httpObserveHeader);
  }

  toggleObject(objectId: number) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/deactivate/" + objectId, null, httpObserveHeader);
  }

  getCreditInfo(customerId: number) {
    return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + 'MobileSalesOrder/creditInfo/' + customerId);
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/exportPdf",
      {
        "appCode": appCode,
        "format": format,
        "documentIds": [documentId],
        "reportName": reportName??null
      },
      { responseType: "blob" });
  }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

  getStatus(objectId: number) {
    return this.http.get<SalesOrderStatus>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/status/" + objectId);
  }

  getWorkflow(objectId: number) {
    return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/workflow/" + objectId);
  }

  getTrxChild(objectId: number){
    return this.http.get<TrxChild>(this.configService.selected_sys_param.apiUrl + "MobileSalesOrder/child/" + objectId).pipe(
      map((response: any) =>       
        response.map((item: any) => item)   
      )
    );
  }

}
