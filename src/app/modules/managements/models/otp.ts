export interface OtpDTO {
    header: Otp
    details: OtpLine[]
  }
  
  export interface Otp {
    otpId: number
    otpCode: string
    userId: number
    validity: string
    expiredAt: string
    status: string
  }
  
  export interface OtpLine {
    otpLineId: number
    otpId: number
    appCode: string
    isUse: boolean
  }
  
  export interface OtpHistory {
    otpHistoryId: number
    otpLineId: number
    usedAt: string
    originalData: string
    updatedData: string
    sequence: number
    createdById: number
    createdBy: string
    createdAt: string
    modifiedById: any
    modifiedBy: any
    modifiedAt: any
    deactivated: boolean
  }
  