import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { BulkConfirmReverse, TransactionProcessingCount, TransactionProcessingDoc } from '../models/transaction-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class TransactionProcessingService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    @Inject('apiObject') private apiObject: string
  ) {
    this.apiObject = apiObject;
    this.baseUrl = configService.sys_parameter.apiUrl;
  }  

  getDocumentCount(){
    return this.http.get<TransactionProcessingCount>(this.baseUrl + this.apiObject + '/count');
  }

  getProcessingDocumentByDateRange(dateStart: string, dateEnd: string) {
    return this.http.get<TransactionProcessingDoc[]>(this.baseUrl + this.apiObject + '/processing/' + dateStart + '/' + dateEnd).pipe(
      map((response: any) => {
        console.log("🚀 ~ file: transaction-processing.service.ts ~ line 35 ~ TransactionProcessingService ~ getProcessingDocumentByDateRange ~ response", response)
        return response.map((item: any) => item)
      })
    );
  }

  getGeneratedDocumentByDateRange(dateStart: string, dateEnd: string) {
    return this.http.get<TransactionProcessingDoc[]>(this.baseUrl + this.apiObject + '/generated/' + dateStart + '/' + dateEnd).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  updateDocumentStatus(docStatus: any, trxId: number) {
    return this.http.post(this.baseUrl + this.apiObject + '/' + docStatus + '/' + trxId, null, httpObserveHeader);
  }

  bulkUpdateDocumentStatus(bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.baseUrl + this.apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

  rejectDocumentStatus(docStatus: any, trxId: number) {
    return this.http.post(this.baseUrl + this.apiObject + '/' + docStatus + '/' + trxId, null, httpObserveHeader);
  }

}
