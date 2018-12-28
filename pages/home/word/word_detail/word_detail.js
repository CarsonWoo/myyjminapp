// pages/home/word/word_detail/word_detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    note: false,
    isShowDialog: false,
    show_choice: false,
    edit_choice: '英文释义',
    edit_choices: ['英文释义', '中文释义', '语境句子', '其它例句', '其它'],
    isShowVideo: false,
    meaningList: [],
    isPassClick: false,
    video_info: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wrongCount = options.wrongCount
    var word_id = options.word_id
    this.setData({
      wrongCount: wrongCount,
      word_id: word_id,
    })

    this.loadData(word_id)
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
                wx.setStorageSync('token', token)
                app.globalData.token = token
                this.loadData(this.data.word_id)
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
                wx.setStorageSync('token', token)
                app.globalData.token = token
                this.loadData(this.data.word_id)
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

  loadData: function(word_id) {
    var HOST = app.globalData.HOST
    var token = app.globalData.token
    wx.request({
      url: HOST + '/home/word_card.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        word_id: word_id
      },
      success: (res) => {
        // console.log(res.data)
        if (res.data.status == 200) {
          var data = res.data.data
          var meaning_list = data.meaning.trim().split("；")
          var list = []
          var j = 0
          var reg = "^[a-zA-Z]+$"
          for (let s in meaning_list) {
            var start = meaning_list[s].trim().substring(0, 1)
            let b = meaning_list[s].trim().startsWith("a") || meaning_list[s].trim().startsWith("n") || meaning_list[s].trim().startsWith("p") || meaning_list[s].trim().startsWith("v") || meaning_list[s].trim().startsWith("c") || meaning_list[s].trim().startsWith("i")
            if (!b) {
              if (list.length > 0) {
                var tmp = list[j - 1]
                list.splice(j - 1, 1)
                list.push(tmp + "；" + meaning_list[s].trim())
              }
            } else {
              j++
              list.push(meaning_list[s].trim())
            }
          }
          var sentence = this.parseSentence(data.word, data.sentence)
          this.loadState(HOST, token)
          this.setData({
            sentence: sentence,
            sentence_audio: data.sentence_audio,
            sentence_cn: data.sentence_cn,
            word_symbol: data.phonetic_symbol_us,
            pronunciation_us: data.pronunciation_us,
            pic: data.pic,
            phrase: data.phrase,
            meaning: data.meaning,
            word: data.word,
            video_info: data.video_info,
            paraphrase: data.paraphrase,
            meaningList: list,
            basic_meaning: list[0]
          })
          this.loadVideoInfo(data.video_info)
          this.playSound(data.pronunciation_us)
        } else {
          if (res.data.status == 400 && res.data.msg == '身份认证错误！') {
            this.getToken()
          }
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  parseSentence: function (word, sentence) {
    sentence = sentence.trim()
    if (!sentence.endsWith(".") && !sentence.endsWith("?") && !sentence.endsWith("!")) {
      sentence = sentence + "."
    }
    var split = sentence.split(word)
    // console.log(split)
    if (split.length == 1) {
      var start = word
      //除了单词在开头外 还可能使专有名词 或全部大写
      //先转成全部小写 然后去匹配
      if (split[0].toLowerCase().startsWith(start)) {
        start = start.substring(0, 1).toUpperCase() + start.substring(1)
        //还需要去除开头的单词
        var follow = split[0]
        follow = follow.substring(word.length)
        if (!follow.startsWith(" ")) {
          start = start + follow.split(" ")[0]
          follow = split[0].substring(start.length)
        }
        var mSentence = "<span style='color:#5ee2c9;font-size:1.0rem'>" + start + "</span>" + follow
        return mSentence
      } else {
        var sentenceLower = split[0].toLowerCase()
        if (sentenceLower.indexOf(start) != -1) {
          //包含当前单词
          var index = sentenceLower.indexOf(start)
          var replacement = "<span style='color:#5ee2c9;font-size:1.0rem'>" + split[0].substring(index, index + start.length) + "</span>"
          var mSentence = split[0].substring(0, index) + replacement + split[0].substring(index + start.length)
          return mSentence
        } else {
          //还是匹配不到 则匹配前四个字母
          //即可能出现变型 匹配前四个字符 若相等 则将其设为高亮
          var mSentence = split[0]
          if (word.length > 4) {
            var regex = word.substring(0, 4)
            var target = word
            var tmp = mSentence.split(" ")
            for (let s in tmp) {
              if (tmp[s].startsWith(regex)) {
                target = tmp[s]
                break
              }
            }
            if (target != word) {
              if (target.endsWith(".") || target.endsWith(",") || target.endsWith("!") || target.endsWith(";") || target.endsWith("?") || target.endsWith("-") || target.endsWith("——")) {
                target = target.substring(0, target.length - 1)
              }
              mSentence = mSentence.split(target)[0] + "<span style='color:#5ee2c9;font-size:1.0rem'>" + target + "</span>" + mSentence.split(target)[1]
            }
          }
          return mSentence
        }
      }
    } else {
      //只出现一次
      var start = split[0]
      var end = split[1]
      var target = word
      if (!start.endsWith(" ")) {
        target = start.split(" ")[start.split(" ").length - 1] + target
        start = start.substring(0, start.length - start.split(" ")[start.split(" ").length - 1].length)
      }
      if (!end.startsWith(" ")) {
        target = target + end.split(" ")[0]
        end = end.substring(end.split(" ")[0].length)
      }
      if (target.endsWith(".") || target.endsWith("!") || target.endsWith("?")) {
        end = target.substring(target.length - 1)
        target = target.substring(0, target.length - 1)
      }
      if (target.endsWith(",")) {
        end = "," + end
        target = target.substring(0, target.length - 1)
      }
      if (target.endsWith(";")) {
        end = ";" + end
        target = target.substring(0, target.length - 1)
      }
      if (target.endsWith(":")) {
        end = ":" + end
        target = target.substring(0, target.length - 1)
      }
      if (target.endsWith("-")) {
        end = "-" + end
        target = target.substring(0, target.length - 1)
      }
      if (target.indexOf("——") != -1) {
        if (target.split("——").length == 2) {
          end = "——" + target.split("——")[1] + end
          target = target.split("——")[0]
        }
      }

      if (split.length > 2) {
        var length = start.length + target.length + end.length
        var remain = sentence.substring(length)
        var replacement = "<span style='color:#5ee2c9;font-size:1.0rem'>" + word + "</span>"
        remain = remain.replace(word, replacement)
        end = end + remain
      }

      var mSentence = start + "<span style='color:#5ee2c9;font-size:1.0rem'>" + target + "</span>" + end
      return mSentence
    }
  },

  loadState: function(HOST, token) {
    wx.request({
      url: HOST + '/home/show_word_note.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        word_id: this.data.word_id
      },
      success: (res) => {
        if (res.data.status == 200) {
          var data = res.data.data
          console.log(res)
          var b
          if (data != '暂时未添加笔记!') {
            b = true
          } else {
            b = false
          }
          this.setData({
            note: b
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  loadVideoInfo: function(videoInfo) {
    var HOST = app.globalData.HOST
    var token = app.globalData.token
    for (let i = 0; i < videoInfo.length; i++) {
      var id = videoInfo[i].id
      wx.request({
        url: HOST + '/home/get_subtitles.do',
        method: 'POST',
        data: {
          'video_id': id
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': token
        },
        success: (res) => {
          videoInfo[i]['subtitles'] = res.data.data
          this.data.video_info = videoInfo
        },
        fail: (res) => {

        }
      })
    }
  },
  
  onNoteTap: function(event) {
    wx.navigateTo({
      url: 'edit_note/edit_note?word=' + this.data.word + '&word_id=' + this.data.word_id + '&word_symbol=' + this.data.word_symbol
    })
  },

  bindTextAreaBlur: function(e) {
    this.setData({
      text_area_text: e.detail.value
    })
  },

  onSubmitTap: function(event) {
    var index = 0
    for (let i in this.data.edit_choices) {
      if (this.data.edit_choices[i] == this.data.edit_choice) {
        index = i
        break
      }
    }
    wx.request({
      url: app.globalData.HOST + '/home/error_correction.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': app.globalData.token
      },
      data: {
        type: index,
        text: this.data.text_area_text,
        word_id: this.data.word_id
      },
      success: (res) => {
        if (res.data.status == 200) {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 500
          })
          this.onCloseDialog()
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
    console.log(this.data.text_area_text)
  },

  playSound: function (url) {
    // console.log("playSound")
    var ctx = this.audioCtx
    if (ctx) {
      // ctx.stop()
      ctx.setSrc(url)
      // audioCtx.autoPlay = true
      ctx.play()
    }
    
  },

  onPronunciationTap: function (event) {
    this.playSound(this.data.pronunciation_us)
  },

  onSentenceAudioTap: function (event) {
    this.playSound(this.data.sentence_audio)
  },

  onSampleSentenceTap: function (event) {
    let id = event.currentTarget.id
    let audio_url = this.data.video_info[id].sentence_audio
    this.playSound(audio_url)
  },

  onVideoTap: function (event) {
    // console.log("onVideoTap")
    let id = event.currentTarget.id
    var video_url = this.data.video_info[id].video
    var video_poster = this.data.video_info[id].img

    var sub_titles = this.data.video_info[id].subtitles
    // console.log(this.data.video_info)
    if (!video_url || video_url == undefined) {
      wx.showToast({
        title: '视频地址有误...试试其他吧~',
        icon: 'loading',
        duration: 500
      })
      setTimeout(this.onVideoEnd, 1000)
    } else {
      if (!sub_titles || sub_titles == undefined || sub_titles[0] == undefined) {
        sub_titles = [{
          cn: '暂无字幕',
          en: ''
        }]
      }

      this.setData({
        isShowVideo: true,
        video_url: video_url,
        video_poster: video_poster,
        current_video_id: id,
        sub_titles: sub_titles,
        cn: sub_titles[0].cn,
        en: sub_titles[0].en
      })
    }
    
  },

  onVideoEnd: function (event) {
    var id = this.data.current_video_id
    id++
    console.log(id)
    if (id < this.data.video_info.length) {
      // console.log('id = ' + id)
      setTimeout(this.playNext, 1500)
    } else {
      setTimeout(this.onCloseVideo, 1500)
      // this.onCloseVideo()
    }
  },

  playNext: function () {
    let id = this.data.current_video_id
    console.log("id = " + id)
    id++
    let video_url = this.data.video_info[id].video
    let video_poster = this.data.video_info[id].img
    let sub_titles = this.data.video_info[id].subtitles
    
    if (!sub_titles || sub_titles == undefined || sub_titles[0] == undefined) {
      sub_titles = [{
        cn: '暂无字幕',
        en: ''
      }]
    }

    this.setData({
      current_video_id: id,
      video_url: video_url,
      video_poster: video_poster,
      sub_titles: sub_titles,
      cn: sub_titles[0].cn,
      en: sub_titles[0].en
    })
  },

  onCloseVideo: function (event) {
    this.setData({
      isShowVideo: false
    })
  },

  onVideoUpdate: function (event) {
    var current = event.detail.currentTime
    if (this.data.sub_titles.length > 0) {
      var endTime = this.data.sub_titles[0].et
      //转化成秒再比较
      current = Math.floor(current * 1000)
      if (current >= endTime) {
        var sub_titles = this.data.sub_titles
        sub_titles.splice(0, 1)
        if (sub_titles.length > 0) {
          this.setData({
            sub_titles: sub_titles,
            cn: sub_titles[0].cn,
            en: sub_titles[0].en
          })
        }
      }
    }
  },

  onNextTap: function (event) {
    wx.navigateBack({
      success: () => {
      }
    })
  },

  onPassTap: function (event) {
    this.setData({
      isPassClick: true
    })
    wx.navigateBack({
      success: () => {

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.audioCtx = wx.createInnerAudioContext()
    this.audioCtx = wx.createAudioContext("audio")

    this.videoCtx = wx.createVideoContext('my_video')

  },

  onShowDialog: function (event) {
    let canvasCtx = wx.createCanvasContext('selector_id')

    canvasCtx.setFillStyle("#5ee1c9")

    canvasCtx.beginPath()

    canvasCtx.moveTo(3, 6)

    canvasCtx.lineTo(10.5, 12)

    canvasCtx.lineTo(18, 6)

    canvasCtx.fill()

    canvasCtx.draw()
    
    this.setData({
      isShowDialog: true,
    })
  },

  onShowChoice: function (event) {
    this.setData({
      show_choice: true,
    })
  },


  onCloseDialog: function (event) {
    this.setData({
      isShowDialog: false,
    })
  },

  onCloseChoice: function (event) {
    // console.log(event)
    this.setData({
      show_choice: false,
    })
  },

  onSelectText: function (event) {
    // console.log(event)
    var text = event.currentTarget.dataset.selected
    // console.log(text)
    this.setData({
      show_choice: false,
      edit_choice: text,
    })
  },

  onFullScreenChange: function (event) {
    console.log(event.detail)
    if (event.detail.orientation == 'horizontal') {
      this.setData({
        fullScreen: true
      })
    } else {
      this.setData({
        fullScreen: false
      })
    }
  },

  stopPageScroll () {
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
    var pages = getCurrentPages()
    var beforePage = pages[pages.length - 2]
    if (!this.data.isPassClick) {
      if (this.data.wrongCount > 0) {
        beforePage.onCurrentToLast()
      } else {
        beforePage.toRefresh()
      }
    } else {
      beforePage.onPassTap()
    }
    wx.stopVoice()
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