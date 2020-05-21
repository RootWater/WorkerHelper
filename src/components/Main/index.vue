<!--
 * @Date: 2020-05-14 11:54:52
 * @LastEditors: Murray
 * @LastEditTime: 2020-05-14 13:44:07
 * @FilePath: \worker-helper\src\components\Main\index.vue
-->
<template>
    <Layout class="app-main">
        <!-- 头部 -->
        <Header class="app-main__header">
            <!-- 导航菜单 -->
            <Menu class="app-main__header__menu"
                  mode="horizontal"
                  theme="dark"
                  :active-name="activeMenu"
                  @on-select="handleMenuSelect">
                <MenuItem v-for="(menu) in menuList"
                          :key="menu.path"
                          :name="menu.path">
                <Icon v-if="menu.icon"
                      :type="menu.icon"></Icon>{{menu.text}}
                </MenuItem>
            </Menu>
            <!-- 操作区 -->
            <div class="app-main__header__actions">
                <template v-for="(btn) in actionButtons">
                    <Button v-if="!btn.check || activeState === btn.check"
                            :key="btn.name"
                            :type="btn.type"
                            @click="handleButtonClick(btn.action)">
                        <Icon :type="btn.icon"></Icon>
                    </Button>
                </template>
            </div>
        </Header>
        <!-- 内容 -->
        <Content class="app-main__content">
            <Card class="app-main__content__card"
                  :dis-hover="true">
                <template v-if="noCache">
                    <router-view></router-view>
                </template>
                <template v-else>
                    <keep-alive>
                        <router-view :key="$router.path"></router-view>
                    </keep-alive>
                </template>
            </Card>
        </Content>
    </Layout>
</template>

<script>
import index from "./index";

export default {
    name: "Main",
    mixins: [index]
};
</script>

<style lang="less">
.app-main {
    position: relative;
    height: 100%;
    overflow: hidden;
    &__header {
        -webkit-app-region: drag;
        &__menu {
            -webkit-app-region: no-drag;
            float: left;
        }
        &__actions {
            -webkit-app-region: no-drag;
            float: right;
            .ivu-btn-text {
                color: #fff;
                &:last-child:hover {
                    color: #fff;
                    background-color: tomato;
                }
            }
        }
    }
    &__content {
        padding: 10px 20px;
        overflow: hidden;
        &__card {
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            .ivu-card-body {
                height: 100%;
            }
        }
    }
}
</style>
