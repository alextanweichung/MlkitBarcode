import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { TruckLoadingHeader, TruckLoadingRoot, TruckLoadingTrxDetails } from '../models/truck-loading';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class TruckLoadingService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
    await this.loadStaticLov();
  }

  fullMasterList: MasterList[] = [];
  shipMethodMasterList: MasterListDetails[] = [];
  vendorMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.shipMethodMasterList = this.fullMasterList.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.vendorMasterList = this.fullMasterList.filter(x => x.objectName == 'Vendor').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }
  
  truckLoadingType: MasterListDetails[] = [];
  async loadStaticLov() {
    let staticLov = await this.getStaticLov();
    this.truckLoadingType = await staticLov.filter(x => x.objectName == 'TruckLoadingType').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  getObjects() {
    return this.http.get<TruckLoadingHeader[]>(this.baseUrl + "MobileTruckLoading").pipe(
      map((response: any) =>
        response.data.map((item: any) => item)
      )
    );
  }

  insertObject(object: TruckLoadingRoot) {
    return this.http.post(this.baseUrl + "MobileTruckLoading", object, httpObserveHeader);
  }

  updateObject(object: TruckLoadingRoot) {
    return this.http.put(this.baseUrl + "MobileTruckLoading", object, httpObserveHeader);
  }

  getObject(objectId: number) {
    return this.http.get<TruckLoadingRoot>(this.baseUrl + "MobileTruckLoading/" + objectId);
  }

  deleteObject(objectId: number) {
    return this.http.delete(this.baseUrl + "MobileTruckLoading/" + objectId, httpObserveHeader);
  }

  toggleObject(objectId: number) {
    return this.http.put(this.baseUrl + "MobileTruckLoading/deactivate/" + objectId, httpObserveHeader);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileTruckLoading/masterlist").toPromise();
  }

  getStaticLov() {
    return this.http.get<MasterList[]>( this.baseUrl + "MobileTruckLoading/staticLov").toPromise();
  }

  getLineDetailsByTrxNum(trxNum: string){
    return this.http.get<TruckLoadingTrxDetails>(this.baseUrl + "MobileTruckLoading/fromTrxNum/" + trxNum);    
  }

}
