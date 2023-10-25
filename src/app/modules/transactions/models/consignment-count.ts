import { BarcodeTag } from "src/app/shared/models/item-barcode"
import { TransactionDetail } from "src/app/shared/models/transaction-detail"

export interface ConsignmentCountRoot {
  header: ConsignmentCountHeader
  details: ConsignmentCountDetail[]
  barcodeTag?: BarcodeTag[]
}

export interface ConsignmentCountHeader {
  consignmentCountId: number
  consignmentCountNum: string
  description: any
  trxDate: string
  trxDateTime: string
  locationId: number
  consignmentCountUDField1: any
  consignmentCountUDField2: any
  consignmentCountUDField3: any
  consignmentCountUDOption1: any
  consignmentCountUDOption2: any
  consignmentCountUDOption3: any
  remark: any
  printCount: number
  rack: any
  zone: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface ConsignmentCountDetail {
  consignmentCountLineId: number
  consignmentCountId: number
  locationId: number
  itemId: number
  itemVariationXId: number
  itemVariationYId: number
  itemSku: string
  itemBarcodeTagId: number
  itemBarcode: string
  qtyRequest: number
  qtyApproved?: number
  qtyCommit?: number
  sequence: number
  createdById?: number
  createdBy?: string
  createdAt?: string
  modifiedById?: number
  modifiedBy?: string
  modifiedAt?: string
  deactivated?: boolean

  // local col
  itemCode?: string
  itemDescription?: string
  itemVariationXDescription?: string
  itemVariationYDescription?: string
}