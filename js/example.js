$(document).ready(function(){
  var admin = true;
  var data = {
    topic: {
      weight: 20,
      number: 10
    },
    course: {
      weight: 20,
      items: [
        {
          id: 1,
          name: '<a>英语四六级阅读理解</a>',
          weight: 50
        },
        {
          id: 2,
          name: '哥德巴赫大猜想',
          weight: 50
        }
      ]
    },
    exam: {
      weight: 60,
      items: [
        {
          id: 1,
          name: '计算机二级考试',
          weight: 50
        },
        {
          id: 2,
          name: '三年高考模拟考试',
          weight: 50
        }
      ]
    }
  }

  // 注册过滤器：html转义
  // vuejs默认已经帮忙转义，故无需处理，此处仅作学习使用
  Vue.filter('safe', function (value) {
    return value
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('\"', '&quot;')
            .replace('\'', '&#x27;')
            .replace('\/', '&*x2F;')
  });

  Vue.transition('stagger', {
    stagger: function (index) {
      // 每个过渡项目增加 50ms 延时
      // 但是最大延时限制为 300ms
      return Math.min(300, index * 50)
    }
  })

  // 话题设置组件
  Vue.component('topiccomponent', {
    props: ['number'],
    template: '\
      <div class="items">\
        <p class="li2">在课群话题讨论区回帖数大于或等于<input type="text" v-model="number" value={{number}} number>条，方可计入成绩。</p>\
      </div>\
    ',
    watch: {
      number: function(n, o){
        if(isNaN(parseInt(n))){
          alert('请输入0-100之间的正整数！');
          this.number = 1;  // 默认设置1条
          return;
        }
        Vue.set(data.topic, 'number', n);
      }
    }
  });

  // 话题设置组件
  Vue.component('documentcomponent', {
    props: ['number'],
    template: '\
      <div class="items">\
        <p class="li2">课群学习资料区浏览期初大于或等于<input type="text" v-model="number" value={{number}} number>次，方可计入成绩。</p>\
      </div>\
    ',
    watch: {
      number: function(n, o){
        if(isNaN(parseInt(n))){
          alert('请输入0-100之间的正整数！');
          this.number = 1;  // 默认设置1条
          return;
        }
        Vue.set(data.document, 'number', n);
      }
    }
  });

  // 标题组件
  Vue.component('tcomponent', {
    props: ['weight'],
    data: function () {
      return { admin: admin }
    },
    template: ' \
      <div class="title"> \
        <span class="icon"></span> \
        <p>模块的分支权重\
        <input type="text" placeholder="请输入" v-model="weight" value={{weight}} number v-if=admin>\
        <input type="text" placeholder="请输入" v-model="weight" value={{weight}} number readonly v-else>\
        %</p> \
        <span class="add" @click="add()" v-show="admin">+</span> \
      </div> \
    ',
    methods: {
      add: function(){
        this.$dispatch('add'); //触发父组件add方法
      }
    },
    watch: {
      weight: function(n, o){
        // 普通对象因ES5特性而不能响应
        // 故此使用Vue.set(obj, key, value)方式更新对象
        // 参考https://vuejs.org.cn/guide/reactivity.html#初始化数据
        var keys = Object.keys(data);
        var key = this.$parent.$el.id;
        if(isNaN(parseInt(n))){
          alert('请输入0-100之间的正整数！');
          Vue.set(data[key], 'weight', 0);
          return;
        }
        Vue.set(data[key], 'weight', n);
        var index = keys.indexOf(key);
        var length = keys.length;
        var w = 0;
        if(index+1<length){
          var nextKey = keys[index+1];
        }else{
          var nextKey = keys[0];
        }
        for(k in data){
          if(k!==nextKey){
            w += data[k].weight || 0;
          }
        }
        if(w>100){
          alert('请确认权重之和为100%！');
          Vue.set(data[key], 'weight', 0);
          return;
        }
        Vue.set(data[nextKey], 'weight', 100-w);
      }
    }
  });

  // 列表组件
  Vue.component('icomponent', {
    props: ['item', 'index'],
    data: function () {
      return { admin: admin }
    },
    template: '\
      <div class="items">\
        <p class="li1">课程{{index + 1}}：{{item.name}}</p>\
        <p class="li2">权重为\
        <input type="text" v-model="item.weight" value={{item.weight}} number v-if=admin>\
        <input type="text" v-model="item.weight" value={{item.weight}} number v-else readonly>\
        %</p>\
        <span class="del" @click="remove(index)" v-show="admin">-</span>\
      </div>\
    ',
    methods: {
      remove: function(index){
        this.$parent.items.splice(index, 1); // 移除该列表
        if(this.$parent.items.length > 0)
          this.$parent.items[0].weight += this.item.weight;
        else
          this.$parent.weight = 0;
      }
    },
    watch: {
      'item.weight': function(n, o){
        var w = 0;
        if(isNaN(parseInt(n))){
          alert('请输入0-100之间的正整数！');
          this.item.weight = 0;
          return;
        }
        if(this.index+1===length) return;
        var nIndex;
        var length = this.$parent.items.length;
        if(this.index+1 < length)
          nIndex = this.index + 1;
        else
          nIndex = 0;

        for(var i=0; i<length; i++){
          if(nIndex!==i)
            w += this.$parent.items[i].weight;
        }
        if(w>100){
          alert('请确认权重之和为100%！');
          this.item.weight = 0;
          return;
        }
        this.$parent.items[nIndex].weight = (100-w);
      }
    }
  });

  // 新增条目弹窗
  var addDialog = function(module){
    // TODO：body内容ajax获取服务器内容
    var body = '\
      <p style="text-align:center;">请选择您要增加到课群成绩统计的课程：</p>\
      <ol>\
        <li>\
          <input type="checkbox">\
          <p id="1" class="item" data-name="计算机等级考试">课程1：计算机等级考试</p>\
        </li>\
        <li>\
          <input type="checkbox">\
          <p id="2" class="item" data-name="计算机等级考试">课程1：计算机等级考试</p>\
        </li>\
      </ol>\
    ';
    return (new jDialog()).show({
      title: '提示',
      width: 650,
      body: body,
      buttons: jDialog.BUTTON_OK_CANCEL
    }, function(result){
      if(result==='ok'){
        var items = $('.item');
        items.map(function(i){
          var _s = $(items[i]);
          if(_s.prev().is(':checked'))
            data[module].items.push({
              id: _s.attr('id'),
              name: _s.attr('data-name'),
              weight: 0
            })
        })
      }
    });
  };

  var topicVue = new Vue({
    el: '#topic',
    data: data.topic,
    methods: {
      check: function(event){
        console.log(this, event);
      }
    }
  });

  /*作业组件*/
  var courseVue = new Vue({
    el: '#course',
    data: data.course,
    events: {
      add: function () {
        // 接受子组件add方法信号，事件回调内的 `this` 自动绑定到注册它的实例上
        addDialog('course');
      }
    }
  });
  // 监听值输入
  /*c.$watch('items', function(val, oldVal){
    console.log(this);
    //console.log(val, oldVal);
  }, {
    deep: true,
    immediate: false
  })*/

  var examVue = new Vue({
    el: '#exam',
    data: data.exam,
    events: {
      add: function () {
        addDialog('exam');
      }
    }
  });
  var homeworkVue = new Vue({
    el: '#homework',
    data: data.homework,
    events: {
      add: function () {
        addDialog('homework');
      }
    }
  });
  var cepingVue = new Vue({
    el: '#ceping',
    data: data.ceping,
    events: {
      add: function () {
        addDialog('ceping');
      }
    }
  });
  var documentVue = new Vue({
    el: '#document',
    data: data.document
  });
})
