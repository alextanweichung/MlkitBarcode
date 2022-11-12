export interface ItemBarcodeModel {
  itemId: number
  itemCode: string
  description: string
  variationTypeCode: string
  itemVariationLineXId: number
  itemVariationLineYId: number
  itemVariationLineXDescription: string
  itemVariationLineYDescription: string
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode: string
  itemUomId: number
  itemUomDescription: string
  itemBrandId: number
  itemGroupId: number
  itemCategoryId: number
  unitPrice: number
  deactivated: boolean
}

export interface BarcodeTag {
  itemId: number
  itemCode: string
  description: string
  variationTypeCode: string
  itemVariationLineXId?: number
  itemVariationLineYId?: number
  itemVariationLineXDescription?: string
  itemVariationLineYDescription?: string
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode: string
  itemUomId: number
  itemUomDescription: string
  deactivated: boolean
}
