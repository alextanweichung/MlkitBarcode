export interface DoAcknowledgement {
    deliveryOrderId: number
    deliveryOrderNum: string
    customerId: number
}

export interface DOAcknowledegementRequest {
    cartonTruckLoadingNum: string
    vehicledId: number[]
    deliveryOrderNum: string
}