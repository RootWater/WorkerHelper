import {
    dialog
} from 'electron';

export default {
    /**
     * 选择文件
     * @param {*} params 参数
     * @param {*} win 窗体
     */
    async selectFile(params, win) {
        const result = await dialog.showOpenDialog(win, {
            title: '请选择语言文件',
            filters: [{
                name: 'js文件',
                extensions: ['js']
            }],
            properties: ['openFile']
        });
        if (result.canceled) {
            return {
                selected: false
            };
        } else {
            return {
                selected: true,
                filePath: result.filePaths[0]
            };
        }
    },
    /**
     * 选择文件夹
     * @param {*} params 参数
     * @param {*} win 窗体
     */
    async selectFolder(params, win) {
        const result = await dialog.showOpenDialog(win, {
            title: '请选择目录',
            filters: [{
                name: '文件夹'
            }],
            properties: ['openDirectory']
        });
        if (result.canceled) {
            return {
                selected: false
            };
        } else {
            return {
                selected: true,
                filePath: result.filePaths[0]
            };
        }
    }
}
