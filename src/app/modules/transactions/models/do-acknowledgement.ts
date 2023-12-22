export interface DoAcknowledgement {
   truckArrangementNum: string
   deliveryOrderId: number
   deliveryOrderNum: string
   customerId: number
}

export interface DOAcknowledegementRequest {
   truckArrangementNum: string
   vehicledId: number[]
   deliveryOrderNum: string
}