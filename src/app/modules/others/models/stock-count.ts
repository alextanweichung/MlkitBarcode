import { BarcodeTag } from "src/app/shared/models/item-barcode"

export interface StockCountList {
  inventoryCountId: number
  inventoryCountNum: string
  description: any
  locationCode: string
  locationDescription: string
  batchNum: string
  deactivated: boolean
}

export interface StockCountRoot {
  header: StockCountHeader
  details: StockCountDetail[]
  barcodeTag: BarcodeTag[]
}

export interface StockCountHeader {
  inventoryCountId: number
  inventoryCountNum: string
  description: any
  trxDate: string
  trxDateTime: string
  locationId: number
  inventoryCountBatchId: number
  zoneId: number
  rackId: number
  inventoryCountUDField1: any
  inventoryCountUDField2: any
  inventoryCountUDField3: any
  inventoryCountUDOption1: any
  inventoryCountUDOption2: any
  inventoryCountUDOption3: any
  remark: any
  printCount: number
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface StockCountDetail {
  inventoryCountLineId: number
  inventoryCountId: number
  locationId: number
  itemId: number
  itemCode: string
  description: string
  itemVariationXId?: number
  itemVariationYId?: number
  itemSku: string
  itemBarcode: string
  itemBarcodeTagId: number
  qtyRequest: number
  qtyApproved?: any
  qtyCommit?: any
  sequence?: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: any
  modifiedBy?: any
  modifiedAt?: any
  deactivated?: boolean
}

export interface StockCountItem {
  itemId: number
  itemCode: string
  description: string
  variationTypeCode?: string
  itemVariationLineXId: number
  itemVariationLineYId: number
  itemVariationLineXDescription?: string
  itemVariationLineYDescription?: string
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode?: string
  itemUomId?: number
  itemUomDescription?: string
  deactivated?: boolean
  qtyRequest: number
}

export interface InventoryCountBatchList {
  inventoryCountBatchId: number
  inventoryCountBatchNum: string
  description: string
  locationCode: string
  locationDescription: string
  type: string
  startDate: string
  endDate: string
  deactivated: boolean
  isCompleted: boolean
}

export interface InventoryCountBatchCriteria {
  randomCountType: string
  keyId: number[]
}
