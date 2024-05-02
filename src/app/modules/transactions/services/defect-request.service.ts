import { HttpClient } from "@angular/common/http";
import { format } from "date-fns";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { background_load } from "src/app/core/interceptors/error-handler.interceptor";
import { AuthService } from "src/app/services/auth/auth.service";
import { ConfigService } from "src/app/services/config/config.service";
import { LoadingService } from "src/app/services/loading/loading.service";
import { CreditInfo } from "src/app/shared/models/credit-info";
import { ItemList } from "src/app/shared/models/item-list";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { ModuleControl } from "src/app/shared/models/module-control";
import { PrecisionList } from "src/app/shared/models/precision-list";
import { SalesItemInfoRoot } from "src/app/shared/models/sales-item-info";
import { SearchDropdownList } from "src/app/shared/models/search-dropdown-list";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { BulkConfirmReverse } from "src/app/shared/models/transaction-processing";
import { WorkFlowState } from "src/app/shared/models/workflow";
import { Customer } from "../models/customer";
import { QuotationHeader, QuotationRoot } from "../models/quotation";
import { OtherAmount } from "../models/sales-order";
import { DefectRequestList } from "../models/defect-request";
import { Injectable } from "@angular/core";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class DefectRequestService {   

   filterStartDate: Date;
   filterEndDate: Date;
   
   fullMasterList: MasterList[] = [];
   customerMasterList: MasterListDetails[] = [];

   customers: Customer[] = [];

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService,
      private loadingService: LoadingService
   ) { }

   // Method to clean up the subscription
   stopListening() {
      if (this.custSubscription) {
         this.custSubscription.unsubscribe();
      }
   }

   async loadRequiredMaster() {
      try {
         await this.loadingService.showLoading();
         await this.loadCustomer();
         await this.loadMasterList();
         await this.loadModuleControl();
         await this.loadingService.dismissLoading();
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }
   
   custSubscription: Subscription;
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.custSubscription = this.authService.customerMasterList$.subscribe(obj => {
         let savedCustomerList = obj;
         if (savedCustomerList) {
            this.customerMasterList = savedCustomerList.filter(y => y.deactivated === 0);
         } else {
            this.authService.rebuildCustomerList();
         }
      })
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

   moduleControl: ModuleControl[];
   allowDocumentWithEmptyLine: string = "N";
   precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionSalesUnitPrice: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;

            let allowDocumentWithEmptyLine = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
            if (allowDocumentWithEmptyLine != undefined) {
               this.allowDocumentWithEmptyLine = allowDocumentWithEmptyLine.ctrlValue.toUpperCase();
            }
         })
         this.authService.precisionList$.subscribe(precision => {
            this.precisionSales = precision.find(x => x.precisionCode === "SALES");
            if (this.precisionSales.localMin === null) this.precisionSales.localMin = 2;
            if (this.precisionSales.localMax === null) this.precisionSales.localMax = 2;
            if (this.precisionSales.localFormat === null) this.precisionSales.localFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;
            if (this.precisionSales.foreignMin === null) this.precisionSales.foreignMin = 2;
            if (this.precisionSales.foreignMax === null) this.precisionSales.foreignMax = 2;
            if (this.precisionSales.foreignFormat === null) this.precisionSales.foreignFormat = `1.${this.precisionSales.localMin}-${this.precisionSales.localMax}`;

            this.precisionSalesUnitPrice = precision.find(x => x.precisionCode === "SALESUNITPRICE");
            if (this.precisionSalesUnitPrice.localMin === null) this.precisionSalesUnitPrice.localMin = 2;
            if (this.precisionSalesUnitPrice.localMax === null) this.precisionSalesUnitPrice.localMax = 2;
            if (this.precisionSalesUnitPrice.localFormat === null) this.precisionSalesUnitPrice.localFormat = `1.${this.precisionSalesUnitPrice.localMin}-${this.precisionSalesUnitPrice.localMax}`;
            if (this.precisionSalesUnitPrice.foreignMin === null) this.precisionSalesUnitPrice.foreignMin = 2;
            if (this.precisionSalesUnitPrice.foreignMax === null) this.precisionSalesUnitPrice.foreignMax = 2;
            if (this.precisionSalesUnitPrice.foreignFormat === null) this.precisionSalesUnitPrice.foreignFormat = `1.${this.precisionSalesUnitPrice.localMin}-${this.precisionSalesUnitPrice.localMax}`;

            this.precisionTax = precision.find(x => x.precisionCode === "TAX");
            if (this.precisionTax.localMin === null) this.precisionTax.localMin = 2;
            if (this.precisionTax.localMax === null) this.precisionTax.localMax = 2;
            if (this.precisionTax.localFormat === null) this.precisionTax.localFormat = `1.${this.precisionTax.localMin}-${this.precisionTax.localMax}`;
            if (this.precisionTax.foreignMin === null) this.precisionTax.foreignMin = 2;
            if (this.precisionSalesUnitPrice.foreignMax === null) this.precisionTax.foreignMax = 2;
            if (this.precisionTax.foreignFormat === null) this.precisionTax.foreignFormat = `1.${this.precisionTax.localMin}-${this.precisionTax.localMax}`;
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  for insert */

   objectHeader: QuotationHeader;
   objectOtherAmt: OtherAmount[] = [];
   objectDetail: TransactionDetail[] = [];
   objectSalesHistory: SalesItemInfoRoot[] = [];
   async setHeader(objectHeader: QuotationHeader) {
      this.objectHeader = objectHeader;
   }

   setLine(objectDetail: TransactionDetail[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   setOtherAmt(otherAmt: OtherAmount[]) {
      this.objectOtherAmt = JSON.parse(JSON.stringify(otherAmt));
   }

   objectSummary: QuotationRoot
   setSummary(objectSummary: QuotationRoot) {
      this.objectSummary = objectSummary;
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
      this.objectSalesHistory = [];
   }

   removeOtherAmt() {
      this.objectOtherAmt = [];
   }

   removeSummary() {
      this.objectSummary = null;
   }

   resetVariables() {
      this.removeHeader();
      this.removeLine();
      this.removeOtherAmt();
      this.removeSummary();
   }

   hasSalesAgent(): boolean {
      let salesAgentId = JSON.parse(localStorage.getItem("loginUser"))?.salesAgentId;
      if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
         return false;
      }
      return true
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/masterlist", { context: background_load() }).toPromise();
   }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/staticLov").pipe(
         map((response: any) =>
            response.map((item: any) => item)
         )
      );
   }

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/customer", { context: background_load() }).toPromise();
   }

   getFullItemList() {
      return this.http.get<ItemList[]>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/item/itemList", { context: background_load() });
   }

   getObjectListByDate(dateStart: string, dateEnd: string) {
      return this.http.get<DefectRequestList[]>(this.configService.selected_sys_param.apiUrl + `MobileDefectRequest/listing/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/" + objectId);
   }

   insertObject(object: QuotationRoot) {
      return this.http.post<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest", object, httpObserveHeader);
   }

   updateObject(object: QuotationRoot) {
      return this.http.put<QuotationRoot>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest", object, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/deactivate/" + objectId, null, httpObserveHeader);
   }

   getCreditInfo(customerId: number) {
      return this.http.get<CreditInfo>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/creditInfo/" + customerId);
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId]
         },
         { responseType: "blob" });
   }

   bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + "/bulkUpdate", bulkConfirmReverse, httpObserveHeader);
   }

   getWorkflow(objectId: number) {
      return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/workflow/" + objectId);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDefectRequest/jsonDebug", debugObject, httpObserveHeader);
   }

   generateDocument(objectId: number){
     return this.http.post(this.configService.selected_sys_param.apiUrl + `MobileDefectRequest/generateDocument/${objectId}`, null, httpObserveHeader);
   }

}
