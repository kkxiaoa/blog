module.exports = {
  title: "KKXiao的blog",
  description: "热爱前端，拥抱开源，不止前端",
  // base: '/',
  plugins: {
    "@vuepress/back-to-top": {},
    seo: {
      /* options */
    },
  },
  themeConfig: {
    sidebarDepth: 2,
    lastUpdated: "Last Updated",
    nav: [
      { text: "文章目录", link: "/article/" },
      { text: "算法与数据结构", link: "/article/1" },
      { text: "设计模式", link: "/article/2" },
      { text: "github", link: "https://github.com/kkxiaoa" },
    ],
    sidebar: {
      "/article/": [
        "/article/",
        {
          title: "JS进阶",
          children: [
            "/article/JS进阶/浅谈js对象",
            "/article/JS进阶/浅谈js深拷贝",
            "/article/JS进阶/浅谈js继承",
            "/article/JS进阶/浅谈js之this",
          ],
        },
        {
          title: "Vue深入浅出",
          children: [],
        },
      ],
    },
  },
};
