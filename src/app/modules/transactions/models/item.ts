export interface Item {
   itemId: number
   itemUomId: number
   itemCode: string
   description: string
   variationTypeCode: string
   deactivated: boolean
   itemVariationLineXId: number
   itemVariationLineYId: number
   itemSku: string
   itemVariationLineXCode: string
   itemVariationLineYCode: string
   itemVariationLineXDescription: string
   itemVariationLineYDescription: string
   unitPrice: number
   currencyId: number
   availableQty: number
   qtyRequest?: number
 }
 
 export interface ItemImage {
  keyId: number
  imageSource: string
  imageName: string
}