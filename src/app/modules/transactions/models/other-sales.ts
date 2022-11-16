export interface OtherSalesList {
   otherSalesId: number
   otherSalesNum: string
   trxDate: string
   type: string
   customerName: string
   locationDesc: any
   toLocationDesc: string
   deactivated: boolean
   createdById: number
 }
 
 export interface OtherSalesRoot {
   header: OtherSalesHeader
   details: OtherSalesDetail[]
   // barcodeTag: any
   // otp: any
 }
 
 export interface OtherSalesHeader {
   otherSalesId: number
   otherSalesNum: string
   trxDate: string
   trxDateTime: string
   typeCode: string
   salesAgentId: number
   customerId: number
   locationId: any
   toLocationId: number
   countryId: any
   currencyId: number
   currencyRate: number
   sourceType: string
   businessModelType: string
   otherSalesUDField1: any
   otherSalesUDField2: any
   otherSalesUDField3: any
   otherSalesUDOption1: any
   otherSalesUDOption2: any
   otherSalesUDOption3: any
   masterUDGroup1: any
   masterUDGroup2: any
   masterUDGroup3: any
   posMemberId: any
   posMemberName: any
   remark: string
   printCount: number
   isItemPriceTaxInclusive: any
   isDisplayTaxInclusive: any
   isHomeCurrency: any
   sequence: any
   createdById: number
   createdBy: string
   createdAt: string
   modifiedById: number
   modifiedBy: string
   modifiedAt: string
   deactivated: boolean
 }
 
 export interface OtherSalesDetail {
   lineId?: number
   headerId?: number
   locationId?: number
   itemId?: number
   itemCode?: string
   description?: string
   extendedDescription?: any
   shortDescription?: any
   itemUomId?: number
   itemUomCode?: any
   currencyRate?: number
   qtyRequest?: number
   qtyApproved?: any
   qtyCommit?: any
   tempQtyCommit?: any
   qtyReceive?: any
   unitPrice?: number
   unitPriceExTax?: any
   discountGroupCode?: string
   discountExpression?: string
   discountAmt?: number
   discountAmtExTax?: any
   taxId?: number
   taxCode?: any
   taxPct?: number
   taxAmt?: number
   taxInclusive?: boolean
   subTotal?: number
   subTotalExTax?: number
   taxableAmt?: number
   localGrossAmt?: number
   localDiscountAmt?: number
   localTaxAmt?: number
   localSubTotal?: number
   localSubTotalExTax?: number
   localTaxableAmt?: number
   discountAmtMaxPrecision?: number
   taxAmtMaxPrecision?: any
   subTotalMaxPrecision?: number
   subTotalExTaxMaxPrecision?: number
   etaDate?: any
   remark?: any
   overrideFlag?: number
   lineUDDate?: any
   masterUDGroup1?: any
   masterUDGroup2?: any
   masterUDGroup3?: any
   parentId?: any
   parentLineId?: any
   parentNum?: any
   variationTypeCode?: any
   itemVariationRatioId?: any
   itemVariationRatioCode?: any
   actualQty?: any
   openQty?: any
   availableQty?: any
   variationDetails?: any
   variationX?: any
   variationY?: any
   itemPricing?: any
   direction?: any
   priceListLine?: any
   itemVariationXId?: number
   itemVariationYId?: number
   itemSku?: string
   itemBarcode?: string
   cartonNum?: any
   glAccountId?: number
   glAccountCode?: any
   glLedgerLineId?: any
   sequence?: number
   createdById?: number
   createdBy?: string
   createdAt?: string
   modifiedById?: any
   modifiedBy?: any
   modifiedAt?: any
   deactivated?: boolean
 }
 