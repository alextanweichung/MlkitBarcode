import { VariationDetail } from "src/app/shared/models/variation-detail"

export interface PurchaseOrderRoot {
   header: PurchaseOrderHeader
   details: PurchaseOrderDetail[]
   // barcodeTag: BarcodeTag[]
   // otp: any
 }
 
 export interface PurchaseOrderHeader {
   purchaseOrderId: number
   purchaseOrderNum: string
   procurementAgentId: number
   trxDate: string
   trxDateTime: string
   typeCode: string
   vendorId: number
   attention: any
   locationId: number
   termPeriodId: number
   forwarderId: any
   workFlowTransactionId: number
   etaDate: any
   cancelDate: any
   countryId: number
   currencyId: number
   currencyRate: number
   purchaseOrderUDField1: any
   purchaseOrderUDField2: any
   purchaseOrderUDField3: any
   purchaseOrderUDOption1: any
   purchaseOrderUDOption2: any
   purchaseOrderUDOption3: any
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
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: any
   modifiedBy: any
   modifiedAt: any
   deactivated: boolean
 }
 
 export interface PurchaseOrderDetail {
   lineId: number
   headerId: number
   locationId: number
   itemId: number
   itemCode: string
   description: string
   extendedDescription: any
   shortDescription: any
   itemUomId: number
   itemUomCode: any
   currencyRate: number
   qtyRequest: number
   qtyApproved: any
   qtyCommit: any
   tempQtyCommit: any
   qtyReceive: any
   unitPrice: number
   unitPriceExTax: number
   discountGroupCode: any
   discountExpression: string
   discountAmt: number
   discountAmtExTax: number
   taxId: number
   taxCode: any
   taxPct: number
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
   taxAmtMaxPrecision: number
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
 
 export interface PurchaseOrderDto {
  header: PurchaseOrder
  details: PurchaseOrderLine[]
}

export interface PurchaseOrder {
  purchaseOrderId?: number
  purchaseOrderNum?: string
  procurementAgentId?: number
  trxDate?: string
  trxDateTime?: string
  typeCode?: string
  vendorId?: number
  attention?: any
  locationId?: number
  termPeriodId?: number
  forwarderId?: any
  workFlowTransactionId?: number
  etaDate?: any
  cancelDate?: any
  countryId?: number
  currencyId?: number
  currencyRate?: number
  purchaseOrderUDField1?: any
  purchaseOrderUDField2?: any
  purchaseOrderUDField3?: any
  purchaseOrderUDOption1?: any
  purchaseOrderUDOption2?: any
  purchaseOrderUDOption3?: any
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
  externalDocNum?: any
  masterUDGroup1?: any
  masterUDGroup2?: any
  masterUDGroup3?: any
  remark?: any
  isItemPriceTaxInclusive?: boolean
  isDisplayTaxInclusive?: boolean
  sequence?: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: any
  modifiedBy?: any
  modifiedAt?: any
  deactivated?: boolean
}

export interface PurchaseOrderLine {
  purchaseOrderLineId?: number
  purchaseOrderId?: number
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
  subTotal?: number
  sequence?: number
  locationId?: number
  deactivated?: boolean
}