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
import { map } from 'rxjs/operators';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class BackToBackOrderService {
  
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

  object: BackToBackOrderRoot;
  header: BackToBackOrderHeader;
  itemInCart: TransactionDetail[] = [];
  async setHeader(objectHeader: BackToBackOrderHeader) {
    this.header = objectHeader;
    // load promotion first after customer confirmed or whenever header changed.
    this.promotionMaster = await this.getPromotion(format(new Date(this.header.trxDate), 'yyyy-MM-dd'), this.header.customerId);
  }

  setChoosenItems(items: TransactionDetail[]) {
    this.itemInCart = JSON.parse(JSON.stringify(items));
  }

  setObjectRoot(object: BackToBackOrderRoot) {
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
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/masterlist").toPromise();
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/staticLov").toPromise();
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/customer").toPromise();
  }

  getPromotion(trxDate: string, customerId: number) {
    return this.http.get<PromotionMaster[]>(this.configService.selected_sys_param.apiUrl + 'MobileBackToBackOrder/promotion/' + trxDate + '/' + customerId).toPromise();
  }

  getFullItemList() {
    return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/item/itemList", { context: background_load() });
  }

  // getObjectList() {
  //   return this.http.get<BackToBackOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/b2blist");
  // }

  getObjectListByDate(startDate: string, endDate: string) {
    return this.http.get<BackToBackOrderList[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/listing/" + startDate + "/" + endDate);
  }

  getObjectById(objectId: number) {
    return this.http.get<BackToBackOrderRoot>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/" + objectId);
  }

  insertObject(object: BackToBackOrderRoot) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder", object, httpObserveHeader);
  }

  updateObject(object: BackToBackOrderRoot) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder", object, httpObserveHeader);
  }

  toggleObject(objectId: number) {
    return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/deactivate/" + objectId, null, httpObserveHeader);
  }

  getCreditInfo(customerId: number) {
    return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + 'MobileBackToBackOrder/creditInfo/' + customerId);
  }

  // downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
  //   return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/exportPdf",
  //     {
  //       "appCode": appCode,
  //       "format": format,
  //       "documentIds": [documentId],
  //       "reportName": reportName??null
  //     },
  //     { responseType: "blob" });
  // }

  // bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
  //   return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  // }

  // getStatus(salesOrderId: number) {
  //   return this.http.get<SalesOrderStatus>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/status/" + salesOrderId);
  // }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

  getWorkflow(objectId: number) {
    return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/workflow/" + objectId);
  }

  getTrxChild(objectId: number){
    return this.http.get<TrxChild>(this.configService.selected_sys_param.apiUrl + "MobileBackToBackOrder/child/" + objectId).pipe(
      map((response: any) =>       
        response.map((item: any) => item)   
      )
    );
  }

}
