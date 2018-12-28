// pages/home/word/word_detail/edit_note/edit_note.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLength: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var word_id = options.word_id
    var word = options.word
    var word_symbol = options.word_symbol
    this.setData({
      word_id: word_id,
      word: word,
      word_symbol: word_symbol
    })
    wx.request({
      url: app.globalData.HOST + '/home/show_word_note.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': app.globalData.token
      },
      data: {
        word_id: word_id
      },
      success: (res) => {
        if (res.data.status == 200) {
          let value = res.data.data
          if (value == '暂时未添加笔记!') {
            value = ''
          }
          this.setData({
            value: value
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  onEditChange: function(event) {
    // console.log(event)
    this.setData({
      value: event.detail.value,
      currentLength: event.detail.value.length
    })
  },

  onSubmitTap: function(event) {
    var url = app.globalData.HOST + "/home/upload_word_note.do"
    var token = app.globalData.token
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'content-type': "application/x-www-form-urlencoded",
        'token': token
      },
      data: {
        word_id: this.data.word_id,
        word_note: this.data.value
      },
      success: (res) => {
        var pages = getCurrentPages()
        var beforePage = pages[pages.length - 2]
        beforePage.loadState(app.globalData.HOST, app.globalData.token)
        wx.showToast({
          title: '提交成功',
          duration: 800
        })
        setTimeout(()=>{
          wx.navigateBack({
          })
        }, 1100)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})