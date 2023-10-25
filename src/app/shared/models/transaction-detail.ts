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
  shortDescription?: string
  itemUomId?: number
  itemUomCode?: string
  currencyRate?: number
  /* #region for mobile only */
  qtyInCart?: number
  /* #endregion */
  qtyRequest?: number
  qtyApproved?: number
  qtyCommit?: number
  tempQtyCommit?: number
  qtyReceive?: number
  unitPrice?: number
  unitPriceExTax?: number
  discountGroupCode?: string
  discountExpression?: string

  oriUnitPrice?: number
  oriUnitPriceExTax?: number
  oriDiscountGroupCode?: string
  oriDiscountExpression?: string
  isPricingApproval?: boolean

  itemGroupInfo?: ItemGroupInfo

  discountAmt?: number
  discountAmtExTax?: number
  taxId?: number
  taxCode?: string
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
  taxAmtMaxPrecision?: number
  subTotalMaxPrecision?: number
  subTotalExTaxMaxPrecision?: number
  etaDate?: Date
  remark?: string
  overrideFlag?: number
  lineUDDate?: Date
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  parentId?: number
  parentLineId?: number
  parentNum?: string
  variationTypeCode?: string
  itemVariationRatioId?: number
  itemVariationRatioCode?: string
  actualQty?: number
  openQty?: number
  availableQty?: number
  variationDetails?: VariationDetail[]
  variationX?: number[]
  variationY?: number[]
  itemPricing?: ItemPricing
  direction?: string
  priceListLine?: any
  itemVariationXId?: number
  itemVariationLineXId?: number
  itemVariationXCd?: string
  itemVariationXDesc?: string
  itemVariationYId?: number
  itemVariationLineYId?: number
  itemVariationYCd?: string
  itemVariationYDesc?: string
  itemSku?: string
  itemBarcode?: string
  cartonNum?: number
  glAccountId?: number
  glAccountCode?: string
  glLedgerLineId?: number
  localAmount?: number
  localAmountTax?: number
  uuid?: any
  promoEventId?: number
  isPromoImpactApplied?: boolean
  discountedUnitPrice?: number

  /* #region  for stock-count */
  itemBrandId?: number
  itemGroupId?: number
  itemCategoryId?: number
  itemDepartmentId?: number
  itemBarcodeTagId?: number
  /* #endregion */

  /* #region for consignment select */
  isSelected?: boolean
  /* #endregion */

  /* #region for consignment sales */
  marginPct?: number
  marginAmt?: number
  bearPct?: number
  bearAmt?: number
  invoiceAmt?: number
  /* #endregion */

  sequence?: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: number
  modifiedBy?: string
  modifiedAt?: Date
  deactivated?: boolean
  promoImpactedQty?: number;
  promoImpactedType?: string;
  brandId?: number;
  groupId?: number;
  seasonId?: number;
  categoryId?: number;
  deptId?: number;
  oriDiscId?: number;

  newItemId?: number;
  newItemEffectiveDate?: Date
  minOrderQty?: number;
  minOrderQtyError?: boolean
}

export interface ItemPricing {
  itemId: number,
  unitPrice: number,
  unitPriceMin: number,
  currencyId?: number,
  discountGroupId: number,
  discountGroupCode: string,
  discountExpression: string,
  discountPercent: number
  priceSegmentCode?: string
}

export interface ItemGroupInfo {
  brandId: number,
  groupId: number,
  seasonId: number,
  categoryId: number,
  deptId: number
}