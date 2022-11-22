import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface QuotationList {
  quotationId: number
  quotationNum: string
  trxDate: string
  customerName: string
  salesAgentName: string
  countryDescription: string
  currencyCode: string
  grandTotal: number
  qty: number
  deactivated: boolean
  createdById: number
}

export interface QuotationRoot {
  header: QuotationHeader
  details: TransactionDetail[]
  barcodeTag: any
  otp: any
}

export interface QuotationHeader {
  quotationId: number
  quotationNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  sourceType: string
  customerId: number
  businessModelType: string
  salesAgentId: number
  shipAddress: any
  shipPostCode: any
  shipPhone: any
  shipEmail: any
  shipFax: any
  shipAreaId: any
  shipMethodId: any
  attention: any
  locationId: number
  toLocationId: any
  termPeriodId: number
  workFlowTransactionId: any
  countryId: number
  currencyId: number
  currencyRate: number
  quotationUDField1: any
  quotationUDField2: any
  quotationUDField3: any
  quotationUDOption1: any
  quotationUDOption2: any
  quotationUDOption3: any
  totalGrossAmt: number
  totalDiscAmt: number
  totalTaxAmt: number
  grandTotal: number
  grandTotalExTax: number
  localTotalGrossAmt: number
  localTotalDiscAmt: number
  localTotalTaxAmt: number
  localGrandTotal: number
  localGrandTotalExTax: number
  printCount: number
  childType: any
  childId: any
  externalDocNum: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  remark: any
  isItemPriceTaxInclusive: any
  isDisplayTaxInclusive: any
  isHomeCurrency: boolean
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}