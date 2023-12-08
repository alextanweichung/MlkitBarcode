import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { CashDeposit } from '../models/cash-deposit';
import { Customer } from '../models/customer';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
   observe: 'response' as 'response'
};

@Injectable({
   providedIn: 'root'
})
export class CashDepositService {

   customers: Customer[] = [];

   constructor(
      private http: HttpClient,
      private configService: ConfigService
   ) {

   }

   async loadRequiredMaster() {
      await this.loadMasterList();
      // await this.loadCustomer();
   }

   fullMasterList: MasterList[] = [];
   paymentMethodMasterList: MasterListDetails[] = [];
   locationMasterList: MasterListDetails[] = [];
   customerMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.getMasterList();
      this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName == "PaymentMethod").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.fullMasterList.filter(x => x.objectName == "Location").flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = this.locationMasterList.filter(r => this.configService.loginUser.locationId.includes(r.id));
      this.customerMasterList = this.fullMasterList.filter(x => x.objectName == "Customer").flatMap(src => src.details).filter(y => y.deactivated == 0);
      // attribute6 = locationId
      console.log("🚀 ~ file: cash-deposit.service.ts:43 ~ CashDepositService ~ loadMasterList ~ this.customerMasterList:", this.customerMasterList)
   }

   async loadCustomer() {
      this.customers = await this.getCustomerList();
      await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
   }

   getObjects() {
      return this.http.get<CashDeposit[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit");
   }

   insertObject(object) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
   }

   updateObject(object) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
   }

   getObject(objectId: number) {
      return this.http.get<CashDeposit>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/" + objectId);
   }

   deleteObject(objectId: number) {
      return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/" + objectId, httpObserveHeader);
   }

   toggleObject(objectId: number) {
      return this.http.put(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/deactivate/" + objectId, null, httpObserveHeader);
   }

   // upload file

   // update collection

   getCustomerList() {
      return this.http.get<Customer[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/customer").toPromise();
   }

   getMasterList() {
      return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/masterlist").toPromise();
   }

   uploadFile(keyId: number, fileId: number, file: any) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/slipUpload/" + keyId + "/" + fileId, file, httpObserveHeader);
   }

   downloadFile(fileId: number) {
      return this.http.get(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/imageFile/" + fileId, { responseType: 'blob' });
   }

   sendDebug(debugObject: JsonDebug) {
      return this.http.post(this.configService.selected_sys_param.apiUrl + "MobilePosCashDeposit/jsonDebug", debugObject, httpObserveHeader);
   }

}
