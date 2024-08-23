import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ConfigService } from "src/app/services/config/config.service";
import { MasterList } from "src/app/shared/models/master-list";
import { MasterListDetails } from "src/app/shared/models/master-list-details";
import { TransactionDetail } from "src/app/shared/models/transaction-detail";
import { TransferOutRoot, TransferOutLine, TransferOutList } from "../models/transfer-out";
import { JsonDebug } from "src/app/shared/models/jsonDebug";
import { ModuleControl } from "src/app/shared/models/module-control";
import { AuthService } from "src/app/services/auth/auth.service";

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})

export class TransferOutService {

   filterStartDate: Date;
   filterEndDate: Date;

   fullMasterList: MasterList[] = [];
   interTransferTypeList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   fullLocationMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];

   selectedLocation: number;

   pageNum: number = 1;

   constructor(
      private http: HttpClient,
      private authService: AuthService,
      private configService: ConfigService
   ) { }

   async loadRequiredMaster() {
      await this.loadMasterList();
      await this.loadModuleControl();
   }

   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.fullLocationMasterList = this.fullMasterList.filter(x => x.objectName === "Location").flatMap(src => src.details);
      this.locationMasterList = this.fullLocationMasterList.filter(r => (this.configService.loginUser.locationId.length === 0 || this.configService.loginUser.locationId.includes(r.id)));
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details);
   }  

   moduleControl: ModuleControl[] = [];
   configMobileScanItemContinuous: boolean = false;
   configTransferOutActivateContainerNum : boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let mobileScanItemContinuous = this.moduleControl.find(x => x.ctrlName === "MobileScanItemContinuous");
         if (mobileScanItemContinuous && mobileScanItemContinuous.ctrlValue.toUpperCase() === "Y") {
            this.configMobileScanItemContinuous = true;
         } else {
            this.configMobileScanItemContinuous = false;
         }
         let transferOutActivateContainerNum = this.moduleControl.find(x => x.ctrlName === "TransferOutActivateContainerNum");
         if (transferOutActivateContainerNum && transferOutActivateContainerNum.ctrlValue.toUpperCase() === "Y") {
            this.configTransferOutActivateContainerNum = true;
         } else {
            this.configTransferOutActivateContainerNum = false;
         }
      })
   }

   /* #region  for insert */

   objectHeader: TransferOutRoot;
   objectDetail: TransferOutLine[] = [];
   async setHeader(objectHeader: TransferOutRoot) {
      this.objectHeader = objectHeader;
   }

   setLine(objectDetail: TransferOutLine[]) {
      this.objectDetail = JSON.parse(JSON.stringify(objectDetail));
   }

   removeHeader() {
      this.objectHeader = null;
   }

   removeLine() {
      this.objectDetail = [];
   }

   resetVariables() {
      this.pageNum = 1;
      this.removeHeader();
      this.removeLine();
   }

   /* #endregion */

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/masterlist").toPromise();
   }

   // getConsignmentLocation() {
   //   return this.http.get<ConsignmentSalesLocation[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/consignmentLocation").toPromise();
   // }

   getStaticLovList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/staticLov");
   }

   getObjectList(dateStart: string, dateEnd: string) {
      return this.http.get<TransferOutList[]>(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/toList/${dateStart}/${dateEnd}`);
   }

   getObjectById(objectId: number) {
      return this.http.get<TransferOutRoot>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/" + objectId);
   }

   insertObject(object: TransferOutRoot) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
   }

   updateObject(object: TransferOutRoot) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobileTransferOut", object, httpObserveHeader);
   }

   completeObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + `MobileTransferOut/generateDocument/${objectId}`, null, httpObserveHeader)
   }

   downloadPdf(appCode: any, format: string = "pdf", documentId: any, reportName?: string) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/exportPdf",
         {
            "appCode": appCode,
            "format": format,
            "documentIds": [documentId],
            "reportName": reportName ?? null
         },
         { responseType: "blob" });
   }

   // for web testing 
   validateBarcode(barcode: string) {
      return this.http.get<TransactionDetail>(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/itemByBarcode/" + barcode);
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileTransferOut/jsonDebug", debugObject, httpObserveHeader);
   }

}
