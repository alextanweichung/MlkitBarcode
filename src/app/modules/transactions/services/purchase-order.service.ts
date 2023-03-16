import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { BulkConfirmReverse, TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { PurchaseOrderDto, PurchaseOrderLine, PurchaseOrderRoot } from '../models/purchase-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  unflattenDtoDetail(purchaseOrder: PurchaseOrderRoot): PurchaseOrderDto {
    let line: PurchaseOrderLine[] = [];
    purchaseOrder.details.forEach(r => {
      if (r.variationTypeCode === '0') {
        let l: PurchaseOrderLine = {
          purchaseOrderLineId: r.lineId,
          purchaseOrderId: r.headerId,
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
            let l: PurchaseOrderLine = {
              purchaseOrderLineId: r.lineId,
              purchaseOrderId: r.headerId,
              itemId: r.itemId,
              itemVariationXId: v.itemVariationXId,
              itemVariationYId: d.itemVariationYId,
              itemCode: r.itemCode,
              itemSku: r.itemSku,
              description: r.description,
              extendedDescription: r.extendedDescription,
              qtyRequest: d.qtyRequest,
              unitPrice: r.unitPrice,
              subTotal: (d.qtyRequest??0) * (r.unitPrice??0),
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

    let dto: PurchaseOrderDto = {
      header: {
        purchaseOrderId: purchaseOrder.header.purchaseOrderId,
        purchaseOrderNum: purchaseOrder.header.purchaseOrderNum,
        trxDate: purchaseOrder.header.trxDate,
        typeCode: purchaseOrder.header.typeCode,
        attention: purchaseOrder.header.attention,
        locationId: purchaseOrder.header.locationId,
        termPeriodId: purchaseOrder.header.termPeriodId,
        workFlowTransactionId: purchaseOrder.header.workFlowTransactionId,
        countryId: purchaseOrder.header.countryId,
        currencyId: purchaseOrder.header.currencyId,
        currencyRate: purchaseOrder.header.currencyRate
      },
      details: line
    }

    return dto;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePurchaseOrder/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobilePurchaseOrder/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }  

  getPurchaseOrderDetail(purchaseOrderId: number) {
    return this.http.get<any>(this.baseUrl + "MobilePurchaseOrder/" + purchaseOrderId);
  }
  
  getReviewDocumentCount() {
    return this.http.get<TransactionProcessingCount>(this.baseUrl + 'MobilePurchaseOrderReview/count');
  }
  
  getApprovalDocumentCount() {
    return this.http.get<TransactionProcessingCount>(this.baseUrl + 'MobilePurchaseOrderApprove/count');
  }

  downloadPdf(appCode: any, format: string = "pdf", documentId: any) {
    return this.http.post(this.baseUrl + "MobilePurchaseOrder/exportPdf", 
    {
      "appCode": appCode,
      "format": format,
      "documentIds": [ documentId ]
    },
    { responseType: "blob"});
  }

  bulkUpdateDocumentStatus(apiObject: string, bulkConfirmReverse: BulkConfirmReverse) {
    return this.http.post(this.baseUrl + apiObject + '/bulkUpdate', bulkConfirmReverse, httpObserveHeader);
  }

}
