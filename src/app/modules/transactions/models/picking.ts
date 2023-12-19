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
   multiPickingLineId: number
   multiPickingId: number
   itemId: number
   itemCode: string
   itemVariationXId?: number
   itemVariationYId?: number
   itemVariationXDescription: string
   itemVariationYDescription: string
   itemUomId: number
   itemSku: string
   itemBarcode: string
   description: string
   qtyPicked: number
   sequence: number
   lineUDDate: Date
   masterUDGroup1?: number
   masterUDGroup2?: number
   masterUDGroup3?: number
   locationId: number
   cartonNum: number
   deactivated: boolean
   variations: PickingLineVariation[]
}

export interface PickingLineVariation {
   salesOrderId: number
   salesOrderLineId: number
   salesOrderVariationId: number
   qtyPicked: number
}

export interface MultiPickingObject {
   outstandingPickList: MultiPickingOutstandingPickList[],
   pickingCarton: MultiPickingCarton[];
}

/* #region from getheader */

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
   salesOrderId?: number
   salesOrderNum?: string
   salesOrderLineId?: number
   salesOrderVariationId?: number
   qtyRequest: number
   qtyCommit?: number
   qtyPicked: number
   qtyCurrent: number
   isComponentScan: boolean
   assembly?: Assembly[]
   sequence?: number
}

export interface Assembly {
   headerId: number
   lineId: number
   assemblyId: number
   assemblyItemId: number
   itemComponentId: number
   itemComponentQty: number
   qtyRequest: number
   qtyPicked: number
   qtyCurrent?: number
   sequence: number
   createdById?: number
   createdBy?: string
   createdAt?: string
   modifiedById?: number
   modifiedBy?: string
   modifiedAt?: string
   deactivated?: boolean
}

/* #endregion */