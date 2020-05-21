import {
    transferToObject,
    readFile,
    writeFile,
    guid
} from './tools';
import {
    translateSrcList,
    translateLanguage
} from './translate';

const PROJECTS = []; // 全局的项目列表

export default {
    /**
     * 加载项目列表
     */
    loadProjects() {
        let result = readFile('../projects.json', (data) => PROJECTS.splice(0, PROJECTS.length, ...JSON.parse(data)));
        if (!result) result = writeFile('../projects.json', []);
        return PROJECTS;
    },
    /**
     * 保存项目
     * @param {*} param0 项目对象
     */
    saveProject({
        id = '',
        name = '',
        cnPath = '',
        enPath = ''
    }) {
        const project = {
            id: id || guid(),
            name,
            cnPath,
            enPath
        };
        const index = PROJECTS.findIndex(p => p.id === project.id);
        PROJECTS.splice(~index ? index : 0, id ? 1 : 0, project);
        const result = writeFile('../projects.json', PROJECTS, () => PROJECTS.splice(PROJECTS.findIndex(p => p.id === project.id), 1));
        return result ? project : null;
    },
    /**
     * 删除项目
     * @param {*} id 项目id
     */
    deleteProject(id) {
        const index = PROJECTS.findIndex(p => p.id === id);
        if (~index) {
            const project = PROJECTS.splice(index, 1);
            const result = writeFile('../projects.json', PROJECTS, () => PROJECTS.splice(index, 0, project));
            return result;
        } else {
            return false;
        }
    },
    /**
     * 获取项目详细内容
     * @param {*} project 项目对象
     */
    getProjectDetail(project) {
        const result = {};

        readFile(project.cnPath, (data) => (result.cn = transferToObject(data)), false);
        // 如果有英语文件路径则进行读取
        project.enPath && readFile(project.enPath, (data) => (result.en = transferToObject(data)), false);

        return result;
    },
    /**
     * 获取翻译源列表
     */
    getTranslateSrcList() {
        return translateSrcList;
    },
    /**
     * 语言翻译
     * @param {*} translateType 翻译源
     * @param {*} content 翻译内容
     */
    translate({
        translateType,
        content
    }) {
        return translateLanguage(translateType, content);
    },
    /**
     * 保存项目语言文件
     * @param {*} param0 project: 当前活动项目 cn: 中文语言 en: 英文语言
     */
    saveProjectFile({
        project,
        cn,
        en
    }) {
        cn = `export default ${JSON.stringify(cn)}`;
        en = `export default ${JSON.stringify(en)}`;
        // 读取结果和写入结果
        const readResult = {
            cn: true,
            en: true
        };
        const writeResult = {
            cn: true,
            en: true
        };
        // 保存原文件内容，失败时回滚
        const oldFile = {
            cn: null,
            en: null
        };
        let {
            cnPath,
            enPath
        } = project;
        // 如果没有英文路径则在中文所在目录生成英文文件
        if (!enPath) {
            enPath = cnPath.substring(0, cnPath.lastIndexOf('\\')) + '\\en.js';
        }
        // 先读取原文件内容
        readResult.cn = readFile(cnPath, data => (oldFile.cn = data), false);
        if (project.enPath) {
            readResult.en = readFile(enPath, data => (oldFile.en = data), false);
        }
        // 如果读取文件成功再进行写入
        if (readResult.cn && readResult.en) {
            // 先写入中文文件
            writeResult.cn = writeFile(cnPath, cn, () => writeFile(cnPath, oldFile.cn, null, false), false);
            // 写入英文文件
            writeResult.en = writeFile(enPath, en, () => oldFile.en && writeFile(enPath, oldFile.en, null, false), false);
            return writeResult.cn && writeResult.en && this.saveProject({
                ...project,
                enPath
            });
        } else {
            return false;
        }
    }
}
