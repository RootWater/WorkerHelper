import {
    readFile,
    writeFile,
    transferToObject,
    getFiles
} from './tools';
import fs from 'fs';

export default {
    /**
     * 筛查文件
     * @param {*} param0 路径
     * @param {*} win 窗体
     */
    filterFile({
        filePath,
        folderPath
    }, win) {
        const targetObj = this.getTargetObj(filePath);
        const properties = this.getProperties(targetObj);
        const files = getFiles(folderPath);
        const propertiesInfo = this.getPropertiesInfo(files, properties, win);
        return {
            isDone: true,
            propertiesInfo
        };
    },
    /**
     * 获取目标对象
     * @param {*} filePath 文件路径
     */
    getTargetObj(filePath) {
        let obj = {};
        readFile(filePath, (data) => (obj = transferToObject(data)), false);
        return obj;
    },
    /**
     * 获取对象所有属性引用
     * @param {*} obj 对象
     * @param {*} parentKey 父级key
     */
    getProperties(obj, parentKey = '') {
        const arr = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const isLastNode = typeof obj[key] === 'string'; // 是否末级
                const propInfo = {
                    title: key,
                    value: isLastNode ? obj[key] : '-',
                    fullKey: `${parentKey}${key}`,
                    path: '-',
                    state: false
                };
                if (isLastNode) {
                    arr.push(propInfo);
                } else {
                    arr.splice(0, 0, ...this.getProperties(obj[key], propInfo.fullKey + '.'));
                }
            }
        }
        return arr;
    },
    /**
     * 获取属性引用集合在文件中的信息
     * @param {*} files 文件集合
     * @param {*} properties 属性引用集合
     * @param {*} win 窗体对象
     */
    getPropertiesInfo(files = [], properties = [], win) {
        for (let i = 0, len = files.length; i < len; i++) {
            const file = files[i];
            win.webContents.send('filterHelper-filterFileProgress', {
                percent: Math.floor(((i + 1) / len) * 100),
                path: file
            });
            const content = fs.readFileSync(file, {
                encoding: 'utf-8'
            });
            for (const property of properties) {
                if (!property.state && content.includes(property.fullKey)) {
                    property.state = true;
                    property.path = file;
                }
            }
        }
        return properties;
    },
    /**
     * 删除属性
     * @param {*} param0 文件路径 需要删除的属性
     */
    deleteProperties({
        filePath,
        delProperties
    }) {
        const targetObj = this.getTargetObj(filePath);
        const keys = delProperties.map(p => p.fullKey);

        for (const key of keys) {
            let obj = targetObj;
            for (let i = 0, props = key.split('.'), len = props.length; i < len; i++) {
                if (i === len - 1) {
                    delete obj[props[i]];
                } else {
                    obj = obj[props[i]];
                }
            }
        }

        const content = `export default ${JSON.stringify(targetObj).replace(/,?"(\w|\d)*":\{\}/g, '')}`;
        const result = writeFile(filePath, content, null, false);
        return result;
    }
}
