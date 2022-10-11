export interface Sys_Parameter {
   Sys_ParameterId: number
   apiUrl: string
   imgUrl: string
   onlineMode: boolean
   firstTimeLogin: boolean
   lastDownloadAt?: Date
   lastUploadAt?: Date
   createdAt: Date
   updatedAt: Date
}