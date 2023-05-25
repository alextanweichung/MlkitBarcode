export interface SalesByCustomer {
   customerCode: string
   customerName: string
   year: number
   month: number
   salesAmount: number
}

export interface SalesByCustomerRequest {
   customerId: number[]
   dateStart: string
   dateEnd: string
}