import * as React from "react";
import {CSSProperties, ReactNode, RefObject} from "react";
import {MenuModel} from "../models/MenuModel";
import {BaseUserModel} from "../models/BaseUserModel";
import {execute, isFunction, now} from "hefang-js";
import {AdminActions} from "../interfaces/AdminActions";
import {Settings, SettingValues} from "./Settings";
import {Login} from "./Login";
import {LoginDialogOnClosed} from "../type/LoginDialogOnClosed";
import {
    Dialog,
    DialogOnClose,
    getLocalStorage,
    Icon,
    IconAnimation,
    JsObject,
    setLocalStorage,
    Toast,
    WebView
} from "hefang-ui-react";
import {OnLockChanged} from "../interfaces/OnLockChanged";

export interface AdminState {
    menuOpen: boolean
    activeNavbarItem: string
    isLockedScreen: boolean
    lockerPassword: string
    lockerTips: string
    path: MenuModel[]
    activeIds: string[]
    currentLink: string
    floatMenuTop: number
    floatMenuId: string
}

export interface AdminProps {
    menus: MenuModel[]
    user?: BaseUserModel
    onSignOut?: DialogOnClose
    onCleanCache?: DialogOnClose
    onProfileClick?: Function
    brand?: ReactNode
    onLockChanged?: (onChange: OnLockChanged) => void
}

function makeToggleButtonContent(menuOpen: boolean) {
    return menuOpen ? <><Icon name={"angle-double-left"}/>&nbsp;关闭菜单</> : <Icon name={"angle-double-right"}/>
}

export class Admin extends React.Component<AdminProps, AdminState> {
    static readonly defaultProps: AdminProps = {
        menus: [],
        user: null,
        brand: '后台管理'
    };
    private refSideContainer: RefObject<HTMLDivElement> = React.createRef();

    //上次活动时间
    private lastActiveTime: number = now().getTime();
    //子页面里面的window对象
    private webviewWindow: Window = null;

    //框架内子页面操作顶层框架的接口
    private readonly adminActions: JsObject<AdminActions> = null;

    private autoLockTimer = null;

    private settings: SettingValues = Settings.get();

    constructor(props: AdminProps) {
        super(props);

        const menuOpen = this.settings.rememberMenuState ?
            getLocalStorage("menuOpen", Settings.default().rememberMenuState) :
            Settings.default().rememberMenuState
            , path = getLocalStorage("path", []) as MenuModel[]
            , activeIds = getLocalStorage("activeIds", []) as string[]
            , currentLink = getLocalStorage("currentLink", "") as string;
        this.state = {
            menuOpen, path, activeIds, currentLink,
            activeNavbarItem: null,
            isLockedScreen: props.user.isLockedScreen,
            lockerPassword: '',
            lockerTips: '',
            floatMenuTop: 0,
            floatMenuId: ''
        };
        this.adminActions = {
            name: "adminActions",
            value: {
                loading: Toast.loading,
                toast: Toast.show,
                success: Toast.success,
                alert: Dialog.alert,
                confirm: Dialog.confirm,
                prompt: Dialog.prompt,
                window: Dialog.window,
                login: this.showLogin,
                closeDialog: Dialog.close
            }
        }
    }

    private initSettings = () => {
        this.settings = Settings.get();
        const delay = (this.settings.autoLockScreenDelay < 1 ? 1 :
            (this.settings.autoLockScreenDelay > 120 ? 120 : this.settings.autoLockScreenDelay)) * 60000;
        this.autoLockTimer && clearInterval(this.autoLockTimer);

        if (this.settings.autoLockScreen) {
            this.autoLockTimer = setInterval(() => {
                if ((this.lastActiveTime + delay) <= now().getTime() && !this.state.isLockedScreen) {
                    this.doLock()
                }
            }, 1000);
        }
    };

    componentDidMount() {
        Object.defineProperty(window, "adminActions", {
            value: this.adminActions.value,
            writable: false
        });
        this.lastActiveTime = now().getTime();
        window.addEventListener("mousemove", this.onWindowActive);
        window.addEventListener("keydown", this.onWindowActive);
        this.initSettings();
    }

    componentWillUnmount() {
        window.removeEventListener("mousemove", this.onWindowActive)
    }

    //框架窗口和子页面鼠标移动事件
    private onWindowActive = () => {
        this.lastActiveTime = now().getTime()
    };

    //导航按钮点击事件
    private onNavbarItemClicked = (item: string) => {
        let {activeNavbarItem} = this.state;
        if (item === activeNavbarItem) {
            activeNavbarItem = null;
        } else {
            activeNavbarItem = item;
        }
        this.setState({
            activeNavbarItem
        })
    };

    //个人中心点击事件
    private onProfileClick = () => {
        execute(this.props.onProfileClick)
    };

    //清空缓存
    private doCleanCache = () => {
        Dialog.confirm(<div className="hui-dialog-content">
            <p className="intent-2"
               style={{color: "red"}}>不建议频繁清空缓存{this.props.user.isSuperAdmin ? ', 缓存可以提高加载速度, 减少服务器压力' : ''}！！</p>
            <p className="intent-2">若出现设置未生效, 内容未更新或页面错乱等情况可尝试清空缓存。</p>
            <p className='intent-2'>清空缓存后本地记住的账号密码会删除, 本地设置项会恢复默认。</p>
        </div>, "确定要清空缓存吗?", (data) => {
            Toast.loading();
            if (this.props.user.isSuperAdmin) {
                execute(this.props.onCleanCache, data)
            } else {
                localStorage.clear();
                setTimeout(function () {
                    location.reload(true);
                }, 1000);
            }
        }, {height: "16rem", width: "20rem"})
    };

    //菜单点击事件
    private onMenuItemClick = (menu: MenuModel, parent?: MenuModel) => {
        const path: MenuModel[] = parent ? [] : this.state.path
            , activeIds: string[] = [];
        if (parent) {
            path.push(parent);
            activeIds.push(parent.id)
        }
        if (parent || menu.link) {
            path.push(menu);
        }
        activeIds.push(menu.id);
        this.setState({
            path, activeIds,
            currentLink: menu.link || this.state.currentLink
        }, () => {
            setLocalStorage("path", path);
            setLocalStorage("activeIds", activeIds);
            setLocalStorage("currentLink", menu.link);
        })
    };

    //子页面加载完成事件
    private onWebViewLoad = (win: Window) => {
        win.addEventListener("mousemove", this.onWindowActive);
        win.addEventListener("keydown", this.onWindowActive);
        this.webviewWindow = win;
    };

    //展开/关闭菜单
    private toggleMenu = () => {
        const menuOpen = !this.state.menuOpen;
        this.setState({
            menuOpen,
            activeNavbarItem: null
        }, () => {
            setLocalStorage("menuOpen", this.settings.rememberMenuState ? menuOpen : Settings.default().rememberMenuState);
        });
    };


    //显示本地设置项
    private showSettings = () => {
        Dialog.show({
            content: <Settings/>,
            height: 500,
            width: 480,
            icon: "cog",
            title: '本地设置',
            mask: true,
            maximizable: false,
            onClosed: this.initSettings
        })
    };

    //显示登录弹窗
    private showLogin = (onClosed?: LoginDialogOnClosed) => {
        Dialog.show({
            content: <Login/>,
            height: 400,
            width: 400,
            icon: 'user',
            title: '登录',
            mask: true,
            maximizable: false,
            onClosed: operater => execute(onClosed, operater.data())
        })
    };


    //刷新子页面
    private doRefresh = () => {
        if (!this.webviewWindow) return;
        this.setState({activeNavbarItem: 'refresh'});
        this.webviewWindow.location.reload();
        setTimeout(() => {
            this.setState({activeNavbarItem: null});
        }, 1500)
    };

    //解锁/锁屏
    private doLock = () => {
        const {isLockedScreen, lockerPassword} = this.state
            , onChange: OnLockChanged = {
            lock: isLockedScreen,
            password: lockerPassword,
            onResult: (lock: boolean, tips: string) => {
                this.setState({
                    isLockedScreen: lock,
                    lockerTips: tips || this.state.lockerTips,
                    activeNavbarItem: null,
                    lockerPassword: ''
                })
            }
        };
        execute(this.props.onLockChanged, onChange);
    };

    //退出登录
    private doSignOut = () => {
        Dialog.confirm("确定要退出登录吗?", "确定吗?", this.props.onSignOut)
    };

    //计算二级菜单高度
    private calcFloatMenuTop = (e, menu: MenuModel) => {
        this.setState({
            floatMenuTop: e.currentTarget.offsetTop + this.refSideContainer.current.offsetTop,
            floatMenuId: menu.id
        })
    };

    //渲染锁屏层
    private renderLockerLayer = () => {
        if (!this.state.isLockedScreen) return undefined;
        return <div className="hui-mask-80 locker">
            <div className="locker-block">
                <h2>已锁屏, 请输入登录密码解锁</h2>
                <div className="locker-input-container">
                    <input type="password" maxLength={40}
                           value={this.state.lockerPassword}
                           onChange={e => this.setState({
                               lockerPassword: e.currentTarget.value,
                               activeNavbarItem: null
                           })}
                           placeholder="请输入登录密码"/>
                    <button onClick={e => this.doLock()}>
                        <Icon name="lock-open"/>&nbsp;解锁
                    </button>
                </div>
                <h3>{this.state.lockerTips}</h3>
            </div>
        </div>
    };

    //渲染导航栏
    private renderNavbar = () => {
        const user = this.props.user ? <div className="navbar-item">
            <button className="no-background no-border mp-0"
                    onClick={e => this.onNavbarItemClicked("user")}>
                <Icon name={"user"}/>&nbsp;
                {this.props.user.realName || this.props.user.loginName}({this.props.user.roleName})&nbsp;
                <Icon name={"caret-down"} className="arrow"/>
            </button>
            <div className="navbar-popup-container right">
                <div className="navbar-popup">
                    <ul>
                        <li className="side-item">
                            <a href="javascript:;" onClick={this.onProfileClick}>
                                <Icon name="user"/>
                                <span className="side-label">个人中心</span>
                            </a>
                        </li>
                        <li className="side-item">
                            <a href="javascript:;" onClick={this.showSettings}>
                                <Icon name="cog"/>
                                <span className="side-label">本地设置</span>
                            </a>
                        </li>
                        <li className="side-item">
                            <a href="javascript:;" onClick={this.doCleanCache}>
                                <Icon name="trash-alt"/>
                                <span className="side-label">清空缓存</span>
                            </a>
                        </li>
                        {isFunction(this.props.onSignOut) ? <li className="side-item">
                            <a href="javascript:;" onClick={this.doSignOut}>
                                <Icon name="sign-out-alt"/>
                                <span className="side-label">退出登录</span>
                            </a>
                        </li> : undefined}
                    </ul>
                </div>
            </div>
        </div> : undefined;
        return <div className="navbar">
            <div className="navbar-item brand">
                {this.props.brand}
            </div>
            <div className="float-right right-actions">
                <button className="navbar-item" onClick={this.doRefresh}>
                    <Icon name={"sync"}
                          animation={this.state.activeNavbarItem === "refresh" ? IconAnimation.pulse : undefined}/>
                </button>
                {isFunction(this.props.onLockChanged) ? <button className="navbar-item" onClick={e => this.doLock()}>
                    {this.state.isLockedScreen ? <Icon name={"lock-open"}/> : <Icon name={"lock"}/>}
                </button> : undefined}
                {user}
            </div>
        </div>
    };

    //渲染侧边菜单
    private renderSideMenu = () => {
        return <ul>
            {this.props.menus.map((menu: MenuModel) => {
                const style: CSSProperties = {}
                    , active = this.state.activeIds.indexOf(menu.id) !== -1;
                // if (this.state.floatMenuId === menu.id && !active) {
                //     style.top = this.state.floatMenuTop;
                // }
                if ((this.state.menuOpen && !active) || !this.state.menuOpen) {
                    style.top = this.state.floatMenuTop;
                }
                return <li
                    onMouseMove={e => this.calcFloatMenuTop(e, menu)}
                    className={`side-item${active ? ' active' : ' can-hover'}`}>
                    <a href="javascript:;" onClick={e => this.onMenuItemClick(menu)}>
                        <Icon name={menu.icon || "bowling-ball"}/><span className="side-label">{menu.label}</span>
                    </a>
                    <ul className="float-menu" style={style}>
                        <li className="side-item float-menu-header">
                            <a href="javascript:;" onClick={e => this.onMenuItemClick(menu)}>{menu.label}</a>
                        </li>
                        {(menu.child || []).map(c => <li
                            className={`side-item${this.state.activeIds.indexOf(c.id) === -1 ? '' : ' active'}`}>
                            <a href="javascript:;" onClick={e => this.onMenuItemClick(c, menu)}>{c.label}</a>
                        </li>)}
                    </ul>
                </li>
            })}
        </ul>
    };

    render() {
        return <div className="admin-container" data-menu-open={this.state.menuOpen}>
            {this.renderNavbar()}
            <div className="side" ref={this.refSideContainer}>
                <div className="side-menu-container">
                    {this.renderSideMenu()}
                </div>
                <button className="btn-toggle-menu"
                        onClick={this.toggleMenu}>{makeToggleButtonContent(this.state.menuOpen)}</button>
            </div>
            <ol className="path">
                {this.state.path.map(path => {
                    return path ? <li>{path.label}</li> : undefined;
                })}
            </ol>
            <div className="content">
                <WebView url={this.state.currentLink}
                         onLoad={this.onWebViewLoad}
                         onUnLoad={() => this.componentWillUnmount()}
                         jsObject={this.adminActions}/>
            </div>
            {this.renderLockerLayer()}
        </div>
    }
}