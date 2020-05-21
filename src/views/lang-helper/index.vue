<template>
    <div class="lang-helper">
        <!-- 详情组件 -->
        <detail v-if="modal.showDetail"
                :show.sync="modal.showDetail"
                :project="modalParams.showDetail"></detail>
        <!-- 项目列表 -->
        <Row v-else
             class="list"
             type="flex">
            <template v-for="(project, index) in projectList">
                <!-- 项目列表 -->
                <i-col class="item"
                       span="4"
                       :key="project.id">
                    <Card class="item__card"
                          @mouseenter.native="() => { showMaskId = project.id; }"
                          @mouseleave.native="() => { showMaskId = ''; }"
                          @click.native="openDetail(project)">
                        <!-- 项目头像 -->
                        <Avatar style="background: #5cadff;"
                                icon="ios-person"
                                size="100" />
                        <p class="item__name">{{project.name}}</p>
                        <!-- 项目操作 -->
                        <div class="item__mask"
                             :style="{transform: `translateY(${showMaskId === project.id ? 0 : 100}%)`}"
                             @click.stop>
                            <icon type="md-create"
                                  size="25"
                                  color="#2db7f5"
                                  @click.native="editProject(project, index)"></icon>
                            <icon type="md-trash"
                                  size="25"
                                  color="#ed4014"
                                  @click.native="delProject(project, index)"></icon>
                        </div>
                    </Card>
                </i-col>
            </template>
            <!-- 添加项目 -->
            <i-col class="item"
                   span="4">
                <Card class="item__card"
                      @click.native="editProject()">
                    <Avatar icon="md-add-circle"
                            size="100" />
                    <p class="item__name">添加项目</p>
                </Card>
            </i-col>
        </Row>
        <Modal v-model="modal.editProject"
               width="500px"
               :title="editProjectTitle"
               :mask-closable="false">
            <Form ref="editProject"
                  style="width: 80%; margin: 0 auto;"
                  :model="projectForm"
                  :rules="projectRules">
                <FormItem prop="name">
                    <Input v-model.trim="projectForm.name"
                           placeholder="请填写项目名称"
                           clearable
                           spellcheck />
                </FormItem>
                <FormItem prop="cnPath">
                    <Input v-model.trim="projectForm.cnPath"
                           icon="md-folder"
                           placeholder="请选择项目中文语言文件路径"
                           readonly
                           spellcheck
                           @on-click="selectFile('cn')" />
                </FormItem>
                <FormItem prop="enPath">
                    <Input v-model.trim="projectForm.enPath"
                           icon="md-folder"
                           placeholder="请选择项目英文语言文件路径"
                           readonly
                           spellcheck
                           @on-click="selectFile('en')" />
                </FormItem>
            </Form>
            <template slot="footer">
                <Button @click="() => { modal.editProject = false; }">取消</Button>
                <Button type="primary"
                        @click="confirmEditProject">确定</Button>
            </template>
        </Modal>
    </div>
</template>

<script>
import index from "./index";
import Detail from "./components/detail";

export default {
    name: "LangHelper",
    mixins: [index],
    components: { Detail }
};
</script>

<style lang="less">
.lang-helper {
    height: 100%;
    .list {
        .item {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
            &__card {
                background-color: #eaf0ff;
                .ivu-card-body {
                    position: relative;
                    overflow: hidden;
                }
            }
            &__name {
                margin-top: 10px;
                font-weight: 800;
                text-align: center;
                color: #000;
            }
            &__mask {
                position: absolute;
                left: 0;
                bottom: 0;
                display: flex;
                width: 100%;
                height: 50px;
                padding: 0 20px;
                border-radius: 10px 10px 0 0;
                justify-content: space-around;
                align-items: center;
                background: rgba(10, 10, 10, 0.6);
                transition: all 0.5s;
                transform: translateY(100%);
            }
        }
    }
}
</style>
