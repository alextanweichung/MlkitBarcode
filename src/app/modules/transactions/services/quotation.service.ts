import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format, parseISO } from 'date-fns';
import { map } from 'rxjs/operators';
import { background_load } from 'src/app/core/interceptors/error-handler.interceptor';
import { ConfigService } from 'src/app/services/config/config.service';
import { MasterList } from 'src/app/shared/models/master-list';
import { Customer } from '../models/customer';
import { Item, ItemImage } from '../models/item';
import { QuotationDto, QuotationLine, QuotationList, QuotationRoot, QuotationSummary } from '../models/quotation';
import { TransactionsService } from './transactions.service';

//Only use this header for HTTP POST/PUT/DELETE, to observe whether the operation is successful
const httpObserveHeader = {
  observe: 'response' as 'response'
};

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  baseUrl: string;
  startDate: Date;
  endDate: Date;

  selectedCustomer: Customer;
  itemInCart: Item[] = [];
  quotationSummary: QuotationSummary;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private transactionService: TransactionsService
  ) {
    this.baseUrl = configService.sys_parameter.apiUrl;

    if (!this.startDate) {
      this.startDate = this.transactionService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.transactionService.getTodayDate();
    }
  }

  setChoosenCustomer(customer: Customer) {
    this.selectedCustomer = customer;
  }

  setChoosenItems(item: Item[]) {
    this.itemInCart = JSON.parse(JSON.stringify(item));
  }

  setQuotationSummary(qs: QuotationSummary) {
    this.quotationSummary = qs;
  }

  removeCustomer() {
    this.selectedCustomer = null;
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
    let line: QuotationLine[] = [];
    quotation.details.forEach(r => {
      if (r.variationTypeCode === '0') {
        let l: QuotationLine = {
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
          subTotal: r.subTotal,
          sequence: r.sequence,
          locationId: r.locationId,
          deactivated: r.deactivated
        }
        line.push(l);
      } else {
        r.variationDetails.forEach(v => {
          v.details.forEach(d => {
            let l: QuotationLine = {
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

  getItemImageFile(keyword: string) {
    return this.http.get<ItemImage[]>(this.baseUrl + "MobileQuotation/itemList/imageFile/" + keyword, { context: background_load() });
  }

  getQuotationList() {
    return this.http.get<QuotationList[]>(this.baseUrl + "MobileQuotation/listing/" + format(parseISO(this.startDate.toISOString()), 'yyyy-MM-dd') + "/" + format(parseISO(this.endDate.toISOString()), 'yyyy-MM-dd'));
  }

  getQuotationDetail(quotationId: number) {
    return this.http.get<QuotationRoot>(this.baseUrl + "MobileQuotation/" + quotationId);
  }

  insertQuotation(quotationDto: QuotationDto) {
    return this.http.post(this.baseUrl + "MobileQuotation", quotationDto, httpObserveHeader);
  }

}
