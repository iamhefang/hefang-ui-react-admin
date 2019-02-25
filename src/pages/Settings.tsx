import * as React from "react";
import {getLocalStorage, setLocalStorage, SwitchBox, Table, TableColumn, TableDoExpand, Toast} from "hefang-ui-react";
import {FrameworkSettingModel} from "../models/FrameworkSettingModel";
import {number} from "prop-types";
import {settings} from "cluster";

export interface SettingsState {
    settings: FrameworkSettingModel[]
    values: SettingValues
}

export interface SettingValues {
    autoLockScreen: boolean
    autoLockScreenDelay: number
    rememberMenuState: boolean
}

export interface SettingsProps {

}

const defaultSettings: SettingValues = {
    autoLockScreen: true,
    autoLockScreenDelay: 10,
    rememberMenuState: true
};
const _settings: FrameworkSettingModel[] = [
    {
        id: "autoLockScreen",
        title: "长时间无操作自动锁屏",
        value: defaultSettings.autoLockScreen,
        summary: "超过指定时间没有鼠标键盘动作时自动锁屏",
        type: "switch-box"
    },
    {
        id: "autoLockScreenDelay",
        title: "自动锁屏时间",
        value: defaultSettings.autoLockScreenDelay,
        dependOn: "autoLockScreen",
        min: 1,
        max: 120,
        type: "range",
        summary: "多长时间没有鼠标键盘动作时锁屏(单位:分钟)"
    },
    {
        id: "rememberMenuState",
        title: "记住菜单展开状态",
        type: "switch-box",
        value: defaultSettings.rememberMenuState
    },
];

function initModels(values: SettingValues): FrameworkSettingModel[] {
    const settings: FrameworkSettingModel[] = [];
    _settings.forEach(s => {
        if (s.dependOn && !values[s.dependOn]) {
            return;
        }
        s.value = values[s.id];
        settings.push(s)
    });
    return settings
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
    static readonly defaultProps: SettingsProps = {};

    constructor(props: SettingsProps) {
        super(props);
        const values = Settings.get();
        this.state = {
            values,
            settings: initModels(values)
        };
    }

    public static default = (): SettingValues => defaultSettings;

    public static restoreToDefault() {
        setLocalStorage("settings", defaultSettings);
        Toast.success("已恢复默认设置")
    }

    public static get(): SettingValues {
        return getLocalStorage("settings", defaultSettings)
    }

    private onValueChange(id: string, value: any) {
        this.state.values[id] = value;
        setLocalStorage("settings", this.state.values);
        this.setState({
            settings: initModels(this.state.values)
        });
        return false;
    }

    private renderValueForm = (model: FrameworkSettingModel) => {
        const {min, max, maxLength, value, id} = model;
        switch (model.type) {
            case "number":
                return <input type="number" min={min} max={max} maxLength={maxLength}
                              defaultValue={value}
                              className="hui-input"
                              onChange={e => this.onValueChange(id, +e.currentTarget.value)}/>;
            case "range":
                return <span>
                    {value}分钟&nbsp;
                    <input type="range" min={min} max={max} maxLength={maxLength}
                           defaultValue={value} className="hui-range"
                           onChange={e => this.onValueChange(id, +e.currentTarget.value)}/>
                </span>;
            case "string":
                return <input type="string" min={min} max={max} maxLength={maxLength}
                              defaultValue={value}
                              className="hui-input"
                              onChange={e => this.onValueChange(id, e.currentTarget.value)}/>;
            case "switch-box":
                return <SwitchBox on={value} type={"success"}
                                  onChange={on => this.onValueChange(id, on)}/>;
            default:
                return <input type="string" min={min} max={max} maxLength={maxLength}
                              defaultValue={value}
                              className="hui-input"
                              onChange={e => this.onValueChange(id, e.currentTarget.value)}/>
        }
    };

    render() {
        return <>
            <div className="hui-dialog-content">
                <Table className="settings"
                       data={this.state.settings}
                       selectable={false}
                       header={false}
                       border={"none"}>
                    <TableColumn title={"标题"}
                                 field={(model: FrameworkSettingModel, expand: TableDoExpand) => {
                                     return model.summary ? <span style={{cursor: "help"}} onClick={e => {
                                         expand(model.summary)
                                     }}>{model.title}</span> : model.title
                                 }}/>
                    <TableColumn title={"值"}
                                 field={(model: FrameworkSettingModel) => this.renderValueForm(model)}
                                 align={"right"}/>
                </Table>
            </div>
            <div className="hui-dialog-footer">
                <button className="hui-btn-danger" onClick={e => {
                    Settings.restoreToDefault();
                    const values = defaultSettings;
                    this.setState({
                        values,
                        settings: initModels(values)
                    })
                }}>恢复默认设置
                </button>
            </div>
        </>
    }
}