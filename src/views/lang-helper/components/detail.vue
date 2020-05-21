<!--
 * @Date: 2020-05-15 10:22:22
 * @LastEditors: Murray
 * @LastEditTime: 2020-05-20 08:44:06
 * @FilePath: \worker-helper\src\views\lang-helper\components\detail.vue
-->
<template>
    <div class="lang-helper-detail">
        <!-- 详情操作 -->
        <Card class="detail__actions">
            <Row type="flex"
                 :gutter="20">
                <i-col span="4">
                    <Input v-model="project.name"
                           placeholder="项目名"
                           readonly />
                </i-col>
                <i-col span="4">
                    <Select v-model="translateType"
                            placeholder="请选择翻译源">
                        <Option v-for="(translate) in translateSrcList"
                                :key="translate.type"
                                :value="translate.type">{{translate.text}}</Option>
                    </Select>
                </i-col>
                <i-col span="4">
                    <Select v-model="mode"
                            placeholder="请选择当前模式">
                        <Option value="common">普通模式</Option>
                        <Option value="development">开发模式</Option>
                    </Select>
                </i-col>
                <i-col span="4">
                    <Input v-model.trim="searchCondition"
                           search
                           placeholder="请输入搜索条件"
                           @on-change="debounceFn.filterTree"
                           @on-search="filterTree" />
                </i-col>
                <i-col span="4">
                    <Button type="primary"
                            long
                            @click="saveFile">保存文件</Button>
                </i-col>
                <i-col span="4">
                    <Button type="primary"
                            long
                            @click="handleBack">返回</Button>
                </i-col>
            </Row>
        </Card>
        <!-- 语言树 -->
        <Card class="detail__tree">
            <!-- 树操作 -->
            <Card :dis-hover="true">
                <Row type="flex"
                     justify="center">
                    <i-col v-for="(btn) in nodeActionButtons"
                           :key="btn.name"
                           span="4">
                        <Button :type="btn.type"
                                @click="handleNodeAction(btn.name)">
                            <Icon :type="btn.icon"></Icon>
                            {{btn.text}}
                        </Button>
                    </i-col>
                </Row>
            </Card>
            <!-- 语言树区 -->
            <Row type="flex"
                 class="detail__tree__wrap">
                <i-col class="wrap__item">
                    <z-tree ref="cnTree"
                            :setting="getTreeSetting('cn')"
                            :nodes="filterTreeData"></z-tree>
                </i-col>
                <i-col class="wrap__item">
                    <z-tree ref="enTree"
                            :setting="getTreeSetting('en')"
                            :nodes="filterTreeData"></z-tree>
                </i-col>
            </Row>
        </Card>
        <!-- 编辑节点遮罩层 -->
        <Modal v-model="modal.editNode"
               width="500px"
               title="编辑节点"
               :mask-closable="false">
            <Form ref="editNode"
                  style="width: 80%; margin: 0 auto;"
                  label-position="top"
                  :model="editNodeForm"
                  :rules="editNodeRules">
                <!-- <FormItem label="节点级别"
                          prop="isLastNode">
                    <Input v-model.trim="nodeLevel"
                           placeholder="请填写节点级别"
                           spellcheck
                           readonly />
                </FormItem> -->
                <FormItem label="节点标题"
                          prop="title">
                    <Input v-model.trim="editNodeForm.title"
                           placeholder="请填写节点标题"
                           spellcheck />
                </FormItem>
                <template v-if="editNodeForm.isLastNode">
                    <FormItem label="节点中文"
                              prop="cn">
                        <Input v-model="editNodeForm.cn"
                               type="textarea"
                               placeholder="请填写节点中文"
                               spellcheck
                               :rows="4"
                               :autosize="true" />
                    </FormItem>
                    <FormItem label="节点英文"
                              prop="en">
                        <Input v-model="editNodeForm.en"
                               type="textarea"
                               placeholder="请填写节点英文"
                               spellcheck
                               :rows="4"
                               :autosize="true" />
                    </FormItem>
                </template>
                <FormItem label="完整引用"
                          prop="fullKey">
                    <Input ref="fullKeyInput"
                           v-model="editNodeForm.fullKey"
                           placeholder="请填写完整引用"
                           spellcheck
                           readonly
                           icon="md-copy"
                           @on-click="copyFullKey" />
                </FormItem>
            </Form>
            <template slot="footer">
                <Button @click="() => { modal.editNode = false; editNodeForm = {}; }">取消</Button>
                <Button type="primary"
                        @click="confirmEditNode">确定</Button>
            </template>
        </Modal>
        <!-- 当前模式选择 -->
        <Modal v-model="modal.mode"
               title="模式选择"
               width="300px"
               :closable="false"
               :mask-closable="false"
               :footer-hide="true">
            <div class="mode-wrap">
                <Button @click="handleSaveMode('common')">普通模式</Button>
                <Button type="primary"
                        @click="handleSaveMode('development')">开发模式</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import IpcRenderer from "@/libs/ipcRenderer";
import { deepClone, debounce, updateObjVal } from "@/libs/tools";
import {
    customNotify,
    transferObjToTree,
    transferTreeToObj,
    splitLang
} from "@/libs/utils";
import ZTree from "vue-giant-tree";

const ipc = new IpcRenderer({
    moduleName: "langHelper",
    notUseSpin: ["translate"]
});

export default {
    name: "detail",
    components: { ZTree },
    props: {
        show: {
            Boolean,
            default: false
        },
        project: {
            Object,
            default: () => ({})
        }
    },
    data() {
        return {
            translateSrcList: [], // 翻译源列表
            translateType: "", // 选中的翻译源
            treeData: [], // 树数据
            filterTreeData: [], // 过滤的树数据
            currentSelectedNode: null, // 当前选中的节点
            treeMap: {}, // 树映射
            mode: "common", // 当前模式
            searchCondition: "", // 搜索条件
            nodeActionButtons: [
                {
                    name: "expand",
                    icon: "ios-expand",
                    type: "info",
                    text: "展开"
                },
                {
                    name: "contract",
                    icon: "ios-contract",
                    type: "default",
                    text: "折叠"
                },
                {
                    name: "add",
                    icon: "md-add",
                    type: "primary",
                    text: "新增"
                },
                {
                    name: "edit",
                    icon: "md-create",
                    type: "success",
                    text: "编辑"
                },
                {
                    name: "delete",
                    icon: "md-remove",
                    type: "error",
                    text: "删除"
                }
            ], // 节点操作按钮
            modal: {
                editNode: false,
                mode: false
            }, // 模态框控制
            editNodeForm: {}, // 编辑节点表单
            editNodeRules: {
                title: {
                    required: true,
                    message: "节点标题不能为空"
                }
            }, // 编辑节点表单验证规则
            debounceFn: {
                saveFile: debounce.call(this, this.saveFile),
                translate: debounce.call(this, this.translate),
                filterTree: debounce.call(this, this.filterTree)
            },
            hasNoSaveChange: false // 是否有未保存的更改
        };
    },
    computed: {
        // 节点级别
        nodeLevel() {
            return this.editNodeForm.isLastNode ? "末级节点" : "父级节点";
        },
        // 是否是开发模式
        isDevelopment() {
            return this.mode === "development";
        },
        // ZTree内部树对象
        cnTreeObj() {
            return this.$refs.cnTree.ztreeObj;
        },
        enTreeObj() {
            return this.$refs.enTree.ztreeObj;
        }
    },
    methods: {
        async init() {
            this.modal.mode = true;
            // 加载树根节点
            this.$set(this, "treeData", this.loadTreeRoot());
            // 获取翻译源 获取项目内容 绑定滚动事件
            await this.getTranslateSrcList();
            await this.getProjectDetail();
            this.bindScrollEvent();
            // 初次加载需要手动执行过滤方法
            this.filterTree();
        },
        /**
         * 获取树配置
         */
        getTreeSetting(type) {
            const setting = {
                view: {
                    showIcon: true,
                    selectedMulti: false,
                    dblClickExpand: false
                },
                data: {
                    key: {
                        name: `${type}Value`
                    }
                },
                callback: {
                    onExpand: this.handleTreeExpand,
                    onCollapse: this.handleTreeContract,
                    onClick: this.handleTreeClick,
                    onDblClick: this.handleEditNode
                }
            };
            return setting;
        },
        /**
         * 绑定滚动事件
         */
        bindScrollEvent() {
            const cnTree = this.$refs.cnTree.$el.parentElement;
            const enTree = this.$refs.enTree.$el.parentElement;

            let fromCn = false; // 来自cnTree滚动
            let fromEn = false; // 来自enTree滚动
            let t1, t2; // 用于判断是否停止滚动

            cnTree.addEventListener("scroll", e => {
                // 如果来自enTree则不继续执行
                if (fromEn) return;
                // 先清空计时器，再重新设置200ms后改变状态
                clearTimeout(t1);
                t1 = setTimeout(() => {
                    fromCn = false;
                }, 200);
                // 当前来自cnTree
                fromCn = true;
                const { scrollTop, scrollHeight, clientHeight } = e.srcElement;
                // 控制enTree同步滚动
                enTree.scrollTop =
                    (scrollTop / (scrollHeight - clientHeight)) *
                    (enTree.scrollHeight - enTree.clientHeight);
            });
            enTree.addEventListener("scroll", e => {
                // 如果来自cnTree则不继续执行
                if (fromCn) return;
                // 先清空计时器，再重新设置200ms后改变状态
                clearTimeout(t2);
                t2 = setTimeout(() => {
                    fromEn = false;
                }, 200);
                // 当前来自enTree
                fromEn = true;
                const { scrollTop, scrollHeight, clientHeight } = e.srcElement;
                // 控制enTree同步滚动
                cnTree.scrollTop =
                    (scrollTop / (scrollHeight - clientHeight)) *
                    (cnTree.scrollHeight - cnTree.clientHeight);
            });
        },
        /**
         * 获取项目内容
         */
        async getProjectDetail() {
            ipc.once("getProjectDetail", this.project, (success, data) => {
                const treeArr = transferObjToTree.call(this, data.cn, data.en);
                // 加载根节点的子数组
                this.$set(this.treeMap["TREE_ROOT"], "children", treeArr);
            });
        },
        /**
         * 获取翻译源
         */
        async getTranslateSrcList() {
            return new Promise((resolve, reject) => {
                ipc.once("getTranslateSrcList", null, (success, data) => {
                    this.translateSrcList = data;
                    this.translateType =
                        localStorage.getItem("translateType") || data[0].type;
                    resolve();
                });
            });
        },
        /**
         * 加载树根节点
         */
        loadTreeRoot() {
            const node = {
                title: "TREE_ROOT",
                cnValue: "中文",
                enValue: "英文",
                value: "TREE_ROOT",
                open: true,
                isLastNode: false,
                iconSkin: "ivu-icon ivu-icon-md-folder i",
                fullKey: "TREE_ROOT",
                children: []
            };
            this.$set(this.treeMap, node.fullKey, node);
            return [node];
        },
        /**
         * 删除节点
         */
        handleDeleteNode() {
            if (!this.currentSelectedNode) {
                this.$Message.warning("请选择需要删除的节点");
                return;
            }
            const nodeData = this.treeMap[this.currentSelectedNode.fullKey];

            if (/TREE_ROOT/.test(nodeData.fullKey)) {
                this.$Message.warning("根节点不能删除");
                return;
            }

            this.$Modal.confirm({
                title: "删除确认",
                content: "您确认删除这个节点吗？",
                onOk: () => {
                    this.hasNoSaveChange = true;

                    const parentKey =
                        nodeData.fullKey.replace(/(\.?\w*)$/, "") ||
                        "TREE_ROOT"; // 父级key，若没有则为根节点key
                    const parent = this.treeMap[parentKey];
                    const index = parent.children.findIndex(
                        el => el.fullKey === nodeData.fullKey
                    );
                    // 从父级中删除该节点
                    parent.children.splice(index, 1);
                    // 渲染树后展开父节点
                    parent.open = true;
                    // 删除该节点所有信息
                    delete this.treeMap[nodeData.fullKey];
                    delete this.treeMap[parentKey].value[nodeData.fullKey];
                    // 根据子数组长度判断是否末级
                    parent.isLastNode = !parent.children.length;
                    // 如果为末级节点，则替换图标 value为字符串 不应有children属性
                    if (parent.isLastNode) {
                        parent.iconSkin = "ivu-icon ivu-icon-md-paper i";
                        parent.value = {
                            cn: "这是一个节点",
                            en: "This is a node"
                        };
                        delete parent.children;
                    }
                    this.$Message.success("删除节点成功");
                    // 开发模式时自动保存文件
                    this.isDevelopment && this.debounceFn.saveFile();
                    // 删除后树渲染完成单击父节点
                    setTimeout(() => {
                        this.handleTreeClick(null, null, parent);
                    }, 0);
                }
            });
        },
        /**
         * 新增节点
         */
        handleAddNode() {
            if (!this.currentSelectedNode) {
                this.$Message.warning("请选择需要被追加的节点");
                return;
            }
            // 当前节点数据;
            const nodeData = this.treeMap[this.currentSelectedNode.fullKey];
            // 判断当前节点是否为根节点
            const isRoot = /TREE_ROOT/.test(nodeData.fullKey);
            // 新克隆的节点
            const cloneNode = deepClone(nodeData);
            // 当前节点的子数组
            const children = nodeData.children || [];
            // 新的key值
            const nodeKey = `node${Date.now()}`;
            // 根节点的子节点fullKey与其他子节点不同
            const fullKey = isRoot
                ? nodeKey
                : `${cloneNode.fullKey}.${nodeKey}`;
            // 改变新节点属性值
            updateObjVal(
                cloneNode,
                [
                    "title",
                    "cnValue",
                    "enValue",
                    "value",
                    "fullKey",
                    "isLastNode",
                    "open",
                    "iconSkin"
                ],
                [
                    nodeKey,
                    nodeKey + "——新节点",
                    nodeKey + "——New node",
                    { cn: "新节点", en: "New node" },
                    fullKey,
                    true,
                    false,
                    "ivu-icon ivu-icon-md-paper i"
                ]
            );
            // 末级节点不能有children属性
            delete cloneNode.children;
            // 判断是否末级节点
            if (nodeData.isLastNode) {
                // 改变原节点的属性值
                updateObjVal(
                    nodeData,
                    ["isLastNode", "open", "iconSkin"],
                    [false, true, "ivu-icon ivu-icon-md-folder i"]
                );
                updateObjVal(
                    nodeData.value,
                    ["cn", "en"],
                    [
                        { [cloneNode.title]: cloneNode.value.cn },
                        { [cloneNode.title]: cloneNode.value.en }
                    ]
                );
            } else {
                nodeData.open = true;
                if (!isRoot) {
                    // 为父级value新增当前节点信息
                    nodeData.value.cn[nodeKey] = cloneNode.value.cn;
                    nodeData.value.en[nodeKey] = cloneNode.value.en;
                }
            }
            // 为树映射新增克隆节点的映射
            this.$set(this.treeMap, cloneNode.fullKey, cloneNode);
            // 将克隆节点添加进父级中
            children.unshift(cloneNode);
            // 为树映射绑定响应的子数组
            this.$set(nodeData, "children", children);
            // 如果有搜索条件则进行过滤
            this.searchCondition && this.filterTree();
            this.$Message.success("新增节点成功");
            // 普通模式不会自动保存
            this.hasNoSaveChange = true;
            // 开发模式时自动保存文件
            this.isDevelopment && this.debounceFn.saveFile();
            // 添加后渲染树完成单击该父节点
            setTimeout(() => {
                this.handleTreeClick(null, null, cloneNode);
                this.handleEditNode();
            }, 0);
        },
        /**
         * 编辑节点
         */
        handleEditNode() {
            if (!this.currentSelectedNode) {
                this.$Message.warning("请选择需要编辑的节点");
                return;
            }
            const data = this.treeMap[this.currentSelectedNode.fullKey];
            this.setReactiveVal(this.editNodeForm, {
                fullKey: data.fullKey,
                title: data.title,
                isLastNode: data.isLastNode,
                ...data.value
            });
            this.modal.editNode = true;
        },
        /**
         * 编辑节点确定
         */
        confirmEditNode() {
            this.$refs.editNode.validate(valid => {
                if (valid) {
                    this.hasNoSaveChange = true;

                    const {
                        title,
                        cn,
                        en,
                        fullKey,
                        isLastNode
                    } = this.editNodeForm;
                    const node = this.treeMap[fullKey];
                    const cnValue = `${title}${isLastNode ? `——${cn}` : ""}`;
                    const enValue = `${title}${isLastNode ? `——${en}` : ""}`;

                    updateObjVal(
                        node,
                        ["title", "cnValue", "enValue"],
                        [title, cnValue, enValue]
                    );
                    node.isLastNode &&
                        updateObjVal(node.value, ["cn", "en"], [cn, en]);
                    this.$Message.success("编辑节点成功");
                    this.modal.editNode = false;
                    this.editNodeForm = {};
                    // 开发模式时自动保存文件
                    this.isDevelopment && this.debounceFn.saveFile();
                    // 编辑后树渲染完成单击该节点
                    setTimeout(() => {
                        const { cn: cnNode, en: enNode } = this.getTreeNode(
                            fullKey
                        );

                        cnNode.cnValue = cnValue;
                        enNode.enValue = enValue;

                        this.cnTreeObj.updateNode(cnNode);
                        this.enTreeObj.updateNode(enNode);
                        this.handleTreeClick(null, null, node);
                    }, 0);
                }
            });
        },
        /**
         * 展开
         */
        handleTreeExpand(e, tid, tnode, all = false) {
            if (all) {
                this.cnTreeObj.expandAll(true);
                this.enTreeObj.expandAll(true);
            } else {
                const { cn, en } = this.getTreeNode(tnode.fullKey);
                this.cnTreeObj.expandNode(cn, true);
                this.enTreeObj.expandNode(en, true);
            }
        },
        /**
         * 折叠
         */
        handleTreeContract(e, tid, tnode, all = false) {
            if (all) {
                this.cnTreeObj.expandAll(false);
                this.enTreeObj.expandAll(false);
            } else {
                const { cn, en } = this.getTreeNode(tnode.fullKey);
                this.cnTreeObj.expandNode(cn, false);
                this.enTreeObj.expandNode(en, false);
            }
        },
        /**
         * 树节点单击时触发
         */
        handleTreeClick(e, tid, tnode, clickFlag) {
            const { cn, en } = this.getTreeNode(tnode.fullKey);
            this.cnTreeObj.selectNode(cn, null, false);
            this.enTreeObj.selectNode(en, null, false);
            this.currentSelectedNode = tnode;
        },
        /**
         * 节点操作
         */
        handleNodeAction(action) {
            const actionMap = {
                expand: "handleTreeExpand",
                contract: "handleTreeContract",
                add: "handleAddNode",
                edit: "handleEditNode",
                delete: "handleDeleteNode"
            };
            const paramsMap = {
                expand: [null, null, null, true],
                contract: [null, null, null, true]
            };
            this[actionMap[action]](
                ...(paramsMap[action] ? paramsMap[action] : [])
            );
        },
        /**
         * 复制完整引用
         */
        copyFullKey() {
            const el = this.$refs.fullKeyInput.$el.querySelector("input");
            el.select();
            document.execCommand("Copy");
            this.$Message.success("复制成功");
        },
        /**
         * 保存文件
         */
        saveFile(successTip = false) {
            const treeMap = deepClone(this.treeMap);
            delete treeMap["TREE_ROOT"];
            const { cn, en } = splitLang(transferTreeToObj(treeMap));
            const startCommunicate = () => {
                ipc.once(
                    "saveProjectFile",
                    { project: this.project, cn, en },
                    (success, data) => {
                        if (!success || !data) {
                            this.$Message.error("保存文件失败");
                        } else {
                            this.hasNoSaveChange = false;
                            successTip && this.$Message.success("保存文件成功");
                        }
                    }
                );
            };
            startCommunicate();
        },
        /**
         * 保存当前模式
         */
        handleSaveMode(mode) {
            this.mode = mode;
            this.modal.mode = false;
        },
        /**
         * 翻译
         */
        translate(content) {
            if (!content) return;
            ipc.once(
                "translate",
                {
                    translateType: this.translateType,
                    content
                },
                (success, translateResult) => {
                    if (success && translateResult) {
                        this.editNodeForm.en = translateResult.trim();
                        this.$forceUpdate(); // 强制更新视图否则没有刷新？？？
                    } else {
                        this.$Message.error("翻译失败");
                    }
                }
            );
        },
        /**
         * 根据搜索条件过滤树
         */
        filterTree() {
            let filterTreeData = [
                { ...deepClone(this.treeMap.TREE_ROOT), children: [] }
            ];
            if (!this.searchCondition) {
                filterTreeData = this.treeData;
            } else {
                // 循环添加符合条件的节点
                for (const key in this.treeMap) {
                    if (this.treeMap.hasOwnProperty(key)) {
                        const node = this.treeMap[key];
                        // 排除根节点
                        if (!/TREE_ROOT/.test(node.value)) {
                            if (
                                node.title.includes(this.searchCondition) ||
                                (typeof node.value.cn === "string" &&
                                    (node.value.cn.includes(
                                        this.searchCondition
                                    ) ||
                                        node.value.en.includes(
                                            this.searchCondition
                                        )))
                            ) {
                                filterTreeData[0].children.push(node);
                            }
                        }
                    }
                }
            }
            this.filterTreeData = filterTreeData;

            if (this.currentSelectedNode) {
                setTimeout(() => {
                    this.handleTreeClick(null, null, this.currentSelectedNode);
                }, 0);
            }
        },
        /**
         * 返回
         */
        handleBack() {
            if (!this.hasNoSaveChange) {
                this.$emit("update:show", false);
                return;
            }
            this.$Modal.confirm({
                title: "系统提示",
                content: "检测到有未保存的更改，是否保存？",
                onOk: () => {
                    this.saveFile();
                    this.$emit("update:show", false);
                },
                onCancel: () => {
                    this.$emit("update:show", false);
                }
            });
        },
        /**
         * 设置响应式的值
         */
        setReactiveVal(obj, properties = {}) {
            for (const [key, val] of Object.entries(properties)) {
                this.$set(obj, key, val);
            }
        },
        /**
         * 根据属性fullKey获取节点
         */
        getTreeNode(fullKey) {
            return {
                cn: this.cnTreeObj.getNodeByParam("fullKey", fullKey),
                en: this.enTreeObj.getNodeByParam("fullKey", fullKey)
            };
        }
    },
    watch: {
        treeMap: {
            deep: true,
            handler(val) {
                const record = {
                    treeData: this.treeData,
                    treeMap: val
                };
                localStorage.setItem(this.project.id, JSON.stringify(record));
            }
        },
        translateType(val) {
            localStorage.setItem("translateType", val);
        },
        "editNodeForm.cn"(val, oldVal) {
            if (oldVal === undefined) return;
            else this.debounceFn.translate(val);
        }
    },
    mounted() {
        this.init();
    }
};
</script>

<style lang="less">
.mode-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 80%;
    margin: 0 auto;
}
.lang-helper-detail {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
    .mr5 {
        margin-right: 5px !important;
    }
    .detail__actions {
        margin-bottom: 15px;
        &__back {
            float: right;
        }
    }
    .detail__tree {
        height: 100%;
        overflow: hidden;
        .ivu-card-body {
            display: flex !important;
            flex-flow: column nowrap !important;
        }
        &__wrap {
            justify-content: space-between;
            width: 100%;
            height: 100%;
            overflow: hidden;
            margin: 10px auto 0;
            .wrap__item {
                flex-basis: 48% !important;
                height: 100%;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 10px;
                overflow: auto;
                .ivu-tree-title {
                    width: 100% !important;
                }
            }
        }
    }
}
</style>
