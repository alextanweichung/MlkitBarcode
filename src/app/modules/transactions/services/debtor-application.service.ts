import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { DebtorApplicationHeader, DebtorApplicationList, DebtorApplicationRoot } from '../models/debtor-application';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { WorkFlowState } from 'src/app/shared/models/workflow';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class DebtorApplicationService {
  
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    
  }
  
  hasSalesAgent(): boolean {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    if (salesAgentId === undefined || salesAgentId === null || salesAgentId === 0) {
      return false;
    }
    return true
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLov();
  }

  fullMasterList: MasterList[] = [];
  areaMasterList: MasterListDetails[] = [];
  countryMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  glAccountMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  paymentMethodMasterList: MasterListDetails[] = [];
  priceSegmentMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  stateMasterList: MasterListDetails[] = [];
  taxMasterList: MasterListDetails[] = [];
  termPeriodMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.areaMasterList = this.fullMasterList.filter(x => x.objectName == 'Area').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.countryMasterList = this.fullMasterList.filter(x => x.objectName == 'Country').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.currencyMasterList = this.fullMasterList.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.glAccountMasterList = this.fullMasterList.filter(x => x.objectName == 'GlAccount').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.paymentMethodMasterList = this.fullMasterList.filter(x => x.objectName == 'PaymentMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.priceSegmentMasterList = this.fullMasterList.filter(x => x.objectName == 'PriceSegment').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.salesAgentMasterList = this.fullMasterList.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.stateMasterList = this.fullMasterList.filter(x => x.objectName == 'State').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.taxMasterList = this.fullMasterList.filter(x => x.objectName == 'Tax').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.termPeriodMasterList = this.fullMasterList.filter(x => x.objectName == 'TermPeriod').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  loadStaticLov() {
    
  }

  getObjects() {
    return this.http.get<DebtorApplicationList[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication");
  }

  getObjectById(objectId: number) {
    return this.http.get<DebtorApplicationRoot>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/" + objectId);
  }

  insertObject(object: DebtorApplicationHeader) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication", object, httpObserveHeader);
  }
  
  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/masterlist").toPromise();
  }

  getWorkflow(objectId: number) {
    return this.http.get<WorkFlowState[]>(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/workflow/" + objectId);
  }

  uploadFile(keyId: number, fileId: number, file: any) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/uploadFile/" + keyId + "/" + fileId, file, httpObserveHeader);
  }

  downloadFile(keyId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/downloadFile/" + keyId, { responseType: "blob"});
  }

  deleteFile(keyId: number) {
    return this.http.delete(this.configService.selected_sys_param.apiUrl + "MobileDebtorApplication/deleteFile/" + keyId, httpObserveHeader);
  }

}
