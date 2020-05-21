import {
    Notice
} from 'view-design';
import {
    isEmptyObject
} from './tools';
/**
 * 自定义提示
 * @param {*} param0 state: 结果状态, successMsg: 成功的提示消息, errorMsg: 失败的提示消息, successCallback: 成功回调, errorCallback: 失败回调
 */
export function customNotice({
    state = true,
    successMsg = '成功',
    errorMsg = '失败',
    successCallback,
    errorCallback
}) {
    const noticeConfig = {
        type: state ? 'success' : 'error',
        title: '系统提示',
        desc: state ? successMsg : errorMsg
    };
    if (state) {
        successCallback && successCallback();
    } else {
        errorCallback && errorCallback();
    }
    Notice[noticeConfig.type](noticeConfig);
}
/**
 * 导航菜单列表
 */
export const menuList = [{
        "path": "/LangHelper",
        "icon": "",
        "text": "语言翻译"
    },
    {
        "path": "/FilterHelper",
        "icon": "",
        "text": "属性筛查"
    }
]
/**
 * 转换对象变为树形结构数据
 */
export function transferObjToTree(cnObj = {}, enObj = {}, rootKey = "") {
    const arr = [];
    for (const key in cnObj) {
        if (cnObj.hasOwnProperty(key)) {
            const cnElement = cnObj[key];
            const enElement = enObj[key];
            const isLastNode = typeof cnElement === "string"; // 是否末级
            const node = {
                title: key,
                cnValue: `${key}${isLastNode ? `——${cnElement}` : ''}`,
                enValue: `${key}${isLastNode ? `——${enElement}` : ''}`,
                value: {
                    cn: cnElement,
                    en: enElement
                },
                open: false,
                isLastNode,
                iconSkin: `ivu-icon ivu-icon-md-${isLastNode ? 'paper' : 'folder'} i`,
                fullKey: `${rootKey}${key}`
            };
            if (!isLastNode) {
                node.children = [];
                this.$nextTick(() => {
                    this.$set(node, 'children', transferObjToTree.call(this, cnElement, enElement, `${node.fullKey}.`));
                });
            }
            if (!this.treeMap[node.fullKey]) {
                this.$set(this.treeMap, node.fullKey, node);
            }
            arr.push(node);
        }
    }
    return arr;
}
/**
 * 转换树为对象
 */
export function transferTreeToObj(tree, parentKey = "") {
    const obj = {};
    for (const key in tree) {
        if (tree.hasOwnProperty(key)) {
            const node = tree[key];
            if (!parentKey && node.fullKey.indexOf(".") < 0) {
                obj[node.title] = node.isLastNode ? node.value : transferTreeToObj(tree, `${node.fullKey}.`);
            } else if (
                node.fullKey.startsWith(parentKey) &&
                node.fullKey.replace(parentKey, "").indexOf(".") < 0
            ) {
                obj[node.title] = node.isLastNode ? node.value : transferTreeToObj(tree, `${node.fullKey}.`);
            }
        }
    }
    return obj;
}
/**
 * 分离语言
 * @param {*} lang 语言对象
 */
export function splitLang(lang) {
    const stack = Object.entries(lang);
    const cn = {};
    const en = {};
    while (stack.length) {
        const [key, val] = stack.pop();
        const prev = val.cn && val.en ? val : splitLang(val);
        if (!isEmptyObject(prev.cn) && !isEmptyObject(prev.en)) {
            cn[key] = prev.cn;
            en[key] = prev.en;
        }
    }
    return {
        cn,
        en
    };
}
