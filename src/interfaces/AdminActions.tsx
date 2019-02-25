import {ReactNode, ReactText} from "react";
import {DialogOnClose, DialogOperater, DialogOptions, DialogPromptOption, Toast, ToastProps} from "hefang-ui-react";
import {LoginDialogOnClosed} from "../type/LoginDialogOnClosed";

export interface AdminActions {
    toast(content: ReactNode, option?: ToastProps): Toast

    loading(): any;

    loading(message: string): any;

    loading(option: ToastProps): any;

    loading(message: string, option: ToastProps): any;

    success(): any;

    success(message: string): any;

    success(option: ToastProps): any;

    success(message: string, option: ToastProps): any;

    alert(content: ReactNode): DialogOperater;

    alert(content: ReactNode, title: string): DialogOperater;

    alert(content: ReactNode, onOk: DialogOnClose): DialogOperater;

    alert(content: ReactNode, option: DialogOptions): DialogOperater;

    alert(content: ReactNode, title: string, onOk: Function): DialogOperater;

    alert(content: ReactNode, onOk: DialogOnClose, option: DialogOptions): DialogOperater;

    alert(content: ReactNode, title: string, option: DialogOptions): DialogOperater;

    alert(content: ReactNode, title: string, onOk: DialogOnClose, option: DialogOptions): DialogOperater;

    confirm(content: ReactNode): DialogOperater;

    confirm(content: ReactNode, option: DialogOptions): DialogOperater;

    confirm(content: ReactNode, onOk: DialogOnClose): DialogOperater;

    confirm(content: ReactNode, onOk: DialogOnClose, onCancel: DialogOnClose): DialogOperater;

    confirm(content: ReactNode, onOk: DialogOnClose, option: DialogOptions): DialogOperater;

    confirm(content: ReactNode, title: string): DialogOperater;

    confirm(content: ReactNode, title: string, option: DialogOptions): DialogOperater;

    confirm(content: ReactNode, title: string, onOk: DialogOnClose): DialogOperater;

    confirm(content: ReactNode, title: string, onOk: DialogOnClose, onCancel: DialogOnClose): DialogOperater;

    confirm(content: ReactNode, title: string, onOk: DialogOnClose, option: DialogOptions): DialogOperater;

    confirm(content: ReactNode, title: string, onOk: DialogOnClose, onCancel: DialogOnClose, option: DialogOptions): DialogOperater;

    window(url: string): DialogOperater;

    window(url: string, option: DialogOptions): DialogOperater;

    window(url: string, title: string | boolean): DialogOperater;

    window(url: string, title: string | boolean, option: DialogOptions): DialogOperater;

    prompt(message: ReactNode): DialogOperater;

    prompt(message: ReactNode, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, onOk: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, onOk: DialogOnClose, onCancel: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, onOk: DialogOnClose, onCancel: DialogOnClose, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, onOk: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, onOk: DialogOnClose, onCancel: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, onOk: DialogOnClose, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, onOk: DialogOnClose, onCancel: DialogOnClose, option: DialogPromptOption): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, title: string): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, title: string, onOk: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, title: string, onOk: DialogOnClose, onCancel: DialogOnClose): DialogOperater;

    prompt(message: ReactNode, defaultValue: ReactText, title: string, onOk: DialogOnClose, onCancel: DialogOnClose, option: DialogPromptOption): DialogOperater;

    login(onClosed?: LoginDialogOnClosed);

    closeDialog(id?: string);
}