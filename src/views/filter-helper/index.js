import IpcRenderer from '@/libs/ipcRenderer';
import {
    initialUpper,
    updateObjVal
} from '@/libs/tools';
import {
    customNotice
} from '@/libs/utils';
import {
    filterTableColumns
} from './entity';

const ipc = new IpcRenderer('filterHelper');

export default {
    data() {
        return {
            filePath: '',
            folderPath: '',
            search: {
                title: '',
                value: '',
                fullKey: '',
                state: 'true'
            },
            filterTable: {
                columnList: filterTableColumns.call(this),
                data: [],
                originalData: [],
                selection: [],
                loading: false,
                total: 0,
                pageNumber: 1,
                pageSize: 10
            },
            modal: {
                showMask: false
            },
            modalParams: {
                showMask: {
                    percent: 0,
                    path: ''
                }
            }
        }
    },
    computed: {
        isFilterDone() {
            return this.modalParams.showMask.percent === 100;
        }
    },
    watch: {
        search: {
            deep: true,
            handler(val) {
                this.filterTable.pageNumber = 1;
                this.loadTableData({
                    pageSize: this.filterTable.pageSize
                });
            }
        },
        filePath() {
            this.init();
        },
        folderPath() {
            this.init();
        }
    },
    methods: {
        init() {
            // const content = `export default ${JSON.stringify(targetObj).replace(/,?"(\w|\d)*":\{\}/g, '')}`;
            updateObjVal(this.filterTable, ['data', 'originalData', 'selection', 'loading', 'total', 'pageNumber'], [
                [],
                [],
                [], false, 0, 1
            ]);
            updateObjVal(this.search, ['title', 'value', 'fullKey', 'state'], ['', '', '', 'true']);
        },
        /**
         * 选择路径
         * @param {*} type 类型
         */
        selectPath(type) {
            ipc.once(`select${initialUpper(type)}`, null, (success, {
                selected,
                filePath
            }) => {
                customNotice({
                    state: success && selected,
                    successMsg: `选择${type === 'file' ? '文件' : '文件夹'}成功`,
                    errorMsg: `选择${type === 'file' ? '文件' : '文件夹'}失败`,
                    successCallback: () => {
                        this[`${type}Path`] = filePath;
                    }
                })
            }, 'common');
        },
        /**
         * 开始筛查
         */
        handleStartFilter() {
            // 初始化状态
            this.modalParams.showMask.percent = 0;
            this.modalParams.showMask.path = '';
            this.modal.showMask = true;
            // 存放主进程发送的消息
            const percents = [];
            const paths = [];
            // 监听主进程发送的消息
            ipc.winOn('filterFileProgress', ({
                percent,
                path
            }) => {
                percents.push(percent);
                paths.push(path);
            });
            // 向主进程发送消息
            ipc.once('filterFile', {
                filePath: this.filePath,
                folderPath: this.folderPath
            }, (success, {
                isDone,
                propertiesInfo
            }) => {
                // 让进度环加载有度
                const timer = setInterval(() => {
                    if (percents.length && paths.length) {
                        const [percent] = percents.splice(0, 1);
                        const [path] = paths.splice(0, 1);

                        this.modalParams.showMask.percent = percent;
                        this.modalParams.showMask.path = path;
                    } else {
                        clearInterval(timer);
                        // 不让遮罩层消失的太突兀
                        setTimeout(() => {
                            this.modal.showMask = false;
                            this.filterTable.originalData = propertiesInfo;
                            this.filterTable.pageNumber = 1;
                            // 若一次渲染过多数据会导致页面出现卡顿
                            this.filterTable.loading = true;
                            setTimeout(() => {
                                this.loadTableData({
                                    pageSize: this.filterTable.pageSize
                                });
                            }, 100);
                        }, 500);
                    }
                }, Math.ceil(Math.random() * 100));
            });
        },
        /**
         * 加载表格分页数据
         * @param {number} pageNumber: 页码
         * @param {number} pageSize: 每页条数
         */
        loadTableData({
            pageNumber = 1,
            pageSize = 10
        }) {
            const filterTable = this.filterTable;
            const originalData = filterTable.originalData.filter(v => {
                const search = this.search;
                const {
                    title,
                    value,
                    fullKey,
                    state
                } = v;
                return title.includes(search.title) && value.includes(search.value) && fullKey.includes(search.fullKey) && state.toString() === search.state;
            }); // 根据搜索条件过滤
            const startIndex = (pageNumber - 1) * pageSize;
            const endIndex = pageNumber * pageSize;

            filterTable.loading = true;
            filterTable.data = originalData.slice(startIndex, endIndex);
            filterTable.total = originalData.length;
            filterTable.loading = false;
        },
        /**
         * 改变分页数据
         * @param {*} data 页码或条数
         * @param {*} type 类型
         */
        changePage(data, type) {
            this.filterTable[type] = data;
            this.loadTableData({
                pageNumber: this.filterTable.pageNumber,
                pageSize: this.filterTable.pageSize
            });
        },
        /**
         * 删除属性
         * @param {*} type 删除类型
         */
        handleDelProperty(type) {
            const typeMap = {
                'selection': this.filterTable.selection,
                'current': this.filterTable.data,
                'all': this.filterTable.originalData
            };
            const delProperties = typeMap[type];

            if (!delProperties.length) {
                this.$Message.warning('请选择需要删除的数据');
                return;
            }

            this.$Modal.confirm({
                title: '删除确认',
                content: '您确认删除这些属性吗？',
                onOk: () => {
                    ipc.once('deleteProperties', {
                        filePath: this.filePath,
                        delProperties
                    }, (success, data) => {
                        customNotice({
                            state: success && data,
                            successMsg: '删除成功',
                            errorMsg: '删除失败',
                            successCallback: () => {
                                for (const p of delProperties) {
                                    const index = this.filterTable.originalData.findIndex(_p => _p.fullKey === p.fullKey);
                                    this.filterTable.originalData.splice(index, 1);
                                }
                                this.filterTable.pageNumber = 1;
                                this.loadTableData({
                                    pageSize: this.filterTable.pageSize
                                });
                            }
                        })
                    });
                }
            })
        }
    }
}
