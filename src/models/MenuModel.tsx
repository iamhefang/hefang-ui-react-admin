import {BaseModel} from "hefang-ui-react";

export interface MenuModel extends BaseModel {
    icon?: string
    label: string
    child?: MenuModel[]
    link?: string
    target?: string
}