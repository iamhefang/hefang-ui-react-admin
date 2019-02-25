import * as React from "react";
import * as ReactDOM from "react-dom";
import {MenuModel} from "./src/models/MenuModel";
import {guid, range} from "hefang-js";
import {Admin} from "./src/pages/Admin";

const menus: MenuModel[] = [
    {
        id: "1",
        icon: "cog",
        label: "系统设置",
        link: null,
        target: null,
        child: [
            {
                id: "2",
                label: "网站设置",
                link: "https://so.com"
            },
            {
                id: guid(),
                label: "上传设置",
                link: "https://hefang.link"
            }
        ]
    },
    {
        id: "3",
        icon: "cog",
        label: "系统设置2",
        link: null,
        target: null,
        child: [
            {
                id: "4",
                label: "网站设置2"
            },
            {
                id: "5",
                label: "上传设置2"
            }
        ]
    }
];

range(10, 50).forEach(function (idx) {
    menus.push({
        id: idx + "",
        label: "功能" + idx
    })
});

const user = {
    isLockedScreen: false,
    realName: '何方',
    roleName: '超级管理员',
    isSuperAdmin: false,
    isAdmin: true
};

ReactDOM.render(<Admin menus={menus} user={user} onSignOut={() => {
    console.log(1)
}}/>, document.body);


// ReactDOM.render(<Login/>, document.body);