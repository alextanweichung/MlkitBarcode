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
  header: Quotation
  details: QuotationLine[]
}

export interface Quotation {
  quotationId: number
  quotationNum: string
  trxDate: string
  businessModelType: string
  typeCode: string
  sourceType: string
  customerId: number
  salesAgentId: number
  attention: any
  locationId: number
  termPeriodId: number
  workFlowTransactionId?: number
  countryId: number
  currencyId: number
  currencyRate: number
  quotationUDField1?: any
  quotationUDField2?: any
  quotationUDField3?: any
  quotationUDOption1?: any
  quotationUDOption2?: any
  quotationUDOption3?: any
  totalGrossAmt?: number
  totalDiscAmt?: number
  totalTaxAmt?: number
  grandTotal?: number
  grandTotalExTax?: number
  localTotalGrossAmt?: number
  localTotalDiscAmt?: number
  localTotalTaxAmt?: number
  localGrandTotal?: number
  localGrandTotalExTax?: number
  printCount?: number
  childType?: any
  childId?: any
  externalDocNum?: any
  masterUDGroup1?: any
  masterUDGroup2?: any
  masterUDGroup3?: any
  sequence?: number
  deactivated?: boolean
}

export interface QuotationLine {
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
  subTotal?: number
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

export interface VariationDetail {
  itemVariationXId: number
  details: InnerVariationDetail[]
}

export interface InnerVariationDetail {
  sequence: number
  variationId: number
  lineId: number
  headerId: number
  itemVariationYId: number
  itemSku: string
  itemBarcodeTagId: any
  itemBarcode: any
  qtyRequest?: number
  qtyCommit: any
  qtyApproved: any
  qtyReceive: any
  qtyBalance: any
  parentVariationId: any
  actualQty: any
  openQty: any
  availableQty: any
  ratio?: number
}
