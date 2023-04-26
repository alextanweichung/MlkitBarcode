export interface CheckCn {
   arCreditNoteId: number
   arCreditNoteNum: string
   postingDate: string
   customerCode: string
   customerName: string
   unappliedAmount: number
}

export interface CheckCnRequest {
   salesAgentId: number
   customerIds: number[]
}