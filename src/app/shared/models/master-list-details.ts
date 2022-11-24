export interface MasterListDetails {
   objectName: string;
   id: number;
   code: string;
   description: string;
   attribute1: string;
   attribute2: string;
   attribute3: string;
   attribute4: string;
   attribute5: string;
   attribute6: string;
   attribute7: string;
   attribute8: string;
   attribute9: string;
   attributeArray1: number[];
   shippingInfo?: ShippingInfo[]
   parentId?: number;
   sequence?: number;
   isPrimary: boolean;
   deactivated?: number;
}

export interface ShippingInfo {
   keyId?: number
   isPrimary?: boolean
   description?: string
   address: string
   postCode: string
   attention: any
   phone: string
   email: string
   fax: string
   areaId: number
}
