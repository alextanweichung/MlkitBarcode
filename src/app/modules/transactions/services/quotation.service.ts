import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { QuotationDto, QuotationDtoHeader, QuotationDtoLine, QuotationList, QuotationRoot, QuotationSummary } from '../models/quotation';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  baseUrl: string;

  quotationHeader: QuotationDtoHeader;
  itemInCart: Item[] = [];
  quotationSummary: QuotationSummary;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;
  }

  setHeader(quotationHeader: QuotationDtoHeader) {
    this.quotationHeader = quotationHeader;
  }

  setChoosenItems(item: Item[]) {
    this.itemInCart = JSON.parse(JSON.stringify(item));
  }

  setQuotationSummary(qs: QuotationSummary) {
    this.quotationSummary = qs;
  }

  removeCustomer() {
    this.quotationHeader = null;
  }

  removeItems() {
    this.itemInCart = [];
  }

  removeQuotationSummary() {
    this.quotationSummary = null;
  }

  resetVariables() {
    this.removeCustomer();
    this.removeItems();
    this.removeQuotationSummary();
  }

  flattenDtoDetail(quotation: QuotationRoot): QuotationDto {
    let line: QuotationDtoLine[] = [];
    quotation.details.forEach(r => {
      if (r.variationTypeCode === '0') {
        let l: QuotationDtoLine = {
          quotationLineId: r.lineId,
          quotationId: r.headerId,
          itemId: r.itemId,
          itemVariationXId: null,
          itemVariationYId: null,
          itemCode: r.itemCode,
          itemSku: r.itemSku,
          description: r.description,
          extendedDescription: r.extendedDescription,
          qtyRequest: r.qtyRequest,
          unitPrice: r.unitPrice,
          unitPriceExTax: r.unitPriceExTax,
          subTotal: r.subTotal,
          subTotalExTax: r.subTotalExTax,
          sequence: r.sequence,
          locationId: r.locationId,
          deactivated: r.deactivated
        }
        line.push(l);
      } else {
        r.variationDetails.forEach(v => {
          v.details.forEach(d => {
            let l: QuotationDtoLine = {
              quotationLineId: r.lineId,
              quotationId: r.headerId,
              itemId: r.itemId,
              itemVariationXId: v.itemVariationXId,
              itemVariationYId: d.itemVariationYId,
              itemCode: r.itemCode,
              itemSku: r.itemSku,
              description: r.description,
              extendedDescription: r.extendedDescription,
              qtyRequest: d.qtyRequest,
              unitPrice: r.unitPrice,
              unitPriceExTax: r.unitPriceExTax,
              subTotal: (d.qtyRequest ?? 0) * (r.unitPrice ?? 0),
              subTotalExTax: (d.qtyRequest ?? 0) * (r.unitPriceExTax ?? 0),
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

    let dto: QuotationDto = {
      header: {
        quotationId: quotation.header.quotationId,
        quotationNum: quotation.header.quotationNum,
        trxDate: quotation.header.trxDate,
        businessModelType: quotation.header.businessModelType,
        typeCode: quotation.header.typeCode,
        sourceType: quotation.header.sourceType,
        customerId: quotation.header.customerId,
        salesAgentId: quotation.header.salesAgentId,
        attention: quotation.header.attention,
        locationId: quotation.header.locationId,
        termPeriodId: quotation.header.termPeriodId,
        workFlowTransactionId: quotation.header.workFlowTransactionId,
        countryId: quotation.header.countryId,
        currencyId: quotation.header.currencyId,
        currencyRate: quotation.header.currencyRate
      },
      details: line
    }

    return dto;
  }

  getMasterList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileQuotation/masterlist").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getStaticLovList() {
    return this.http.get<MasterList[]>(this.baseUrl + "MobileQuotation/staticLov").pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }

  getCustomerList() {
    return this.http.get<Customer[]>(this.baseUrl + "MobileQuotation/customer");
  }

  getItemList(keyword: string, customerId: number, locationId: number) {
    return this.http.get<Item[]>(this.baseUrl + "MobileQuotation/item/itemList/" + keyword + "/" + customerId + "/" + locationId, { context: background_load() }).pipe(
      map((response: any) =>
        response.map((item: any) => item)
      )
    );
  }
  
  getItemListWithTax(keyword: string, trxDate: string, customerId: number, locationId: number) {
    return this.http.get<Item[]>(this.baseUrl + "MobileQuotation/item/itemListWithTax/" + keyword + "/" + trxDate + "/" + customerId + "/" + locationId, { context: background_load() });
  }

  getItemImageFile(keyword: string) {
    return this.http.get<ItemImage[]>(this.baseUrl + "MobileQuotation/itemList/imageFile/" + keyword, { context: background_load() });
  }

  getQuotationList(startDate: Date, endDate: Date) {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/listing/" + format(parseISO(startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(endDate.toISOString()), 'yyyy-MM-dd'));
  }
  
  getRecentQuotationList() {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/recentListing");
  }

  getQuotationDetail(quotationId: number) {
    return this.http.get<QuotationRoot>(this.baseUrl + "MobileQuotation/" + quotationId);
  }

  insertQuotation(quotationDto: QuotationDto) {
    return this.http.post(this.baseUrl + "MobileQuotation", quotationDto, httpObserveHeader);
  }

}
