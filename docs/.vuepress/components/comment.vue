<template>
  <div id="gitalk-container"></div>
</template>
<script>
import 'gitalk/dist/gitalk.css'
import Gitalk from 'gitalk'

export default {
  name: 'comment',
  mounted() {
    const gitalk = new Gitalk({
      clientID: 'a8986a4402ee81be23c6',
      clientSecret: 'c550c309f874a5d7d4ab2f5d67dd7e596dcf295f',
      repo: 'blog',
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
