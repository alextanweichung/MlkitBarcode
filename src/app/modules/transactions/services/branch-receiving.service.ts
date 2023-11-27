import { Injectable } from '@angular/core';
import { BranchReceivingDto, BranchReceivingLine, BranchReceivingRoot } from '../models/branch-receiving';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { TransactionProcessingCount, BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class BranchReceivingService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  unflattenDtoDetail(branchReceiving: BranchReceivingRoot): BranchReceivingDto {
    let line: BranchReceivingLine[] = [];
    branchReceiving.details.forEach(r => {
      if (r.variationTypeCode === '0') {
        let l: BranchReceivingLine = {
          branchReceivingLineId: r.lineId,
          branchReceivingId: r.headerId,
          itemId: r.itemId,
          itemVariationXId: null,
          itemVariationYId: null,
          itemCode: r.itemCode,
          itemSku: r.itemSku,
          description: r.description,
          extendedDescription: r.extendedDescription,
          qtyRequest: r.qtyRequest,
          unitPrice: r.unitPrice,
          subTotal: r.subTotal,
          sequence: r.sequence,
          locationId: r.locationId,
          deactivated: r.deactivated
        }
        line.push(l);
      } else {
        r.variationDetails.forEach(v => {
          v.details.forEach(d => {
            let l: BranchReceivingLine = {
              branchReceivingLineId: r.lineId,
              branchReceivingId: r.headerId,
              itemId: r.itemId,
              itemVariationXId: v.itemVariationXId,
              itemVariationYId: d.itemVariationYId,
              itemCode: r.itemCode,
              itemSku: r.itemSku,
              description: r.description,
              extendedDescription: r.extendedDescription,
              qtyRequest: d.qtyRequest,
              unitPrice: r.unitPrice,
              subTotal: (d.qtyRequest ?? 0) * (r.unitPrice ?? 0),
              sequence: r.sequence,
              locationId: r.locationId,
              deactivated: r.deactivated
            }
            if (l.qtyRequest && l.qtyRequest > 0) {
              line.push(l);
            }
          })
        })
      }
    })

    let dto: BranchReceivingDto = {
      header: {
        branchReceivingId: branchReceiving.header.branchReceivingId,
        branchReceivingNum: branchReceiving.header.branchReceivingNum,
        trxDate: branchReceiving.header.trxDate,
        typeCode: branchReceiving.header.typeCode,
        attention: branchReceiving.header.attention,
        locationId: branchReceiving.header.locationId,
        vendorId:  branchReceiving.header.vendorId,
        termPeriodId: branchReceiving.header.termPeriodId,
        workFlowTransactionId: branchReceiving.header.workFlowTransactionId,
        countryId: branchReceiving.header.countryId,
        currencyId: branchReceiving.header.currencyId,
        currencyRate: branchReceiving.header.currencyRate,
        createdById: branchReceiving.header.createdById,
        createdBy: branchReceiving.header.createdBy,
        createdAt: branchReceiving.header.createdAt
      },
      details: line
    }

    return dto;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getBranchReceivingDetail(branchReceivingId: number) {
    return this.http.get<any>(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/" + branchReceivingId);
  }

  getReviewDocumentCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobileBranchReceivingReview/count');
  }

  getApprovalDocumentCount() {
    return this.http.get<TransactionProcessingCount>(this.configService.selected_sys_param.apiUrl + 'MobileBranchReceivingApprove/count');
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + "MobileBranchReceiving/exportPdf",
      {
        "appCode": appCode,
        "format": format,
        "documentIds": [documentId]
      },
      { responseType: "blob" });
  }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.configService.selected_sys_param.apiUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

}
