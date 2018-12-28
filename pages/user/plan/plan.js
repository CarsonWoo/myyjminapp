// pages/user/plan/plan.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowChooser: false,
    value: [2, 2],
    plan_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var token = app.globalData.token
    var HOST = app.globalData.HOST
    var typeStr = "type"
    var typeValue = "大学"
    wx.request({
      url: HOST + '/user/get_plans.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        type: typeValue
      },
      success: (res) => {
        console.log(res)
        this.setData({
          plan_list: res.data.data
        })
      },
      fail: (res) => {
        console.log(res)
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

  onShowChooser: function (event) {
    // console.log(event)
    var id = event.currentTarget.id
    var plan = this.data.plan_list[id]
    // console.log(plan)

    //获取多少天后的日期
    var date = this.fun_date(20)

    let plan_days = []
    for (let i = 10; i <= 60; i += 5) {
      let obj = new Object()
      obj.daily_word_number = i
      obj.days = Math.floor(plan.word_number / i)
      plan_days.push(obj)
    }

    this.setData({
      isShowChooser: true,
      days: Math.floor(plan.word_number / 20),
      daily_word_number: 20,
      plan_name: plan.plan,
      finish_date: date,
      plan_days: plan_days
    })
  },

  fun_date: function (afterDays) {
    let curDate = new Date()
    let time1 = curDate.getFullYear() + "年" + (curDate.getMonth() + 1) + "月" + curDate.getDate() + "日"
    let afterDate = new Date(curDate)
    afterDate.setDate(curDate.getDate() + afterDays)
    let time2 = afterDate.getFullYear() + "年" + (afterDate.getMonth() + 1) + "月" + afterDate.getDate() + "日"
    console.log(afterDate)
    return time2
  },

  onChooserChange: function (event) {
    console.log(event)
    // this.setData({
    //   value: value
    // })
    var value = this.data.value
    var tmpValue = event.detail.value

    if (value[0] != tmpValue[0]) {
      value = [tmpValue[0], tmpValue[0]]
    } else {
      value = [tmpValue[1], tmpValue[1]]
      // this.setData({
      //   value: value
      // })
    }

    let day = this.data.plan_days[value[0]].days
    let words = this.data.plan_days[value[1]].daily_word_number

    let finishDate = this.fun_date(day)

    this.setData({
      value: value,
      days: day,
      daily_word_number: words,
      finish_date: finishDate
    })

  },

  onHideChooser: function (event) {
    this.setData({
      isShowChooser: false,
      value: [2, 2]
    })
  },

  onPlanConfirmTap: function (event) {
    var HOST = app.globalData.HOST
    var token = app.globalData.token
    wx.request({
      url: HOST + '/user/decide_plan.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        plan: this.data.plan_name,
        daily_word_number: this.data.daily_word_number,
        days: this.data.days
      },
      success: (res) => {
        if (res.data.status == 200) {
          wx.showToast({
            title: '添加成功',
          })
          var has_storage = wx.getStorageSync('currentPointer')
          if (has_storage) {
            wx.removeStorageSync('new_list')
            wx.removeStorageSync('old_list')
            wx.removeStorageSync('word_list')
            wx.removeStorageSync('pass_list')
            wx.removeStorageSync('currentPointer')
            wx.removeStorageSync('realPointer')
          }
          // var pages = getCurrentPages()
          // var beforePage = pages[pages.length - 2]
          // beforePage.loadData(token)
          this.setData({
            isShowChooser: false,
            value: [2, 2]
          })
          wx.reLaunch({
            url: '../../home/home?action=' + 'onStartTap',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
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