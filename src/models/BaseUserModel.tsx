import {BaseModel} from "hefang-ui-react";

export interface BaseUserModel extends BaseModel {
    isSuperAdmin?: boolean
    isAdmin?: boolean
    isLockedScreen?: boolean
    loginName?: string
    realName?: string
    roleName?: string
}