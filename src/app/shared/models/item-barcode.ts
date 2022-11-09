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
  brandId: number
  groupId: number
  catId: number
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
