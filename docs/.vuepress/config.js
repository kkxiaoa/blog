module.exports = {
    title: 'KKXiao的blog',
    description: '热爱前端，拥抱开源，不止前端',
    // base: '/',
    plugins: ['@vuepress/back-to-top'],
    themeConfig: {
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
        nav: [
            { text: '文章目录', link: '/article/' },
            { text: 'github', link: 'https://github.com/kkxiaoa' },
        ],
        sidebar: {
            '/article/': [
                '/article/',
                {
                    title: 'JS进阶',
                    children: [
                        '/article/JS进阶/浅谈js对象',
                        '/article/JS进阶/浅谈js深拷贝',
                        '/article/JS进阶/浅谈js继承',
                    ]
                },
                {
                    title: 'Vue深入浅出',
                    children: [
                    ]
                }
            ]
        }
    },
    
};

