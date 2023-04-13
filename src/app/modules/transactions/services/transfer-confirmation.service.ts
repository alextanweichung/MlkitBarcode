import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransferConfirmationRoot } from '../models/inter-transfer';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class TransferConfirmationService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
    this.loadRequiredMaster();
  }

  async loadRequiredMaster() {
    await this.loadMasterList();
  }

  fullMasterList: MasterList[] = [];
  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);    
    await this.locationMasterList.sort((a, c) => { return a.description > c.description ? 1 : -1 });
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.bindLocationList();
  }

  locationSearchDropdownList: SearchDropdownList[] = [];
  bindLocationList() {
    this.locationMasterList.forEach(r => {
      this.locationSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileTransferConfirmation/masterlist").toPromise();
  }

  getPendingList(locationCode: string) {
    return this.http.get<TransferConfirmationRoot[]>(this.baseUrl + "MobileTransferConfirmation/pending/" + locationCode);
  }

}
