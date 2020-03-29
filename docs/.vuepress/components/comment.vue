<template>
  <div id="gitalk-container"></div>
</template>
<script>
import 'gitalk/dist/gitalk.css'
import Gitalk from 'gitalk'
export default {
  name: 'comment',
  mounted() {
    // let body = document.querySelector('.gitalk-container');
    // let script = document.createElement('script');
    // script.src = "https://unpkg.com/gitalk/dist/gitalk.min.js";
    // body.appendChild(script);
    // script.onload = () => {
    //   const commentConfig = {
    //     clientID: '5fd383acb0ffd7ba0c83',
    //     clientSecret: '54631ac3c8c1a662bc4610ab3aec9608dd33c55b',
    //     repo: 'vuepress-start',
    //     owner: 'kkxiaoa',
    //     // 这里接受一个数组，可以添加多个管理员，可以是你自己
    //     admin: ['kkxiaoa'],
    //     // id 用于当前页面的唯一标识，一般来讲 pathname 足够了，
    //     // 但是如果你的 pathname 超过 50 个字符，GitHub 将不会成功创建 issue，此情况可以考虑给每个页面生成 hash 值的方法.
    //     id: decodeURI('{{ page.url }}'),
    //     distractionFreeMode: false,
    //     language: true
    //   };
    //   const gitalk = new Gitalk(commentConfig);
    //   gitalk.render('gitalk-container');
    // };
    const gitalk = new Gitalk({
      clientID: '5fd383acb0ffd7ba0c83',
      clientSecret: '54631ac3c8c1a662bc4610ab3aec9608dd33c55b',
      repo: 'vuepress-start',
      owner: 'kkxiaoa',
      admin: ['kkxiaoa'],
      id: decodeURI(location.pathname).slice(-50),      // Ensure uniqueness and length less than 50
      distractionFreeMode: false,  // Facebook-like distraction free mode
      language: 'zh-CN'
    })

    gitalk.render('gitalk-container')
  },
};
</script>
