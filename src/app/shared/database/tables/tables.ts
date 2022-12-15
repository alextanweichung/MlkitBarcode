export interface Sys_Parameter {
   Sys_ParameterId: number
   apiUrl: string
   imgUrl?: string
   onlineMode: boolean
   lastDownloadAt?: Date
   loadImage: boolean
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