// pages/index/zx/search.js
const listData = require('../../static/data.js');
const exPageNum = 2;
Page({
  data: {
    current: 0,
    size: 10,
    topHeight: 0,
    bottomHeight: 0,
    pageList: [
      // {
      //   data: [],//数据
      //   visible: false,// 当前是否显示
      //   top: 0, // 顶部在scroll里的高度
      //   height: 0, // 高度
      //   bottom:0, // 底部在scroll里的高度
      // }
    ],
  },
  onLoad() {
    /**
     * 1、找到列表外层的scroll-view并计算高度
     * 2、拿到数据之后计算每一页的高度、顶部的scroll距离、底部的scroll距离
     * 3、滚动时手指上滑如果当前页面可见，且往下两个页面也加载出来时(判定此时页面在向后的第一或第二页面，此时隐藏当前页面)
     *      计算列表向上滚动的总距离，用topHeight表示(累加下划时页面向上滚动后被隐藏页对应高度)
     *      如果滚动出现的页面是被隐藏的，则bottomHeight累减出现的页面对应高度（非下拉加载）
     * 4、滚动时手指下滑如果当前页面可见，且往上两个页面也加载出来时(判定此时页面在向前的第一或第二页面，此时隐藏当前页面)
     *      计算列表向下滚动的总距离，用bottomHeight表示(累加上划时页面向下滚动后被隐藏页对应高度)
     *      如果滚动出现的页面是被隐藏的，则topHeight累减出现的页面对应高度（非上拉加载）
     */
    this.getSearch();
    const query = wx.createSelectorQuery();
    query
      .select('#screenSee')
      .boundingClientRect()
      .exec(res => {
        //找到页面的scroll-view并计算高度
        this.scrollH = res[0].height;
      });
  },
  // 滚动
  bindscroll(e) {
    console.log(e.detail.scrollTop, e.detail.deltaY);
    for (let index = 0; index < this.data.pageList.length; index++) {
      const item = this.data.pageList[index];
      if (
        e.detail.deltaY < 0 && //偏移量
        e.detail.scrollTop > item.bottom &&
        this.data.pageList[index].visible &&
        this.data.pageList[index + exPageNum]
      ) {
        console.log('已加载的滚动，且大于一屏，顶部需要空白填充');
        // 手指上滑向下滚 且 数据已加载
        this.data.pageList[index].visible = false; // +2页存在时，第一页不需要被渲染
        this.data.topHeight = this.data.topHeight + item.height; //计算总的需要被隐藏的上部分
        if (!this.data.pageList[index + exPageNum].visible) {
          // 手指上滑，且上滑的数据是已加载但未显示的此时让其显示
          this.data.pageList[index + exPageNum].visible = true;
          //计算剩余需要被隐藏的底部
          this.data.bottomHeight =
            this.data.bottomHeight -
            this.data.pageList[index + exPageNum].height;
        }
        this.setData({
          pageList: this.data.pageList,
          topHeight: this.data.topHeight,
          bottomHeight: this.data.bottomHeight,
        });
        break;
      }
      // 手指下滑
      if (
        e.detail.deltaY > 0 &&
        item.top > e.detail.scrollTop + this.scrollH &&
        this.data.pageList[index].visible &&
        this.data.pageList[index - exPageNum]
      ) {
        // 隐藏头部
        this.data.pageList[index].visible = false;
        this.data.bottomHeight += item.height;
        if (!this.data.pageList[index - exPageNum].visible) {
          // 显示底部
          this.data.pageList[index - exPageNum].visible = true;
          this.data.topHeight =
            this.data.topHeight - this.data.pageList[index - exPageNum].height;
        }
        this.setData({
          pageList: this.data.pageList,
          topHeight: this.data.topHeight,
          bottomHeight: this.data.bottomHeight,
        });
        break;
      }
    }
  },
  // 搜索
  getSearch() {
    this.data.pageList.push({
      data: +new Date() % 2 ? listData.slice(0, 3) : listData, //数据
      visible: true, // 当前是否显示
      top: 0, // 顶部在scroll里的高度
      height: this.data.virtualHeight || 0, // 高度
      bottom: this.data.virtualHeight || 0, // 底部在scroll里的高度
    });
    this.setData(
      {
        pageList: this.data.pageList,
      },
      () => this.initPageHeight()
    );
  },
  // 初始化首页高度
  initPageHeight() {
    let cur = this.data.current;
    console.log('页数:' + cur);
    const query = wx.createSelectorQuery();
    query
      .select(`#listPageId${cur}`)
      .boundingClientRect()
      .exec(res => {
        let pageList = this.data.pageList;
        if (cur > 0) {
          pageList[cur].top = pageList[cur - 1].bottom + 1;
          pageList[cur].bottom = pageList[cur - 1].bottom + 1 + res[0].height;
        } else {
          pageList[cur].top = 0;
          pageList[cur].bottom = res[0].height;
        }
        pageList[cur].height = res[0].height;
        // 顶部在scroll里的高度
        this.data.current++;
        this.setData({ pageList });
      });
  },
});
