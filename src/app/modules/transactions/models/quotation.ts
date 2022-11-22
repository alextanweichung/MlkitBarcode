import { VariationDetail } from "src/app/shared/models/variation-detail"

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

export interface QuotationDto {
  header: QuotationDtoHeader
  details: QuotationDtoLine[]
}

export interface QuotationDtoHeader {
  quotationId?: number
  quotationNum?: string
  salesAgentId?: number
  trxDate?: Date
  typeCode?: string
  customerId?: number
  shipAddress?: string
  shipPostCode?: string
  shipPhone?: string
  shipFax?: string
  shipEmail?: string
  shipAreaId?: number
  attention?: string
  locationId?: number
  toLocationId?: number;
  termPeriodId?: number
  countryId?: number
  currencyId?: number
  currencyRate?: number
  quotationUDField1?: string
  quotationUDField2?: string
  quotationUDField3?: string
  quotationUDOption1?: number
  quotationUDOption2?: number
  quotationUDOption3?: number
  deactivated?: boolean
  workFlowTransactionId?: number
  createdBy?: string
  createdAt?: Date
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  isItemPriceTaxInclusive?: boolean
  isDisplayTaxInclusive?: boolean
  sourceType?: string
  businessModelType?: string
  remark?: string
  isHomeCurrency?: boolean
  maxPrecision?: number
  maxPrecisionTax?: number
}

export interface QuotationDtoLine {
  quotationLineId?: number
  quotationId?: number
  itemId: number
  itemVariationXId?: number
  itemVariationYId?: number
  itemCode: string
  itemSku: string
  itemUomId?: number
  description: string
  extendedDescription: string
  qtyRequest?: number
  unitPrice?: number
  unitPriceExTax?: number
  discountGroupCode?: string
  discountExpression?: string
  discountAmt?: number
  discountAmtExTax?: number
  taxId?: number
  taxPct?: number
  taxAmt?: number
  taxInclusive?: boolean
  subTotal?: number
  subTotalExTax?: number
  sequence?: number
  locationId?: number
  deactivated?: boolean
}

export interface QuotationSummary {
  quotationNum: string
  customerName: string
  totalQuantity: number
  totalAmount: number
}

export interface QuotationRoot {
  header: QuotationHeader
  details: QuotationDetail[]
}

export interface QuotationHeader {
  quotationId: number
  quotationNum: string
  trxDate: Date
  trxDateTime: Date
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
  workFlowTransactionId: number
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
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface QuotationDetail {
  lineId: number
  headerId: number
  locationId: number
  itemId: number
  itemCode: string
  description: string
  extendedDescription: string
  shortDescription: any
  itemUomId: number
  itemUomCode: any
  currencyRate: number
  qtyRequest: number
  qtyApproved: any
  qtyCommit: any
  qtyReceive: any
  unitPrice: number
  unitPriceExTax: any
  discountGroupCode: any
  discountExpression: any
  discountAmt: number
  discountAmtExTax: any
  taxId: any
  taxCode: any
  taxPct: any
  taxAmt: number
  taxInclusive: boolean
  subTotal: number
  subTotalExTax: number
  taxableAmt: number
  localGrossAmt: number
  localDiscountAmt: number
  localTaxAmt: number
  localSubTotal: number
  localSubTotalExTax: number
  localTaxableAmt: number
  discountAmtMaxPrecision: number
  taxAmtMaxPrecision: any
  subTotalMaxPrecision: number
  subTotalExTaxMaxPrecision: number
  etaDate: any
  remark: any
  overrideFlag: number
  lineUDDate: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  parentId: any
  parentLineId: any
  parentNum: any
  variationTypeCode: string
  itemVariationRatioId: any
  itemVariationRatioCode: string
  actualQty: any
  openQty: any
  availableQty: any
  variationDetails: VariationDetail[]
  variationX: number[]
  variationY: number[]
  itemPricing: any
  direction: any
  priceListLine: any
  itemVariationXId: any
  itemVariationYId: any
  itemSku: any
  itemBarcode: any
  cartonNum: any
  glAccountId: number
  glAccountCode: any
  glLedgerLineId: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}