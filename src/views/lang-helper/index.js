import IpcRenderer from '@/libs/ipcRenderer';
import {
    deepClone
} from '@/libs/tools';
import {
    customNotice
} from "@/libs/utils";

const ipc = new IpcRenderer('langHelper');

export default {
    data() {
        return {
            projectList: [], // 项目列表
            projectForm: {
                id: '',
                name: '',
                cnPath: '',
                enPath: ''
            }, // 项目表单
            projectRules: {
                name: [{
                    required: true,
                    message: '项目名称不能为空'
                }],
                cnPath: [{
                    required: true,
                    message: '文件路径不能为空'
                }]
            }, // 项目表单验证规则
            modal: {
                editProject: false, // 编辑项目
                showDetail: false // 显示详情操作页
            }, // 模态框控制
            modalParams: {
                showDetail: {} // 详情操作的参数
            }, // 模态框参数
            showMaskId: '' // 显示卡片遮罩层
        }
    },
    computed: {
        editProjectTitle() {
            return `${this.projectForm.id ? '修改' : '添加'}项目`;
        }
    },
    methods: {
        /**
         * 初始化
         */
        init() {
            this.loadProjects();
        },
        /**
         * 加载项目
         */
        loadProjects() {
            ipc.once('loadProjects', null, (success, data) => {
                if (success) this.projectList = data;
            });
        },
        /**
         * 编辑项目
         */
        editProject(project = {}) {
            this.projectForm = deepClone(project);
            this.modal.editProject = true;
        },
        /**
         * 删除项目
         * @param {*} param0 删除的项目对象
         * @param {*} index 删除的项目索引
         */
        delProject({
            id,
            name
        }, index) {
            // 删除时需要提示
            this.$Modal.confirm({
                title: '删除提示',
                content: `您确定删除项目：${name} 吗？`,
                onOk: () => {
                    ipc.once('deleteProject', id, (success, data) => {
                        customNotice({
                            state: success && data,
                            successMsg: `删除项目：${name} 成功`,
                            errorMsg: `删除项目：${name} 失败`,
                            successCallback: () => {
                                this.projectList.splice(index, 1);
                                localStorage.removeItem(id);
                            }
                        });
                    })
                }
            })
        },
        /**
         * 选择文件路径
         */
        selectFile(type = 'cn') {
            ipc.once('selectFile', null, (success, data) => {
                customNotice({
                    state: success && data.selected,
                    successMsg: '选择文件成功',
                    errorMsg: '选择文件失败',
                    successCallback: () => {
                        this.$set(this.projectForm, `${type}Path`, data.filePath); // 为路径赋值
                    }
                });
            }, 'common');
        },
        /**
         * 编辑项目确定
         */
        confirmEditProject() {
            this.$refs.editProject.validate(valid => {
                if (valid) {
                    ipc.once('saveProject', this.projectForm, (success, data) => {
                        customNotice({
                            state: success && data,
                            successMsg: `${this.editProjectTitle}成功`,
                            errorMsg: `${this.editProjectTitle}失败`,
                            successCallback: () => {
                                const index = this.projectList.findIndex(p => p.id === data.id);
                                this.projectList.splice(~index ? index : 0, ~index ? 1 : 0, data);
                                this.modal.editProject = false;
                            }
                        })
                    });
                }
            })
        },
        /**
         * 打开详情页面
         * @param {*} project 选择的项目对象
         */
        openDetail(project) {
            this.showMaskId = '';
            this.modalParams.showDetail = deepClone(project);
            this.modal.showDetail = true;
        }
    },
    created() {
        this.init();
    }
}
