import { ItemMultiUomBase, LineAssembly } from "src/app/shared/models/transaction-detail"
import { OtpLine } from "../../managements/models/otp"
import { VariationDetail } from "src/app/shared/models/variation-detail"
import { ApprovalHistory } from "src/app/shared/models/approval-history"

export interface DefectRequestList {
   defectRequestId: number
   defectRequestNum: string
   trxDate: Date
   customerName: string
   salesAgentName: string
   countryDesc: string
   currencyCode: string
   locationCode: string
   locationDesc: string
   toLocationCode: string
   toLocationDesc: string
   deactivated: boolean
}

export interface DefectRequestRoot {
   header: DefectRequestHeader
   details: DefectRequestDetail[]
   barcodeTag?: any
   otp?: any
   attachmentFile?: any[]
   comment?: any[]
   approvalHistory?: ApprovalHistory[]
   isWorkFlowDone?: boolean
}

export interface DefectRequestHeader {
   defectRequestId: number
   defectRequestNum: string
   trxDate: Date
   trxDateTime: Date
   typeCode: string
   workFlowTransactionId: number
   customerId: number
   locationId: number
   toLocationId?: any
   attention?: any
   countryId: number
   currencyId: number
   currencyRate?: any
   isItemPriceTaxInclusive: boolean
   isDisplayTaxInclusive: boolean
   sourceType: string
   businessModelType: string
   remark?: any
   isHomeCurrency: boolean
   salesAgentId: number
   defectRequestUDField1?: any
   defectRequestUDField2?: any
   defectRequestUDField3?: any
   defectRequestUDOption1?: any
   defectRequestUDOption2?: any
   defectRequestUDOption3?: any
   masterUDGroup1?: any
   masterUDGroup2?: any
   masterUDGroup3?: any
   parentObject: string
   sequence: number
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
   revision: number
   shipAddress?: string
   shipPostCode?: string
   shipPhone?: string
   shipFax?: string
   shipEmail?: string
   shipStateId?: number
   shipAreaId?: number
   shipName?:string
   defectRequestCategoryId: number
}

export interface DefectRequestDetail {
   lineId: number
   headerId: number
   locationId?: number
   itemId?: number
   itemCode?: string
   description?: string
   extendedDescription?: any
   shortDescription?: any
   itemVariationId?: number
   itemUomId?: number
   itemUomCode?: any
   currencyRate?: any
   qtyRequest?: number
   qtyApproved?: any
   qtyCommit?: any
   qtyInventory?: number
   unitPrice?: any
   unitPriceExTax?: any
   marginPct?: any
   discountGroupCode?: any
   discountExpression?: any
   discountAmt?: any
   discountAmtExTax?: any
   taxId?: any
   taxCode?: any
   taxAmt?: any
   taxInclusive?: any
   subTotal?: any
   subTotalExTax?: any
   taxableAmt?: any
   localGrossAmt?: any
   localDiscountAmt?: any
   localTaxAmt?: any
   localSubTotal?: any
   localSubTotalExTax?: any
   localTaxableAmt?: any
   discountAmtMaxPrecision?: any
   taxAmtMaxPrecision?: any
   subTotalMaxPrecision?: any
   subTotalExTaxMaxPrecision?: any
   remark?: any
   overrideFlag?: number
   lineUDDate?: any
   masterUDGroup1?: any
   masterUDGroup2?: any
   masterUDGroup3?: any
   parentId?: any
   parentLineId?: any
   parentNum?: any
   childId?: any
   childNum?: any
   variationTypeCode?: string
   itemVariationRatioId?: any
   itemVariationRatioCode?: any
   actualQty?: any
   openQty?: any
   availableQty?: any
   variationDetails?: VariationDetail[]
   variationX?: any
   variationY?: any
   itemPricing?: any
   direction?: any
   priceListLine?: any
   itemVariationXId?: any
   itemVariationYId?: any
   itemSku?: any
   itemBarcode?: any
   cartonNum?: any
   container?: any
   glAccountId?: any
   glAccountCode?: any
   glLedgerLineId?: any
   localAmount?: any
   localAmountTax?: any
   uuid?: any
   promoEventId?: any
   isPromoImpactApplied?: any
   discountedUnitPrice?: any
   oriUnitPrice?: any
   oriUnitPriceExTax?: any
   oriDiscountGroupCode?: any
   oriDiscountExpression?: any
   vendorId?: any
   isPricingApproval?: boolean
   vendorItemCode?: string
   localInvoiceAmt?: number
   assembly?: LineAssembly[]
   uomMaster?: ItemMultiUomBase[]
   baseRatio?: number
   uomRatio?: number
   ratioExpr?: string
   sequence?: number
   createdById?: number
   createdBy?: string
   createdAt?: string
   modifiedById?: any
   modifiedBy?: any
   modifiedAt?: any
   deactivated?: boolean
   revision?: number

   // for local use
   isSelected?: boolean
}