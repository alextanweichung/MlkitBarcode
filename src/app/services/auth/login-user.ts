export interface LoginUser {
   userId: number
   userEmail: string
   token: string
   refreshToken: string
   playerId: string
   userName: string
   salesAgentId: number
   warehouseAgentId: number
   procurementAgentId: number
   loginUserType: string
   companyCode: string
   loginUserGroupType: string
   locationId: number[]
}

export interface LoginRequest {
   userEmail: string;
   password: string;
   loginUserType: string;
}


export interface TokenRequest {
   accessToken: string;
   refreshToken: string;
}

export interface ForgotPasswordRequest {
   userEmail: string;
   clientURI: string;
}

export interface CustomToken {
   nameid: string,
   unique_name: string,
   email: string,
   role: string,
   debug_mode: string,
   nbf: number,
   exp: number,
   iat: number
}

export interface ResetPassword {
   password: string;
   confirmPassword: string;
   userEmail: string;
   token: string;
}
