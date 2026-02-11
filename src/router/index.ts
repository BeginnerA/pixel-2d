import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'meta2d',
            component: () => import('../views/meta2d.vue')
        },
        {
            path: '/test',
            name: '/test',
            component: () => import('../views/Test.vue')
        }
    ]
})

export default router