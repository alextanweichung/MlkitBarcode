import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { CashDeposit } from '../models/cash-deposit';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class CashDepositService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
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

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePosCashDeposit/masterlist");
  }

  uploadFile(keyId: number, fileId: number, file: any) {
    return this.http.post(this.baseUrl + "MobilePosCashDeposit/slipUpload/" + keyId + "/" + fileId, file, httpObserveHeader);
  }

  downloadFile(fileId: number) {
    return this.http.get(this.baseUrl + "MobilePosCashDeposit/imageFile/" + fileId, { responseType: 'blob' });
  }

}
