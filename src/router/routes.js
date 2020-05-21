import Main from '@/components/Main/index.vue';

export default [{
        path: '/',
        redirect: '/LangHelper',
        alias: 'LangHelper'
    },
    {
        path: '/Main',
        name: 'Main',
        component: Main,
        children: [{
            path: '/LangHelper',
            name: 'LangHelper',
            meta: {
                title: '语言助手'
            },
            component: () => import("@/views/lang-helper/index.vue")
        }, {
            path: '/FilterHelper',
            name: 'FilterHelper',
            meta: {
                title: '筛查助手'
            },
            component: () => import("@/views/filter-helper/index.vue")
        }]
    }
]
