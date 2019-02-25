import {BaseModel} from "hefang-ui-react";

export interface FrameworkSettingModel extends BaseModel {
    title: string
    value: any
    summary?: string
    dependOn?: string
    type?: "string" | "number" | "switch-box" | "range"
    min?: number
    max?: number
    maxLength?: number
}