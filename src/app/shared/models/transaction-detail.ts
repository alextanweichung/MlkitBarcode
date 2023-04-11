import { VariationDetail } from "./variation-detail"

export interface TransactionDetail {
  lineId?: number
  headerId?: number
  locationId?: number
  itemId?: number
  itemCode?: string
  oldItemCode?: string
  vendorItemCode?: string
  description?: string
  extendedDescription?: string
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
  unitPriceExTax?: number
  discountGroupCode?: any
  discountExpression?: any
  discountAmt?: any
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
  variationTypeCode?: string
  itemVariationRatioId?: any
  itemVariationRatioCode?: any
  actualQty?: any
  openQty?: any
  availableQty?: any
  variationDetails?: VariationDetail[]
  variationX?: number[]
  variationY?: number[]
  itemPricing?: ItemPricing
  direction?: any
  priceListLine?: any
  itemVariationXId?: any
  itemVariationYId?: any
  itemSku?: any
  itemBarcode?: any
  cartonNum?: any
  glAccountId?: number
  glAccountCode?: any
  glLedgerLineId?: any
  localAmount?: any
  localAmountTax?: any
  uuid?: any
  promoEventId?: any
  isPromoImpactApplied?: any
  discountedUnitPrice?: any
  oriDiscountGroupCode?: any
  oriDiscountExpression?: any
  /* #region  for stock-count */
  itemBrandId?: number
  itemGroupId?: number
  itemCategoryId?: number
  itemBarcodeTagId?: number
  /* #endregion */
  /* #region for consignment select */
  isSelected?: boolean
  /* #endregion */
  sequence?: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: any
  modifiedBy?: any
  modifiedAt?: any
  deactivated?: boolean
  promoImpactedQty?: number;
  promoImpactedType?: string;
}

export interface ItemPricing {
  itemId: number
  unitPrice: number
  currencyId?: number
  discountGroupCode: string
  discountExpression: any
  discountPercent: number
}
