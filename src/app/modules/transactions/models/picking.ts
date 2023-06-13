export interface MultiPickingList {
  multiPickingId: number
  multiPickingNum: string
  trxDate: string
  locationCode: string
  locationDescription: string
  warehouseAgentId: number
  warehouseAgentName: string
  deactivated: boolean
  createdById: number
}

export interface MultiPickingRoot {
  header: MultiPickingHeader
  details: MultiPickingCarton[]
  outstandingPickList: MultiPickingOutstandingPickList[]
  attachmentFile?: any[]
  comment?: any[]
  otp?: any
}

export interface MultiPickingHeader {
  multiPickingId: number
  multiPickingNum: string
  trxDate: string
  groupType: string
  warehouseAgentId: number
  externalDocNum: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  locationId: number
  workFlowTransactionId: any
  customerId: number
  typeCode: string
  trxDateTime: string
  printCount: number
  toLocationId: number
  businessModelType: string
  isWithSo: boolean
  sourceType: string
  remark: any
  totalCarton: number
  childId: any
  childNum: any
  sequence: number
  createdById: number
  createdBy: string
  createdAt: string
  modifiedById: any
  modifiedBy: any
  modifiedAt: any
  deactivated: boolean
}

export interface MultiPickingCarton {
  cartonNum: number
  pickList: CurrentPickList[]
}

export interface CurrentPickList {
  multiPickingId: number
  multiPickingLineId: number
  itemId: number
  itemCode: string
  itemVariationXId: any
  itemVariationYId: any
  itemVariationXDescription: any
  itemVariationYDescription: any
  itemUomId: number
  itemSku: string
  itemBarcode: string
  description: string
  sequence: number
  qtyPicked: number
  lineUDDate: any
  masterUDGroup1: any
  masterUDGroup2: any
  masterUDGroup3: any
  locationId: number
  cartonNum: number
  deactivated: boolean
  variations: PickingLineVariation[]
}

export interface MultiPickingSalesOrder {
  salesOrderId: number
  salesOrderNum: string
  trxDate: string
  locationId: number
  locationDesc: string
  customerId: number
  customerDesc: string
  toLocationId: any
  toLocationDesc: any
  currencyId: number
  currencyDesc: string
  businessModelType: string
  line: MultiPickingOutstandingPickList[]
}

export interface PickingLineVariation {
  multiPickingLineDetailsId?: number
  multiPickingLineId?: number
  multiPickingId?: number
  salesOrderId: number
  salesOrderLineId: number
  salesOrderVariationId: number
  qtyPicked: number
  sequence?: number
}

export interface MultiPickingOutstandingPickList {
  multiPickingOutstandingId?: number
  multiPickingId?: number
  itemId: number
  variationTypeCode: string
  itemVariationXId: any
  itemVariationYId: any
  itemCode: string
  itemSku: string
  description: any
  itemVariationXDescription: any
  itemVariationYDescription: any
  rack?: string
  subRack?: string
  salesOrderId?: number
  salesOrderNum?: string
  salesOrderLineId?: number
  salesOrderVariationId?: number
  qtyRequest: number
  qtyCommit?: number
  qtyPicked: number
  qtyCurrent: number
  sequence?: number
}

export interface MultiPickingSORequest {
  salesOrderNums: string[]
  warehouseAgentId: number
}

export interface MultiPickingObject {
    outstandingPickList: MultiPickingOutstandingPickList[],
    pickingCarton: MultiPickingCarton[];
}