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

  /* #region store value */

  selectedObject: TransferConfirmationRoot;
  setSelectedObject(object: TransferConfirmationRoot) {
    this.selectedObject = JSON.parse(JSON.stringify(object));
  }

  getSelectedObject() {
    return this.selectedObject;
  }

  resetVariables() {
    this.clearSelectedObject();
  }
  
  clearSelectedObject() {
    this.selectedObject = null;
  }

  /* #endregion */

  fullMasterList: MasterList[] = [];
  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  async loadMasterList() {
    this.fullMasterList = await this.getMasterList();
    this.locationMasterList = this.fullMasterList.filter(x => x.objectName == 'Location').flatMap(src => src.details);
    console.log("🚀 ~ file: transfer-confirmation.service.ts:61 ~ TransferConfirmationService ~ loadMasterList ~ this.locationMasterList:", this.locationMasterList)
    await this.locationMasterList.sort((a, c) => { return a.description > c.description ? 1 : -1 });
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileTransferConfirmation/masterlist").toPromise();
  }

  getPendingList(locationId: number) {
    return this.http.get<TransferConfirmationRoot[]>(this.baseUrl + "MobileTransferConfirmation/pending/" + locationId);
  }

  updateObject(object: TransferConfirmationRoot) {
    return this.http.put(this.baseUrl + "MobileTransferConfirmation", object, httpObserveHeader);
  }

}
