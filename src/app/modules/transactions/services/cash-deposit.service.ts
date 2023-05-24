import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { CashDeposit } from '../models/cash-deposit';
import { Customer } from '../models/customer';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class CashDepositService {

  baseUrl: string;

  customers: Customer[] = [];

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    // await this.loadCustomer();
  }

  fullMasterList: MasterList[] = [];
  paymentMethodMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName == 'PaymentMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  async loadCustomer() {
    this.customers = await this.getCustomerList();
    await this.customers.sort((a, c) => { return a.name > c.name ? 1 : -1 });
  }

  getObjects() {
    return this.http.get<CashDeposit[]>(this.baseUrl + "MobilePosCashDeposit");
  }

  insertObject(object) {
    return this.http.post(this.baseUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
  }

  updateObject(object) {
    return this.http.put(this.baseUrl + "MobilePosCashDeposit", object, httpObserveHeader).toPromise();
  }

  getObject(objectId: number) {
    return this.http.get<CashDeposit>(this.baseUrl + "MobilePosCashDeposit/" + objectId);
  }

  deleteObject(objectId: number) {
    return this.http.delete(this.baseUrl + "MobilePosCashDeposit/" + objectId, httpObserveHeader);
  }

  toggleObject(objectId: number) {
    return this.http.put(this.baseUrl + "MobilePosCashDeposit/deactivate/" + objectId, null, httpObserveHeader);
  }

  // upload file

  // update collection

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobilePosCashDeposit/customer").toPromise();
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePosCashDeposit/masterlist").toPromise();
  }

  uploadFile(keyId: number, fileId: number, file: any) {
    return this.http.post(this.baseUrl + "MobilePosCashDeposit/slipUpload/" + keyId + "/" + fileId, file, httpObserveHeader);
  }

  downloadFile(fileId: number) {
    return this.http.get(this.baseUrl + "MobilePosCashDeposit/imageFile/" + fileId, { responseType: 'blob' });
  }

}
