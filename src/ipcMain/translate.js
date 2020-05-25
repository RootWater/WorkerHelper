import axios from 'axios';
import md5 from 'md5';

// 翻译源列表
export const translateSrcList = [{
    type: 'youdao',
    text: '有道翻译'
}, {
    type: 'baidu',
    text: '百度翻译'
}]
// 翻译源路径
const translateSrcMap = {
    youdao: 'http://fanyi.youdao.com/translate',
    baidu: 'https://fanyi-api.baidu.com/api/trans/vip/translate'
};
// 请求时格式转换
const requestFormatMap = {
    youdao(content) {
        return {
            doctype: 'json',
            type: 'ZH_CN2EN',
            i: encodeURIComponent(content)
        };
    },
    baidu(q) {
        const appid = '20200516000457875';
        const salt = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x{4,4}/g, Math.ceil(Math.random() * 10000)).replace(/-/g, '');
        const getSign = (q) => {
            const key = 'lxa5f05dOITqIMIRxdO4';
            return md5(appid + q + salt + key);
        };
        return {
            q: encodeURIComponent(q),
            from: 'cn',
            to: 'en',
            appid,
            salt,
            sign: getSign(q)
        };
    }
};
// 响应后格式转换
const responseFormatMap = {
    youdao: data => data.data.translateResult.flat(Infinity)[0].tgt,
    baidu: data => data.data.trans_result.flat(Infinity)[0].dst
};
/**
 * 翻译类
 */
export class Translate {
    constructor(type, content) {
        this.type = type;
        this.translateSrc = translateSrcMap[type];
        this.data = Object.entries(requestFormatMap[type](content)).join('&').replace(/,/g, '=');
    }
    async translate() {
        try {
            const data = await axios.get(`${this.translateSrc}?${this.data}`);
            return responseFormatMap[this.type](data);
        } catch (error) {
            return '';
        }
    }
}
/**
 * 语言翻译
 * @param {*} translateType 翻译源
 * @param {*} content 翻译内容
 */
export const translateLanguage = (translateType, content) => new Translate(translateType, content).translate();
