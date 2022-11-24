export interface GoodsPickingList {
  pickingId: number
  pickingNum: string
  trxDate: string
  locationCode: string
  locationDescription: string
  warehouseAgentId: number
  warehouseAgentName: string
  deactivated: boolean
  createdById: number
}

export interface GoodsPickingRoot {
  header: GoodsPickingHeader
  details?: GoodsPickingLine[]
}

export interface GoodsPickingHeader {
  pickingId: number
  pickingNum: string
  trxDate: Date
  locationId: number
  toLocationId: number
  customerId: number
  warehouseAgentId: number
  pickingUDField1?: string
  pickingUDField2?: string
  pickingUDField3?: string
  pickingUDOption1?: number
  pickingUDOption2?: number
  pickingUDOption3?: number
  deactivated?: boolean,
  workFlowTransactionId?: number
  createdBy?: string
  createdAt?: Date
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  businessModelType: string
  sourceType: string
  typeCode: string
  isWithSo: boolean
  remark: string
}

export interface GoodsPickingLine {
  pickingLineId?: number
  pickingId?: number
  salesOrderId: number
  itemId: number
  itemVariationXId?: number
  itemVariationYId?: number
  itemSku: string
  itemBarcode: string
  itemUomId?: number
  qtyRequest: number
  soRowIndex?: number
  sequence: number
  lineUDDate?: Date
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  locationId: number
  deactivated?: boolean
}

export interface PickingSummary {
  pickingNum: string
  customerId: number
  locationId: number
  trxDate: Date
}