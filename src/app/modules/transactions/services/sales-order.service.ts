import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { SalesOrderDto, SalesOrderHeader, SalesOrderLine, SalesOrderList, SalesOrderRoot, SalesOrderSummary } from '../models/sales-order';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {

  baseUrl: string;

  salesOrderHeader: SalesOrderHeader;
  itemInCart: Item[] = [];
  salesOrderSummary: SalesOrderSummary;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  setChoosenCustomer(soHeader: SalesOrderHeader) {
    this.salesOrderHeader = soHeader;
  }

  setChoosenItems(item: Item[]) {
    this.itemInCart = item;
  }

  setSalesOrderSummary(ss: SalesOrderSummary) {
    this.salesOrderSummary = ss;
  }

  removeCustomer() {
    this.salesOrderHeader = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeSalesOrderSummary() {
    this.salesOrderSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeSalesOrderSummary();
  }

  unflattenDtoDetail(salesOrder: SalesOrderRoot): SalesOrderDto {
    let line: SalesOrderLine[] = [];
    salesOrder.details.forEach(r => {
      if (r.variationTypeCode === '0') {
        let l: SalesOrderLine = {
          salesOrderLineId: r.lineId,
          salesOrderId: r.headerId,
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
            let l: SalesOrderLine = {
              salesOrderLineId: r.lineId,
              salesOrderId: r.headerId,
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

    let dto: SalesOrderDto = {
      header: {
        salesOrderId: salesOrder.header.salesOrderId,
        salesOrderNum: salesOrder.header.salesOrderNum,
        trxDate: salesOrder.header.trxDate,
        businessModelType: salesOrder.header.businessModelType,
        typeCode: salesOrder.header.typeCode,
        sourceType: salesOrder.header.sourceType,
        customerId: salesOrder.header.customerId,
        salesAgentId: salesOrder.header.salesAgentId,
        attention: salesOrder.header.attention,
        locationId: salesOrder.header.locationId,
        termPeriodId: salesOrder.header.termPeriodId,
        workFlowTransactionId: salesOrder.header.workFlowTransactionId,
        countryId: salesOrder.header.countryId,
        currencyId: salesOrder.header.currencyId,
        currencyRate: salesOrder.header.currencyRate
      },
      details: line
    }

    return dto;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileSalesOrder/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileSalesOrder/customer");
  }

  getItemList(keyword: string, customerId: number, locationId: number) {
    return this.http.get<Item[]>(this.baseUrl + "MobileSalesOrder/item/itemList/" + keyword + "/" + customerId + "/" + locationId, { context: background_load() }).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getItemImageFile(keyword: string) {
    return this.http.get<ItemImage[]>(this.baseUrl + "MobileSalesOrder/itemList/imageFile/" + keyword, { context: background_load() });
  }

  getSalesOrderList(startDate: Date, endDate: Date) {
    return this.http.get<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getRecentSalesOrderList() {
    return this.http.get<SalesOrderList[]>(this.baseUrl + "MobileSalesOrder/recentListing");
  }

  getSalesOrderDetail(salesOrderId: number) {
    return this.http.get<any>(this.baseUrl + "MobileSalesOrder/" + salesOrderId);
  }

  insertSalesOrder(salesOrderDto: SalesOrderDto) {
    return this.http.post(this.baseUrl + "MobileSalesOrder", salesOrderDto, httpObserveHeader);
  }

}
