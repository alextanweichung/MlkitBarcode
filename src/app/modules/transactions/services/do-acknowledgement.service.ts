import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { DOAcknowledegementRequest, DoAcknowledgement } from '../models/do-acknowledgement';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class DoAcknowledgementService {

  fullMasterList: MasterList[] = [];
  vehicleMasterList: MasterListDetails[] = [];
  customerMasterList: MasterListDetails[] = [];

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authService: AuthService
  ) {}

  async loadRequiredMaster() {
    await this.loadMasterList();
  }

  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.vehicleMasterList = this.fullMasterList.filter(x => x.objectName === "Vehicle").flatMap(src => src.details).filter(y => y.deactivated === 0);
    this.customerMasterList = this.fullMasterList.filter(x => x.objectName === "Customer").flatMap(src => src.details).filter(y => y.deactivated === 0);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/masterlist", { context: background_load() }).toPromise();
  }

  loadObjects(request: DOAcknowledegementRequest) {
    return this.http.post<DoAcknowledgement[]>(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/listing", request, httpObserveHeader);
  }

  getSignature(fileId: number) {
    return this.http.get(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/signatureDownload/" + fileId, { responseType: 'blob' });
  }

  postFile(fileToUpload: File, objectId: number, fileId:number, customObj?: any) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    if (customObj && customObj.length > 0) {
      for (var i = 0; i < customObj.length; i++) {
        formData.append('customObj[]', customObj[i]);
      }
    }
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileDeliveryOrderAck/signatureUpload/" + objectId + '/' + fileId, formData);
  }
}
