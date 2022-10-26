export interface PickingList {
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
 
 export interface PickingRoot {
  header: PickingHeader
  details: PickingDetail[]
}

export interface PickingHeader {
  pickingId: number
  pickingNum: string
  trxDate: string
  trxDateTime: string
  typeCode: string
  sourceType: string
  customerId: number
  businessModelType: string
  locationId: number
  toLocationId: any
  warehouseAgentId: number
  workFlowTransactionId: any
  externalDocNum: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  printCount: number
  isWithSo: boolean
  remark: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface PickingDetail {
  pickingLineId: number
  pickingId: number
  itemId: number
  itemCode: string
  itemVariationXId: number
  itemVariationYId: number
  itemVariationXDescription: string
  itemVariationYDescription: string
  itemUomId: number
  itemSku: string
  itemBarcode: string
  description: string
  qtyPicked: number
  sequence: number
  lineUDDate: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  locationId: number
  deactivated: boolean
}
