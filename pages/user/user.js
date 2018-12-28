// pages/user/user.js
var lists = []
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // user_portrait: app.globalData.userInfo.avatarUrl,
    isShowDialog: false,
    longpress: false,
    have_plan: [],
    uploadTest: 0
  },

  onAddPlanTap: function() {
    // console.log("onAddPlanTap");
    wx.navigateTo({
      url: 'plan/plan',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var userInfo = wx.getStorageSync('userInfo')
    if (userInfo != undefined && userInfo != null) {
      this.setData({
        user_portrait: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
      })
    } else {
      this.setData({
        isShowAuthSetting: true
      })
    }
    this.loadData()
    var whether_template = wx.getStorageSync('whether_template')
    this.setData({
      whether_template: whether_template
    })
  },

  loadData: function(token) {
    var HOST = app.globalData.HOST
    var token = app.globalData.token
    wx.request({
      url: HOST + "/user/my_info.do",
      method: 'POST',
      header: {
        // 'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res)
        if (res.data.status == 200) {
          var data = res.data.data
          if (this.data.user_portrait) {
            this.setData({
              insist_day: data.insist_day,
              learned_word: data.learned_word,
              remaining_words: data.remaining_words,
            })
          } else {
            this.setData({
              insist_day: data.insist_day,
              learned_word: data.learned_word,
              remaining_words: data.remaining_words,
              user_portrait: data.portrait,
              nickName: data.username
            })
          }
        } else {
          if (res.data.status == 400 && res.data.msg == '身份认证错误！') {
            this.getToken()
          }
        }

      },
      fail: (res) => {
        console.log("fail")
        console.log(res)
      }
    })

    wx.request({
      url: HOST + "/user/get_my_plan.do",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res)
        if (res.data.status == 200) {
          var planData = res.data.data
          this.setData({
            have_plan: planData.have_plan,
            selectedPlan: planData.selected_plan,
          })
        } else {
          if (res.data.status == 400 && res.data.msg == '身份认证错误！') {
            this.getToken()
          }
        }
      },
      fail: (res) => {
        console.log("plan failed")
        console.log(res)
      }
    })
  },

  onSwitchChange: function (event) {
    // console.log(event.detail.value)
    var value
    if (event.detail.value == false) {
      value = 0
    } else {
      value = 1
    }
    this.setData({
      whether_template: value
    })
    //提交消息提醒
    let origin = wx.getStorageSync('whether_template')
    if (this.data.whether_template != origin) {
      wx.request({
        url: app.globalData.HOST + '/various/change_template_status.do',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': app.globalData.token
        },
        success: (res) => {
          if (res.data.status == 200) {
            if (origin == 0) {
              origin = 1
            } else {
              origin = 0
            }
            wx.setStorage({
              key: 'whether_template',
              data: origin,
            })
          }
        }
      })
    }
  },

  onSettingTap: function(event) {
    console.log('onsetting')
    wx.navigateTo({
      url: 'setting/setting',
    })
  },

  onEditPlan: function(event) {
    // console.log("onLongPress")
    console.log(event)
    let plan = event.currentTarget.dataset.plan
    let selectedPlan = this.data.selectedPlan
    var alert_type = 0
    var learned_word = event.currentTarget.dataset.learned_word
    if (plan == selectedPlan) {
      //假设选中的计划为正在学习中的计划 提示用户是否重置
      alert_type = 1
    } else {
      //否则提示用户是否删除
      alert_type = 0
    }
    this.setData({
      alert_type: alert_type,
      isShowDialog: true,
      learned_word: learned_word,
      longpress: true,
      tmpSelected: event.currentTarget.id
    })
  },

  onCancelDialog: function(event) {
    this.setData({
      isShowDialog: false,
      longpress: false,
    })
  },

  onConfirmEditDialog: function(event) {
    // var id = event.currentTarget.id
    var alert_type = this.data.alert_type
    var idx = event.currentTarget.dataset.plan
    var plan = this.data.have_plan[idx].plan
    console.log(plan)
    if (alert_type == 1) {
      //执行重置
    } else {
      //执行删除
      var HOST = app.globalData.HOST
      var token = app.globalData.token
      wx.request({
        url: HOST + '/user/delete_plan.do',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': token
        },
        data: {
          plan: plan
        },
        success: (res) => {
          if (res.data.status == 200) {
            let plans = this.data.have_plan
            plans.splice(idx, 1)
            this.setData({
              have_plan: plans,
              isShowDialog: false,
              longpress: false,
            })
          }
        },
        fail: (res) => {
          console.log(res)
        }
      })
    }
    this.setData({
      isShowDialog: false
    })
  },

  onChangePlan: function(event) {
    let plan = event.currentTarget.dataset.plan
    let selectedPlan = this.data.selectedPlan
    var alert_type = 0
    if (plan == selectedPlan) {
      // alert_type = 1
      wx.navigateTo({
        url: '../home/word_list/word_list',
      })
    } else {
      this.setData({
        tmpSelected: event.currentTarget.id,
        alert_type: alert_type,
        isShowDialog: true,
      })
    }
  },

  onConfirmChange: function(event) {
    // console.log(event)
    var idx = event.currentTarget.dataset.plan
    var plan = this.data.have_plan[idx].plan
    var alert_type = this.data.alert_type
    console.log(plan)
    this.setData({
      isShowDialog: false,
      longpress: false,
    })
    if (alert_type == 1) {

    } else {
      //执行更改计划
      var HOST = app.globalData.HOST
      var token = app.globalData.token
      wx.request({
        url: HOST + '/user/decide_selected_plan.do',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': token
        },
        data: {
          plan: plan
        },
        success: (res) => {
          if (res.data.status == 200) {
            wx.showToast({
              title: '请求中',
              icon: 'loading',
              duration: 800
            })
            this.loadData()
            var has_storage = wx.getStorageSync('currentPointer')
            if (has_storage) {
              wx.removeStorageSync('new_list')
              wx.removeStorageSync('old_list')
              wx.removeStorageSync('word_list')
              wx.removeStorageSync('pass_list')
              wx.removeStorageSync('currentPointer')
              wx.removeStorageSync('realPointer')
            }
            var pages = getCurrentPages()
            console.log(pages)
            // var firstPage = pages[0]
            // console.log(firstPage)
            // firstPage.loadData(app.globalData.token)
          }
        },
        fail: (res) => {

        }
      })
    }
  },

  onShowAuthDialog: function(e) {
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null) {
      this.setData({
        isShowAuthSetting: true
      })
    }

  },

  onCloseAuthDialog: function(e) {
    this.setData({
      isShowAuthSetting: false
    })
  },

  getUserInfo: function(event) {
    console.log(event)
    if (event.detail.userInfo) {
      app.globalData.userInfo = event.detail.userInfo
      this.setData({
        user_portrait: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
      })
      wx.setStorageSync('userInfo', event.detail.userInfo)
      this.uploadUserInfo()
      this.onCloseAuthDialog()
      // this.getToken()
    } else {
      // wx.showModal({
      //   title: '授权失败',
      //   content: '未授权会影响进入小程序噢~',
      //   showCancel: false,
      //   confirmText: '重新授权',
      // })
    }
  },

  uploadUserInfo: function() {
    wx.request({
      url: app.globalData.HOST + '/user/wx_upload_portrait_username.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': app.globalData.token
      },
      data: {
        username: this.data.nickName,
        portrait: this.data.user_portrait
      },
      success: (res) => {
        console.log(res)
        if (res.data.status != 200) {
          if (this.data.uploadTest < 2) {
            this.setData({
              uploadTest: this.uploadTest + 1
            })
            this.uploadUserInfo()
          }
        }
      },
      fail: (res) => {

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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadData()
    setTimeout(this.stopRefresh, 500)
  },

  stopRefresh: function() {
    wx.stopPullDownRefresh()
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

  },
  getToken: function() {

    wx.login({
      success: (res) => {
        var code = res.code
        wx.getUserInfo({
          success: (res_user) => {
            // var token = null
            wx.request({
              url: app.globalData.HOST + '/user/wx_login.do',
              data: {
                code: code,
                username: res_user.userInfo.nickName,
                gender: res_user.userInfo.gender,
                portrait: res_user.userInfo.avatarUrl
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                console.log(res.data)
                var token = res.data.data
                // console.log("token = " + token)
                // this.globalData.token = token
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
                this.loadData(token)
              },
              fail: (res) => {
                console.log("request fail")
              }
            })
            // this.globalData.token = token
          },
          fail: () => {
            // var token = null
            wx.request({
              url: app.globalData.HOST + '/user/wx_login.do',
              data: {
                code: code,
                username: null,
                gender: null,
                portrait: null
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                console.log(res.data)
                console.log("test point")
                var token = res.data.data
                // console.log(token)
                // console.log(this)
                // this.globalData.token = token
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
                this.loadData(token)
              },
              fail: (res) => {
                console.log("getUserInfo Fail && request Fail")
              }
            })
            // console.log(token)
            // this.globalData.token = token
          }
        })
      }
    })
  },

  onWalletTap: function(res) {
    this.setData({
      isShowWalletDialog: true
    })
    setTimeout(() => {
      this.setData({
        isShowWalletDialog: false
      })
    }, 1200)
  },

  stopPageScroll: function(e) {

  }
})