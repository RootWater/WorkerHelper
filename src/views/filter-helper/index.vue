<template>
    <div class="filter-helper">
        <Card class="filter-helper__actions">
            <!-- 操作区 -->
            <Row :gutter="20">
                <i-col span="10">
                    <Input v-model.trim="filePath"
                           icon="md-folder"
                           placeholder="需要筛查的语言文件"
                           readonly
                           spellcheck
                           @on-click="selectPath('file')" />
                </i-col>
                <i-col span="10">
                    <Input v-model.trim="folderPath"
                           icon="md-folder"
                           placeholder="需要被筛查的目录"
                           readonly
                           spellcheck
                           @on-click="selectPath('folder')" />
                </i-col>
                <i-col span="4">
                    <Button type="primary"
                            long
                            @click="handleStartFilter">开始筛查</Button>
                </i-col>
            </Row>
            <!-- 表格条件 -->
            <Row v-show="filterTable.originalData.length"
                 style="margin-top: 15px;"
                 :gutter="20">
                <i-col span="6">
                    <label>标识</label>
                    <Input v-model.trim="search.title"
                           placeholder="请输入标识" />
                </i-col>
                <i-col span="6">
                    <label>内容</label>
                    <Input v-model.trim="search.value"
                           placeholder="请输入内容" />
                </i-col>
                <i-col span="6">
                    <label>完整引用</label>
                    <Input v-model.trim="search.fullKey"
                           placeholder="请输入完整引用" />
                </i-col>
                <i-col span="6">
                    <label>引用状态</label>
                    <Select v-model="search.state"
                            style="width: 100%;"
                            placeholder="请选择引用状态">
                        <Option value="true">已引用</Option>
                        <Option value="false">未引用</Option>
                    </Select>
                </i-col>
            </Row>
        </Card>
        <!-- 筛查表区 -->
        <Card class="filter-helper__table"
              :dis-hover="true">
            <div class="table-main">
                <!-- 表格头部 -->
                <div class="table-header">
                    <h3>筛选表</h3>
                    <Dropdown @on-click="handleDelProperty">
                        <Button type="error"
                                icon="md-trash">
                            删除
                            <Icon type="ios-arrow-down"></Icon>
                        </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem name="selection">已选择</DropdownItem>
                            <DropdownItem name="current">当前页</DropdownItem>
                            <DropdownItem name="all">全部</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <!-- 表格 -->
                <Table ref="filterTable"
                       class="table-body user-select"
                       max-height="600"
                       border
                       highlight-row
                       :loading="filterTable.loading"
                       :columns="filterTable.columnList"
                       :data="filterTable.data"
                       @on-selection-change="(selection) => { filterTable.selection = selection; }"></Table>
                <!-- 分页 -->
                <div class="table-page">
                    <Page show-total
                          show-elevator
                          show-sizer
                          transfer
                          :total="filterTable.total"
                          :current.sync="filterTable.pageNumber"
                          :page-size="filterTable.pageSize"
                          @on-change="changePage($event, 'pageNumber')"
                          @on-page-size-change="changePage($event, 'pageSize')"></Page>
                </div>
            </div>
        </Card>
        <!-- 遮罩层 -->
        <div v-if="modal.showMask"
             class="mask">
            <!-- 进度环 -->
            <i-circle :size="300"
                      :trail-width="4"
                      :stroke-width="5"
                      :percent="modalParams.showMask.percent"
                      :stroke-color="isFilterDone ? '#5cb85c' : '#43a3fb'"
                      stroke-linecap="square">
                <Icon v-if="isFilterDone"
                      type="ios-checkmark"
                      size="200"
                      style="color:#5cb85c"></Icon>
                <div v-else
                     class="mask-circle-custom">
                    <h1>{{modalParams.showMask.percent}} %</h1>
                    <p>{{modalParams.showMask.path}}</p>
                </div>
            </i-circle>
        </div>
    </div>
</template>

<script>
import index from "./index.js";

export default {
    name: "FilterHelper",
    mixins: [index]
};
</script>

<style lang="less">
.filter-helper {
    position: relative;
    height: 100%;
    .mask {
        position: absolute;
        z-index: 999;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(250, 250, 250, 0.6);
        .ivu-chart-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &-circle-custom {
            & h1 {
                color: #3f414d;
                font-size: 28px;
                font-weight: normal;
            }
            & p {
                width: 80%;
                word-wrap: break-word;
                color: #ccc;
                font-size: 14px;
                margin: 15px auto 0;
            }
        }
    }
    &__table {
        margin-top: 15px;
        .table-main {
            position: relative;
            .table-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                height: 40px;
            }
            .table-page {
                width: 100%;
                height: 40px;
                line-height: 40px;
                text-align: right;
            }
        }
    }
}
</style>
