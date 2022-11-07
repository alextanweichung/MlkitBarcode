import { HttpClient } from '@angular/common/http';
import { Injectable, QueryList } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  
  baseUrl: string;
  startDate: Date;
  endDate: Date

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
    if (!this.startDate) {
      this.startDate = this.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.getTodayDate();
    }
  }

  getFirstDayOfTodayMonth(): Date {
    let today = this.getTodayDate();
    let firstDom = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0);
    firstDom.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return firstDom;
  }

  getTodayDate(): Date {
    let today = new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0);
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today;
  }

  syncAllItemByLocationCode() {
    return this.http.get(this.baseUrl + "PosDownload/itemMaster/KLCC/2022-10-31");
  }
  
  setInputNumberSelect(viewChildrenQueryList: QueryList<any>, objectType: string) {
    console.log("🚀 ~ file: common.service.ts ~ line 45 ~ CommonService ~ setInputNumberSelect ~ viewChildrenQueryList", viewChildrenQueryList)
    setTimeout(() => {
      const viewChildElement = viewChildrenQueryList.find(element => element.el.nativeElement.id === (objectType))
      console.log("🚀 ~ file: common.service.ts ~ line 47 ~ CommonService ~ setTimeout ~ viewChildElement", viewChildElement)
      console.log("🚀 ~ file: common.service.ts ~ line 47 ~ CommonService ~ setTimeout ~ objectType", objectType)
      if (viewChildElement) {
        viewChildElement.input.nativeElement.select();
      }
    }, 1);
  }


}
