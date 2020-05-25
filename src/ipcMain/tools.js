import fs from 'fs';
import path from 'path';

/**
 * 删除文件
 * @param {*} filePath 文件路径
 * @param {*} autoJoin 自动拼接当前目录
 */
export function deleteFile(filePath, autoJoin = true) {
    try {
        fs.unlinkSync(autoJoin ? path.join(__dirname, filePath) : filePath);
        return true;
    } catch (error) {
        return error;
    }
}
/**
 * 转换字符串为js对象
 * @param {*} str 字符串
 */
export function transferToObject(str) {
    str = str.toString()
        .replace(/export default\s*/, '()=>(')
        .replace(/(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g, '')
        .replace(/(\t|\n)+/g, '')
        .replace(/\)/g, '\)') +
        ')';
    let result;
    try {
        result = eval(str)();
    } catch (error) {
        result = {};
    }
    return result;
}
/**
 * 读取文件
 * @param {*} filePath 文件路径
 * @param {*} callback 成功回调函数
 * @param {*} autoJoin 自动拼接路径
 */
export function readFile(filePath = '', callback, autoJoin = true) {
    let result;
    try {
        const data = fs.readFileSync(autoJoin ? path.join(__dirname, filePath) : filePath, {
            encoding: 'utf-8'
        });
        callback && callback(data);
        result = true;
    } catch (error) {
        result = false;
    }
    return result;
}
/**
 * 写入数据到文件中
 * @param {*} filePath 文件路径
 * @param {*} data 写入的数据
 * @param {*} callback 失败回调
 * @param {*} autoJoin 自动拼接路径
 */
export function writeFile(filePath = '', data, callback, autoJoin = true) {
    let result;
    try {
        fs.writeFileSync(autoJoin ? path.join(__dirname, filePath) : filePath, typeof data === 'object' ? JSON.stringify(data) : data, {
            encoding: 'utf-8'
        });
        result = true;
    } catch (error) {
        result = false;
        callback && callback(data);
    }
    return result;
}
/**
 * 用于生成唯一标识
 */
export function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
/**
 * 获取目录下的所有文件路径
 * @param {*} findPath 目录路径
 */
export function getFiles(findPath) {
    let files = [];
    try {
        const dirFiles = fs.readdirSync(findPath);
        for (const file of dirFiles) {
            const filePath = path.join(findPath, file);
            const fileStat = fs.statSync(filePath);

            if (fileStat.isFile()) {
                files.push(filePath);
            } else {
                files.splice(0, 0, ...getFiles(filePath));
            }
        }
    } catch (error) {
        files = [];
    }
    return files;
}
