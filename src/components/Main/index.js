import {
    menuList
} from '@/libs/utils';

const {
    remote
} = require('electron'); // 获取app远程对象

export default {
    data() {
        return {
            menuList, // 菜单
            actionButtons: [{
                    "name": "minimize",
                    "type": "text",
                    "icon": "md-remove",
                    "action": "minimize"
                },
                {
                    "name": "unmaximize",
                    "type": "text",
                    "icon": "md-contract",
                    "action": "unmaximize",
                    "check": "maximize"
                },
                {
                    "name": "maximize",
                    "type": "text",
                    "icon": "md-expand",
                    "action": "maximize",
                    "check": "unmaximize"
                },
                {
                    "name": "close",
                    "type": "text",
                    "icon": "md-close",
                    "action": "close"
                }
            ], // 操作按钮
            activeMenu: '/LangHelper', // 激活的菜单
            activeState: 'unmaximize' // 激活的窗口状态
        }
    },
    computed: {
        /**
         * 不缓存路由
         */
        noCache() {
            return this.$route.meta && this.$route.meta.noCache;
        }
    },
    methods: {
        /**
         * 菜单选中时
         * @param {*} menu 选中的菜单name
         */
        handleMenuSelect(menu) {
            this.$router.push(menu);
        },
        /**
         * 按钮单击时进行操作
         * @param {*} action 操作
         */
        handleButtonClick(action) {
            this.activeState = action;
            remote.getCurrentWindow()[action]();
        }
    },
    watch: {
        '$route'(val) {
            this.activeMenu = val.path;
        }
    }
}
