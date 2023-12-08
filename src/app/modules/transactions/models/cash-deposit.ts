export interface CashDeposit {
   posCashDepositId: number
   posCashDepositNum: string
   depositAmount: number
   depositDateTime: Date
   depositFileId: number
   depositSlipNum: string
   paymentMethodId: number
   locationId?: number
   customerId?: number
   createdBy?: string
   createdById?: number
   createdAt?: Date
   sequence: number
}