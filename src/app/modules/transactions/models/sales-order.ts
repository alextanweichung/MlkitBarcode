import { VariationDetail } from "src/app/shared/models/variation-detail"

export interface SalesOrderList {
  salesOrderId: number
  salesOrderNum: string
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

// export interface SalesOrderHeader {
//   locationId: number
//   customerId: number
//   currencyId: number
//   exchangeRate: number
//   countryId: number
//   termPeriodId: number
//   salesAgentId: number
//   typeCode: string
//   businessModelType: string
// }

export interface SalesOrderDto {
  header: SalesOrder
  details: SalesOrderLine[]
}

export interface SalesOrder {
  salesOrderId: number
  salesOrderNum: string
  trxDate?: Date
  trxDateTime?: Date
  typeCode?: string
  sourceType?: string
  customerId?: number
  businessModelType?: string
  salesAgentId?: number
  shipAddress?: string
  shipPostCode?: string
  shipPhone?: string
  shipFax?: string
  shipEmail?: string
  shipAreaId?: number
  shipMethodId?: number
  attention?: string
  locationId?: number
  toLocationId?: number
  termPeriodId?: number
  workFlowTransactionId?: number
  countryId?: number
  currencyId?: number
  currencyRate?: number
  salesOrderUDField1?: string
  salesOrderUDField2?: string
  salesOrderUDField3?: string
  salesOrderUDOption1?: number
  salesOrderUDOption2?: number
  salesOrderUDOption3?: number
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
  externalDocNum?: string
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  remark?: string
}

export interface SalesOrderLine {
  salesOrderLineId?: number
  salesOrderId?: number
  itemId?: number
  itemVariationXId?: number
  itemVariationYId?: number
  itemCode: string
  itemSku: string
  itemUomId?: number
  description: string
  extendedDescription: string
  qtyRequest?: number
  unitPrice?: number
  unitPriceExTax: number;
  subTotal?: number
  sequence?: number
  locationId?: number
  deactivated?: boolean
}

export interface SalesOrderSummary {
  salesOrderNum: string
  customerId: number
  totalQuantity: number
  totalAmount: number
}

export interface SalesOrderRoot {
  header: SalesOrderHeader
  details: SalesOrderDetail[]
}

export interface SalesOrderHeader {
  salesOrderId: number
  salesOrderNum: string
  trxDate: Date
  trxDateTime: string
  typeCode: string
  sourceType: string
  customerId: number
  businessModelType: string
  salesAgentId: number
  shipAddress: any
  shipPostCode: any
  shipPhone: any
  shipFax: any
  shipEmail: any
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
  salesOrderUDField1: any
  salesOrderUDField2: any
  salesOrderUDField3: any
  salesOrderUDOption1: any
  salesOrderUDOption2: any
  salesOrderUDOption3: any
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

export interface SalesOrderDetail {
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
  taxableAmt: any
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
  itemVariationRatioCode: any
  actualQty: number
  openQty: number
  availableQty: number
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