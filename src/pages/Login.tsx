import * as React from "react";
import {ReactNode} from "react";
import {getLocalStorage, queryObject, setLocalStorage} from "hefang-ui-react";
import {execute} from "hefang-js";

export interface LoginForm {
    name: string
    password: string
    rmbName: boolean
    rmbPassword: boolean
    captcha: string
}

export interface LoginState extends LoginForm {

}

export interface LoginProps {
    header?: ReactNode
    footer?: ReactNode
    type?: 'page' | 'dialog'
    onSubmit?: (form: LoginForm) => void
}

export class Login extends React.Component<LoginProps, LoginState> {
    static readonly defaultProps: LoginProps = {
        header: '登录',
        footer: <div><a href="http://www.jueweikeji.com" target='_blank'>@绝唯科技</a> 提供技术支持</div>,
        type: queryObject('type', 'page') as any
    };

    constructor(props: LoginProps) {
        super(props);
        this.state = getLocalStorage('loginInfo', {
            name: '',
            password: '',
            rmbName: false,
            rmbPassword: false,
            captcha: ''
        });
    }

    private doSubmit = () => {
        if (execute(this.props.onSubmit, this.state) !== false) {
            let {password, name, rmbName, rmbPassword} = this.state;

            if (!rmbName) {
                name = '';
            }

            if (!rmbPassword) {
                password = '';
            }

            setLocalStorage("loginInfo", {password, name, rmbName, rmbPassword});
        }
    };

    private onChange = (value: string, name: string) => {
        const state = {};
        state[name] = value;
        this.setState(state);
    };

    private onRmbNameChange = (e) => {
        const rmbName = e.currentTarget.checked;
        this.setState({
            rmbName,
            rmbPassword: rmbName ? this.state.rmbPassword : false
        })
    };

    private onRmbPasswordChange = (e) => {
        const rmbPassword = e.currentTarget.checked;
        this.setState({
            rmbPassword,
            rmbName: rmbPassword ? true : this.state.rmbName
        })
    };

    render() {
        return <div className={`login-container login-type-${this.props.type}`}>
            <header>
                {this.props.header}
            </header>
            <div className="login-box">
                <div className="form-group">
                    <label htmlFor="name">用户名/手机号</label>
                    <input type="text" id="name"
                           placeholder='用户名/手机号'
                           className="hui-input display-block"
                           value={this.state.name}
                           onChange={e => this.onChange(e.currentTarget.value, "name")}/>
                </div>
                <div className="form-group">
                    <label htmlFor="password">密码</label>
                    <input type="password" id="password" placeholder='密码'
                           className="hui-input display-block"
                           value={this.state.password}
                           onChange={e => this.onChange(e.currentTarget.value, "password")}/>
                </div>
                <div className="form-group">
                    <label>
                        <input type="checkbox" checked={this.state.rmbName} onChange={this.onRmbNameChange}/> 记住用户名
                    </label>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <label>
                        <input type="checkbox" checked={this.state.rmbPassword}
                               onChange={this.onRmbPasswordChange}/> 记住密码
                    </label>
                </div>
                <button className="hui-btn-primary display-block" onClick={this.doSubmit}>登录</button>
            </div>
            <footer>
                {this.props.footer}
            </footer>
        </div>
    }
}