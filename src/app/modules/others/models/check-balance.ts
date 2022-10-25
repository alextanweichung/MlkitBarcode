export interface InventoryLevel {
   itemId: number
   itemCode: string
   locationId: number
   locationCode: string
   locationDescription: string
   qty: number
 }
 
export interface InventoryVariationLevel {
  locationId: number
  locationCode: string
  locationDescription: string
  variation: InventoryVariation
  itemVariationXDescription: string[]
  itemVariationYDescription: string[]
  itemVariationXCode: string[]
  itemVariationYCode: string[]
}

export interface InventoryVariation {
  itemId: number
  itemCode: string
  variationDetails: InventoryVariationDetail[]
}

export interface InventoryVariationDetail {
  itemVariationXId: number
  itemVariationXCode: string
  itemVariationXDescription: string
  variationDetails: InnerIVDetail[]
}

export interface InnerIVDetail {
  itemVariationYId: number
  itemVariationYCode: string
  itemVariationYDescription: string
  itemSku: string
  qty?: number
}
