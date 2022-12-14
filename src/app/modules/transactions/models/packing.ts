export interface GoodsPackingList {
   packingId: number
   packingNum: string
   trxDate: string
   locationCode: string
   locationDescription: string
   warehouseAgentId: number
   warehouseAgentName: string
   deactivated: boolean
   createdById: number
 }
 
 export interface GoodsPackingRoot {
  header: GoodsPackingHeader
  details?: GoodsPackingLine[]
  // otp?: OtpLine
}

export interface GoodsPackingHeader {
  packingId: number
  packingNum: string
  trxDate: Date,
  locationId: number
  toLocationId: number
  customerId: number
  warehouseAgentId: number
  packingUDField1?: string
  packingUDField2?: string
  packingUDField3?: string
  packingUDOption1?: number
  packingUDOption2?: number
  packingUDOption3?: number
  deactivated?: boolean,
  workFlowTransactionId?: number
  createdBy?: string
  createdAt?: Date,
  masterUDGroup1?: number
  masterUDGroup2?: number
  masterUDGroup3?: number
  businessModelType: string
  sourceType: string
  typeCode: string
  isWithSo: boolean
  remark: string
  totalCarton: number
}

export interface GoodsPackingLine {
  packingLineId?: number
  packingId?: number
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
  cartonNum: number;
  deactivated?: boolean
}

export interface GoodsPackingSummary {
  packingNum: string
  customerId: number
  locationId: number
  trxDate: Date
}