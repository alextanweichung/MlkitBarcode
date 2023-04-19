import { ItemPricing } from "src/app/shared/models/transaction-detail"

export interface CheckQohRoot {
   itemId: number
   itemCode: string
   itemDescription: string
   inventoryLevel: CheckQohRootInventoryLevel[]
   segmentPricing: CheckQohRootSegmentPricing[]
 }
 
 export interface CheckQohRootInventoryLevel {
   itemId: number
   itemCode: string
   locationId: number
   locationCode: string
   locationDescription: string
   qty: number
   transitQty: number
   openQty: number
 }
 
 export interface CheckQohRootSegmentPricing {
   locationId: any
   itemPricing: ItemPricing
 }
 