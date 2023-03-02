export interface Sys_Parameter {
   Sys_ParameterId: number
   apiUrl: string
   imgUrl?: string
   lastDownloadAt?: Date
}

export interface FireStoreReturn {
   name: string
   fields: FireStoreField
   createTime: Date
   updateTime: Date
}

export interface FireStoreField {
   url: FireStoreUrl
}

export interface FireStoreUrl {
   stringValue: string
}