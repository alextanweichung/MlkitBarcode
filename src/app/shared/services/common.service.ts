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
    setTimeout(() => {
      const viewChildElement = viewChildrenQueryList.find(element => element.el.nativeElement.id === (objectType))
      if (viewChildElement) {
        viewChildElement.input.nativeElement.select();
      }
    }, 1);
  }

  //To add back timezone differences into UTC Date
  convertUtcDate(inputDate: Date): Date{
    let outputDate = new Date(inputDate);
    outputDate.setMinutes(outputDate.getMinutes() - outputDate.getTimezoneOffset());
    return outputDate;
  }  

  convertObjectAllDateType(inputObject: any){
    if (inputObject.hasOwnProperty('trxDate')) {
      if (inputObject.trxDate != null) {
        inputObject.trxDate = this.convertUtcDate(inputObject.trxDate);
      }
    }
    if (inputObject.hasOwnProperty('trxDateTime')) {
      if (inputObject.trxDateTime != null) {
        inputObject.trxDateTime = this.convertUtcDate(inputObject.trxDateTime);
      }
    }
    if (inputObject.hasOwnProperty('etaDate')) {
      if (inputObject.etaDate != null) {
        inputObject.etaDate = this.convertUtcDate(inputObject.etaDate);
      }
    }
    if (inputObject.hasOwnProperty('cancelDate')) {
      if (inputObject.cancelDate != null) {
        inputObject.cancelDate = this.convertUtcDate(inputObject.cancelDate);
      }
    }
    if (inputObject.hasOwnProperty('startDate')) {
      if (inputObject.startDate != null) {
        inputObject.startDate = this.convertUtcDate(inputObject.startDate);
      }
    }
    if (inputObject.hasOwnProperty('endDate')) {
      if (inputObject.endDate != null) {
        inputObject.endDate = this.convertUtcDate(inputObject.endDate);
      }
    }
    if (inputObject.hasOwnProperty('birthDate')) {
      if (inputObject.birthDate != null) {
        inputObject.birthDate = this.convertUtcDate(inputObject.birthDate);
      }
    }
    if (inputObject.hasOwnProperty('joinDate')) {
      if (inputObject.joinDate != null) {
        inputObject.joinDate = this.convertUtcDate(inputObject.joinDate);
      }
    }
    if (inputObject.hasOwnProperty('effectiveDate')) {
      if (inputObject.effectiveDate != null) {
        inputObject.effectiveDate = this.convertUtcDate(inputObject.effectiveDate);
      }
    }
    if (inputObject.hasOwnProperty('expiryDate')) {
      if (inputObject.expiryDate != null) {
        inputObject.expiryDate = this.convertUtcDate(inputObject.expiryDate);
      }
    }
    if (inputObject.hasOwnProperty('resignDate')) {
      if (inputObject.resignDate != null) {
        inputObject.resignDate = this.convertUtcDate(inputObject.resignDate);
      }
    }
    if (inputObject.hasOwnProperty('postingDate')) {
      if (inputObject.postingDate != null) {
        inputObject.postingDate = this.convertUtcDate(inputObject.postingDate);
      }
    }
    if (inputObject.hasOwnProperty('taxDate')) {
      if (inputObject.taxDate != null) {
        inputObject.taxDate = this.convertUtcDate(inputObject.taxDate);
      }
    }
    if (inputObject.hasOwnProperty('bankStatementDate')) {
      if (inputObject.bankStatementDate != null) {
        inputObject.bankStatementDate = this.convertUtcDate(inputObject.bankStatementDate);
      }
    }
    return inputObject;
  }

  convertArrayAllDateType(inputObject: any[]) {
    if (inputObject.length >= 1) {
      inputObject.forEach(x => {
        if (x.hasOwnProperty('etaDate')) {
          if (x.etaDate != null) {
            x.etaDate = this.convertUtcDate(x.etaDate);
          }
        }
        if (x.hasOwnProperty('lineUDDate')) {
          if (x.lineUDDate != null) {
            x.lineUDDate = this.convertUtcDate(x.lineUDDate)
          }
        }
        if (x.hasOwnProperty('startDate')) {
          if (x.startDate != null) {
            x.startDate = this.convertUtcDate(x.startDate);
          }
        }
        if (x.hasOwnProperty('endDate')) {
          if (x.endDate != null) {
            x.endDate = this.convertUtcDate(x.endDate);
          }
        }
        if (x.hasOwnProperty('gainLossPostDate')) {
          if (x.gainLossPostDate != null) {
            x.gainLossPostDate = this.convertUtcDate(x.gainLossPostDate);
          }
        }
        if (x.hasOwnProperty('knockOffDate')) {
          if (x.knockOffDate != null) {
            x.knockOffDate = this.convertUtcDate(x.knockOffDate);
          }
        }
      })
    }
    return inputObject;
  }

}
