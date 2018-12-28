// pages/home/prize/prize.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    onRefresh: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var level = parseInt(options.level)
    var flag = parseInt(options.flag)
    this.setData({
      level: level,
      flag: flag
    })
    this.loadData()
  },

  loadData: function() {
    var HOST = app.globalData.HOST
    var token = app.globalData.token
    wx.request({
      url: HOST + '/various/lottery_draw_description.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        if (res.data.status == 200) {
          console.log(res)
          var data = res.data.data
          this.calculate(data.end_time)
          this.setData({
            prize: data.prize,
            prize_pic: data.prize_pic,
            prize_tomorrow: data.prize_tomorrow,
            prize_tomorrow_pic: data.prize_tomorrow_pic,
            end_time: data.end_time
          })
        }
      },
      fail: (res) => {

      }
    })
  },

  calculate: function(time) {
    setInterval(() => {
      if (this.data.onRefresh) {

        var date1 = new Date() //开始时间
        var date3 = time - date1.getTime()
        // console.log(date3)

        if (date3 >= 0) {
          //计算出小时数
          var hourLeft = date3 % (24 * 3600 * 1000)
          var hours = Math.floor(hourLeft / (3600 * 1000))

          //计算出分钟数
          var minuteLeft = hourLeft % (3600 * 1000)
          var minutes = Math.floor(minuteLeft / (60 * 1000))

          //计算出秒数
          var secondLeft = minuteLeft % (60 * 1000)
          var seconds = Math.floor(secondLeft / 1000)

          this.setData({
            hours: hours,
            minutes: minutes,
            seconds: seconds
          })
        }
      }
    }, 1000)

  },

  onJoinEvent: function(event) {
    this.setData({
      requestToEvent: true
    })
    wx.navigateBack({
      // delta: 1
    })
  },

  onRuleTap: function(event) {
    this.setData({
      isShowDialog: true,
    })
  },

  onCloseDialog: function(event) {
    this.setData({
      isShowDialog: false,
    })
  },

  onPostChance: function (event) {
    // console.log(event.detail.formId)
    let form_id = event.detail.formId
    var token = app.globalData.token
    var HOST = app.globalData.HOST
    wx.request({
      url: HOST + '/various/collect_form_id.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        form_id: form_id
      },
      success: (res) => {
        if (res.data.status == 200) {
          console.log("success")
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.setData({
      onRefresh: false
    })
    if (this.data.requestToEvent) {
      var pages = getCurrentPages()
      var beforePage = pages[0]
      // console.log(pages)
      if (this.data.flag == 1) {
        if (this.data.level == 0) {
          beforePage.onStartTap()
        } else if (this.data.level == 1) {
          beforePage.onShareAppMessage()
        } 
      } else {
        beforePage.onPlanTap()
      }
    }
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})