export interface LoginUser {
   userEmail: string;
   token: string;
   refreshToken: string;
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
