// pages/user/setting/setting.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onStarTap: function (event) {
    var id = event.currentTarget.id
    this.setData({
      select: id
    })
  },

  onSubmitTap: function(event) {
    var area = this.data.text_area_text
    var input = this.data.input_text
    if (area == undefined || area.length == 0 || this.data.select == undefined) {
      wx.showModal({
        title: '提示',
        content: '请先填写完整资料噢',
        showCancel: false
      })
    } else {
      // console.log(area)
      // console.log(input)

      var token = app.globalData.token
      var HOST = app.globalData.HOST


      wx.request({
        url: HOST + '/various/advice.do',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': token
        },
        data: {
          advice: area,
          level: this.data.select
        },
        success: (res) => {
          if (res.data.status == 200) {
            wx.showToast({
              title: '提交成功',
              duration: 800,
              complete: (res) => {
                setTimeout(() => {
                  wx.navigateBack({

                  })
                }, 800)
              }
            })
          } else {
            //传不成功
            wx.showToast({
              title: '提交成功',
              duration: 800,
              complete: (res) => {
                setTimeout(() => {
                  wx.navigateBack({
                    
                  })
                }, 800)
              }
            })
          }
        }
      })
    }
  },


  AreaInputListener: function(event) {
    this.setData({
      text_area_text: event.detail.value
    })
  },

  InputListener: function(event) {
    this.setData({
      input_text: event.detail.value
    })
  },

  onFocusArea: function(event) {
    this.setData({
      focus_area: true
    })
  },

  onFocusInput: function(event) {
    this.setData({
      focus_input: true
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