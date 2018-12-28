// pages/home/word.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    wordType: 'TYPE_GRAPH',
    // selectPos:2,
    // correctAnswer:2,
    currentPointer: 0,
    realPointer: 0,
    wrongCount: 0,
    pass_list: [],
    old_list: [],
    new_list: [],
    word_list: [],
    requestClear: false,
  },

  loadData: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    var HOST = app.globalData.HOST
    var token = app.globalData.token

    wx.request({
      url: HOST + '/home/recite_word_list.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res)

        if (res.data.status == 200) {
          var data = res.data.data
          var new_list = data.new_list
          var old_list = data.old_list

          for (let j = 0; j < old_list.length; j++) {
            old_list[j]['sentence'] = this.parseSentence(old_list[j].word, old_list[j].sentence)
            // console.log(old_list[j].sentence)
          }

          for (let i = 0; i < new_list.length; i++) {
            new_list[i]['level'] = 0
            new_list[i]['sentence'] = this.parseSentence(new_list[i].word, new_list[i].sentence)
          }

          var word_list = []
          word_list = word_list.concat(old_list)
          word_list = word_list.concat(new_list)

          this.setData({
            word_list: word_list,
            pass_list: [],
            new_list: new_list,
            old_list: old_list
          })

          this.initialize()
        } else {
          wx.showModal({
            title: '提示',
            content: '网络开了小差噢...',
            showCancel: false
          })
        }

      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  parseSentence: function(word, sentence) {
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
        var mSentence = "<span style='color:#5ee2c9;font-size:1.3rem'>" + start + "</span>" + follow
        return mSentence
      } else {
        var sentenceLower = split[0].toLowerCase()
        if (sentenceLower.indexOf(start) != -1) {
          //包含当前单词
          var index = sentenceLower.indexOf(start)
          var replacement = "<span style='color:#5ee2c9;font-size:1.3rem'>" + split[0].substring(index, index + start.length) + "</span>"
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
              mSentence = mSentence.split(target)[0] + "<span style='color:#5ee2c9;font-size:1.3rem'>" + target + "</span>" + mSentence.split(target)[1]
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
        var replacement = "<span style='color:#5ee2c9;font-size:1.3rem'>" + word + "</span>"
        remain = remain.replace(word, replacement)
        end = end + remain
      }

      var mSentence = start + "<span style='color:#5ee2c9;font-size:1.3rem'>" + target + "</span>" + end
      return mSentence
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var level = parseInt(options.level)
    this.setData({
      baseLevel: level
    })

    var new_list = wx.getStorageSync('new_list')
    var old_list = wx.getStorageSync('old_list')
    var word_list = wx.getStorageSync('word_list')
    var pass_list = wx.getStorageSync('pass_list')
    var currentPointer = wx.getStorageSync('currentPointer')
    var realPointer = wx.getStorageSync('realPointer')
    // word_list = word_list.concat(this.data.old_list)
    // word_list = word_list.concat(this.data.new_list)
    if (!new_list) {
      //到时候就联网
      console.log("no storage")
      this.loadData()
    } else {
      let progress_text = ''
      if (currentPointer < old_list.length) {
        progress_text = '正在复习旧单词'
      } else if (currentPointer < old_list.length + new_list.length) {
        progress_text = '正在学习新单词'
      } else {
        progress_text = '正在复习新单词'
      }
      this.setData({
        new_list: new_list,
        old_list: old_list,
        word_list: word_list,
        pass_list: pass_list,
        currentPointer: currentPointer,
        realPointer: realPointer,
        progress_text: progress_text
      })
      this.initialize()
    }
  },

  initialize: function() {
    var totalSize = this.data.old_list.length + this.data.new_list.length * 3
    var word_list = this.data.word_list
    console.log(word_list)
    this.setData({
      totalSize: totalSize,
      progressPercentage: this.data.currentPointer * 100 / totalSize,
      word: word_list[this.data.realPointer].word,
      targetSentence: word_list[this.data.realPointer].sentence,
      word_symbol: word_list[this.data.realPointer].phonetic_symbol_us,
    })
    this.refreshList(this.data.word_list, this.data.wordType)

  },

  refreshList: function(word_list, wordType) {
    let progress_text = ''
    this.setData({
      animationData: ''
    })
    if (this.data.currentPointer < this.data.old_list.length) {
      progress_text = '正在复习旧单词'
    } else if (this.data.currentPointer < this.data.old_list.length + this.data.new_list.length) {
      progress_text = '正在学习新单词'
    } else {
      progress_text = '正在复习新单词'
    }
    // console.log(this.data.word_list)
    this.onSoundClick()
    this.setData({
      animationData: ''
    })
    if (word_list.length < 4) {
      console.log("length is minier than 4")
      word_list = word_list.concat(this.data.pass_list)
    }

    var correctAnswer = null
    if (wordType == 'TYPE_GRAPH') {
      correctAnswer = word_list[this.data.realPointer].pic
    } else {
      correctAnswer = word_list[this.data.realPointer].meaning
    }
    // console.log(correctAnswer)
    var list = []
    while (list.length < 3) {
      //向下取整
      var rNum = Math.floor(Math.random() * word_list.length)
      // console.log(rNum)
      if (wordType == 'TYPE_GRAPH') {
        if (correctAnswer == word_list[rNum].pic) {
          continue
        }
        var isAdded = false

        for (let index in list) {
          if (list[index] == word_list[rNum].pic) {
            isAdded = true
            break
          }
        }

        if (!isAdded) {
          list.push(word_list[rNum].pic)
        }
      } else {
        if (correctAnswer == word_list[rNum].meaning) {
          continue
        }
        var isAdded = false

        for (let index in list) {
          if (list[index] == word_list[rNum].meaning) {
            isAdded = true
            break
          }
        }

        if (!isAdded) {
          list.push(word_list[rNum].meaning)
        }
      }

    }
    var index = Math.floor(Math.random() * 4)
    var tmpList = list.splice(0, index)
    var finalList = []
    finalList = finalList.concat(tmpList)
    finalList = finalList.concat(correctAnswer)
    finalList = finalList.concat(list)

    if (wordType == 'TYPE_GRAPH') {
      this.setData({
        img_path_first: finalList[0],
        img_path_second: finalList[1],
        img_path_third: finalList[2],
        img_path_fourth: finalList[3],
        correctAnswer: index + 1,
        progress_text: progress_text
      })
    } else {
      this.setData({
        text_path_first: finalList[0],
        text_path_second: finalList[1],
        text_path_third: finalList[2],
        text_path_fourth: finalList[3],
        correctAnswer: index + 1,
        progress_text: progress_text
      })
    }

    // console.log(word_list)

  },

  onSelectGraphItem: function(event) {
    // console.log(event)
    var audio = wx.createInnerAudioContext()
    var id = event.currentTarget.id
    this.setData({
      selectPos: id,
      animationData: ''
    })
    this.setAnimation()
    // console.log(this.data.selectPos)
    if (id == this.data.correctAnswer) {

      audio.src = '/voice/correct.mp3'

      if (this.data.currentPointer < this.data.totalSize) {

        setTimeout(this.onGraphSuccess, 600)
      } else {
        this.setData({
          progressPercentage: 100,
          currentPointer: this.data.totalSize
        })
        // console.log("到头了")
        this.doPostWork()
      }
    } else {
      audio.src = '/voice/wrong.mp3',
        this.onGraphFail()
    }
    audio.play()
  },

  setAnimation: function() {
    this.animation.scale3d(1.5, 1.5, 1.5).step({duration:300})
    this.animation.scale3d(1, 1, 1).step({duration: 300})

    this.setData({
      animationData: this.animation.export()
    })
  },

  onGraphSuccess: function() {
    var obj = this.data.word_list[this.data.realPointer]
    if (obj.level < 1) {
      //新单词学习
      wx.navigateTo({
        url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id + "&sentence=" + this.data.word_list[this.data.realPointer].sentence.replace("=", "#"),
      })
    } else if (obj.level < 2) {
      //新单词复习阶段
      if (this.data.wrongCount > 0) {
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id + "&sentence=" + this.data.word_list[this.data.realPointer].sentence.replace("=", "#"),
        })
      } else {
        this.toRefresh()
      }
    } else {
      if (this.data.wrongCount > 1) {
        //旧单词复习
        //复习时错2次才会跳转并打回原形
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id,
        })
      } else {
        this.setData({
          wordType: 'TYPE_TEXT',
          selectPos: 0,
          wrongCount: 0,
          tips_text: ''
        })
        this.refreshList(this.data.word_list, this.data.wordType)
      }
    }
  },

  onGraphFail: function() {

    var level = this.data.word_list[this.data.realPointer].level

    var wrongCount = this.data.wrongCount
    wrongCount++
    this.setData({
      wrongCount: wrongCount,
    })
    switch (wrongCount) {
      case 1:
        this.setData({
          tips_text: this.data.word_list[this.data.realPointer].paraphrase
        })
        break
      case 2:
        this.setData({
          tips_text: this.data.word_list[this.data.realPointer].meaning
        })
        break
      case 3:
        this.setData({
          tips_text: this.data.word_list[this.data.realPointer].sentence_cn
        })
        break
      default:
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id,
        })
        break
    }
  },

  toRefresh: function() {
    var currentPointer = this.data.currentPointer
    var realPointer = this.data.realPointer
    if (this.data.word_list[realPointer].level < 2) {
      var word_list = this.data.word_list
      var obj = word_list[this.data.realPointer]
      obj.level = obj.level + 1
      word_list[realPointer] = obj
      this.setData({
        word_list: word_list
      })
    }
    if (currentPointer < this.data.old_list.length) {
      this.setData({
        wordType: 'TYPE_GRAPH'
      })
    }
    realPointer++
    currentPointer++
    console.log("currentPointer = " + currentPointer)
    console.log("realPointer = " + realPointer)

    if (realPointer >= this.data.word_list.length) {
      realPointer -= this.data.new_list.length
    }

    if (currentPointer == this.data.totalSize - this.data.new_list.length * 2) {
      this.setData({
        showReviewToast: true
      })
      setTimeout(() => {
        this.setData({
          showReviewToast: false
        })
      }, 1000)
    }

    if (currentPointer == this.data.totalSize - this.data.new_list.length) {
      //判断知道已经进入复习释义
      this.setData({
        wordType: 'TYPE_TEXT',
      })
    }

    if (currentPointer == this.data.totalSize) {
      this.setData({
        progressPercentage: 100,
        currentPointer: this.data.totalSize
      })
      this.doPostWork()
    } else {
      this.setData({
        selectPos: 0,
        currentPointer: currentPointer,
        realPointer: realPointer,
        progressPercentage: currentPointer * 100 / this.data.totalSize,
        word: this.data.word_list[realPointer].word,
        targetSentence: this.data.word_list[realPointer].sentence,
        word_symbol: this.data.word_list[realPointer].phonetic_symbol_us,
        tips_text: '',
        wrongCount: 0,
        // paraphrase: this.data.word_list[this.data.currentPointer].paraphrase,
        // meaning: 
      })
      this.refreshList(this.data.word_list, this.data.wordType)
    }
  },

  onSelectTextItem: function(event) {
    // console.log("onTextTap")
    var audio = wx.createInnerAudioContext()
    var id = event.currentTarget.id
    this.setData({
      selectPos: id
    })
    if (this.data.selectPos == this.data.correctAnswer) {
      this.setAnimation()
      audio.src = '/voice/correct.mp3'
      if (this.data.currentPointer < this.data.totalSize) {
        setTimeout(this.onTextSuccess, 600)
      } else {
        this.setData({
          progressPercentage: 100,
          currentPointer: this.data.totalSize
        })
        // console.log("到头了")
        this.doPostWork()
      }
      // else {

      // }
    } else {
      audio.src = '/voice/wrong.mp3'
      this.onTextFail()
    }
    audio.play()
  },

  onTextSuccess: function() {
    var obj = this.data.word_list[this.data.realPointer]
    if (obj.level <= 2) {
      //新单词释义复习或者旧单词释义选择题
      if (this.data.wrongCount > 0) {
        //错过就跳转并重置到总列表最后
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id,
        })
      } else {
        if (this.data.currentPointer < this.data.old_list.length) {
          //旧单词复习 level + 1
          let word_list = this.data.word_list
          let obj = word_list[this.data.realPointer]
          obj.level = obj.level + 1
          word_list[this.data.realPointer] = obj
          this.setData({
            word_list: word_list
          })
        }
        this.toRefresh()
      }
    } else {
      //旧单词复习
      if (this.data.wrongCount > 0) {
        //错过就跳转并重置到总列表最后
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id,
        })
      } else {
        let word_list = this.data.word_list
        let obj = word_list[this.data.realPointer]
        obj.level = obj.level + 1
        word_list[this.data.realPointer] = obj
        this.setData({
          wordType: 'TYPE_GRAPH',
          word_list: word_list
        })
        this.toRefresh()
      }

    }
  },

  onTextFail: function() {
    var wrongCount = this.data.wrongCount
    wrongCount++
    this.setData({
      wrongCount: wrongCount
    })
    switch (wrongCount) {
      case 1:
        this.setData({
          tips_text: this.data.word_list[this.data.realPointer].paraphrase
        })
        break
      default:
        wx.navigateTo({
          url: 'word_detail/word_detail?wrongCount=' + this.data.wrongCount + "&word_id=" + this.data.word_list[this.data.realPointer].id,
        })
        break
    }
  },

  /**
   * 将对应元素放到列表最后
   */
  onCurrentToLast: function() {
    var obj = this.data.word_list[this.data.realPointer]
    var word_list = this.data.word_list
    var old_list = this.data.old_list
    var new_list = this.data.new_list
    if (this.data.realPointer < old_list.length) {
      //旧单词复习时错误
      old_list.splice(this.data.realPointer, 1)
      //加到新单词列表后 还得把level重置
      obj.level = 0
      new_list.push(obj)
      word_list.splice(this.data.realPointer, 1)
      word_list.push(obj)
      //总长会变更
      var totalSize = this.data.totalSize + 2
      this.setData({
        old_list: old_list,
        new_list: new_list,
        word_list: word_list,
        wrongCount: 0,
        totalSize: totalSize,
        progressPercentage: this.data.currentPointer * 100 / totalSize,
        word: word_list[this.data.realPointer].word,
        targetSentence: word_list[this.data.realPointer].sentence,
        word_symbol: word_list[this.data.realPointer].phonetic_symbol_us,
        wordType: 'TYPE_GRAPH',
        selectPos: 0,
        tips_text: ''
      })
    } else {
      //新单词复习时错误
      //新单词学习不做重置
      if (obj.level < 1) {
        this.toRefresh()
        console.log("新单词学习错误 不做重置")
        return
      }
      //新单词复习做重置
      console.log("新单词复习错误")
      var index = this.data.realPointer - old_list.length
      new_list.splice(index, 1)
      new_list.push(obj)
      word_list.splice(this.data.realPointer, 1)
      word_list.push(obj)
      this.setData({
        new_list: new_list,
        word_list: word_list,
        wrongCount: 0,
        word: word_list[this.data.realPointer].word,
        targetSentence: word_list[this.data.realPointer].sentence,
        word_symbol: word_list[this.data.realPointer].phonetic_symbol_us,
        selectPos: 0,
        tips_text: ''
      })
    }
    this.refreshList(word_list, this.data.wordType)
  },

  onPassTap: function(event) {
    var obj = this.data.word_list[this.data.realPointer]
    var currentPointer = this.data.currentPointer
    var realPointer = this.data.realPointer
    var pass_list = this.data.pass_list
    var old_list = this.data.old_list
    var new_list = this.data.new_list
    var word_list = this.data.word_list
    //通过realPointer判断是否为旧单词
    if (realPointer < old_list.length) {
      //为旧单词
      obj.level = 5
      pass_list.push(obj)
      old_list.splice(this.data.realPointer, 1)
      word_list.splice(this.data.realPointer, 1)
      var totalSize = this.data.totalSize - 1
      if (totalSize == 0) {
        this.setData({
          progressPercentage: 100,
          currentPointer: this.data.totalSize
        })
        this.doPostWork()
        return
      } else {
        this.setData({
          pass_list: pass_list,
          old_list: old_list,
          word_list: word_list,
          totalSize: totalSize,
          progressPercentage: currentPointer * 100 / totalSize,
          wordType: 'TYPE_GRAPH',
          wrongCount: 0,
          word: word_list[realPointer].word,
          targetSentence: word_list[realPointer].sentence,
          word_symbol: word_list[realPointer].phonetic_symbol_us,
          selectPos: 0,
          tips_text: ''
        })
        this.refreshList(word_list, this.data.wordType)
      }
    } else {
      //为新单词
      if (currentPointer < word_list.length) {
        //新单词学习过程
        obj.level = 5
        pass_list.push(obj)
        var totalSize = this.data.totalSize - 3
        let index = realPointer - old_list.length
        new_list.splice(index, 1)
        word_list.splice(realPointer, 1)
        if (new_list.length == 0) {
          //如果新单词列表没有了 则结束
          this.setData({
            progressPercentage: 100,
            currentPointer: this.data.totalSize
          })
          this.doPostWork()
          return
        } else {
          if (realPointer == word_list.length) {
            realPointer -= new_list.length
          }
          this.setData({
            pass_list: pass_list,
            old_list: old_list,
            word_list: word_list,
            totalSize: totalSize,
            realPointer: realPointer,
            progressPercentage: currentPointer * 100 / totalSize,
            wordType: 'TYPE_GRAPH',
            wrongCount: 0,
            word: word_list[realPointer].word,
            targetSentence: word_list[realPointer].sentence,
            word_symbol: word_list[realPointer].phonetic_symbol_us,
            selectPos: 0,
            tips_text: ''
          })
        }
        this.refreshList(word_list, this.data.wordType)
      } else {
        //新单词复习过程
        // console.log("新单词复习过程")
        var totalSize = this.data.totalSize
        if (currentPointer < totalSize - new_list.length) {
          //新单词图册复习
          console.log("新单词图册复习")
          if (currentPointer == old_list.length + new_list.length) {
            this.setData({
              showReviewToast: true
            })
            setTimeout(() => {
              this.setData({
                showReviewToast: false
              })
            }, 1000)
          }
          
          obj.level = 5
          pass_list.push(obj)
          let totalSize = this.data.totalSize - 2
          let index = realPointer - old_list.length
          new_list.splice(index, 1)
          word_list.splice(realPointer, 1)
          if (new_list.length == 0) {
            //如果新单词列表没有了 则结束
            this.setData({
              progressPercentage: 100,
              currentPointer: this.data.totalSize
            })
            this.doPostWork()
            return
          } else {
            console.log(totalSize)
            console.log(currentPointer)
            if (currentPointer == totalSize - new_list.length) {
              this.setData({
                wordType: 'TYPE_TEXT'
              })
            }

            if (realPointer == word_list.length) {
              realPointer -= new_list.length
            }
            // 还有则可以进行复习
            this.setData({
              pass_list: pass_list,
              old_list: old_list,
              word_list: word_list,
              totalSize: totalSize,
              progressPercentage: currentPointer * 100 / totalSize,
              realPointer: realPointer,
              // wordType: 'TYPE_GRAPH',
              wrongCount: 0,
              word: word_list[realPointer].word,
              targetSentence: word_list[realPointer].sentence,
              word_symbol: word_list[realPointer].phonetic_symbol_us,
              selectPos: 0,
              tips_text: ''
            })
            this.refreshList(word_list, this.data.wordType)
          }
        } else {
          //新单词释义复习
          // console.log("新单词释义复习")
          obj.level = 5
          pass_list.push(obj)
          let totalSize = this.data.totalSize - 1
          let index = realPointer - old_list.length
          new_list.splice(index, 1)
          word_list.splice(realPointer, 1)
          if (new_list.length == 0) {
            //没有可再复习的了
            this.setData({
              progressPercentage: 100,
              currentPointer: this.data.totalSize
            })
            this.doPostWork()
            return
          } else {
            if (realPointer == word_list.length) {
              this.setData({
                progressPercentage: 100,
                currentPointer: this.data.totalSize
              })
              this.doPostWork()
              return
            }
            this.setData({
              pass_list: pass_list,
              old_list: old_list,
              word_list: word_list,
              totalSize: totalSize,
              progressPercentage: currentPointer * 100 / totalSize,
              realPointer: realPointer,
              // wordType: 'TYPE_GRAPH',
              wrongCount: 0,
              word: word_list[realPointer].word,
              targetSentence: word_list[realPointer].sentence,
              word_symbol: word_list[realPointer].phonetic_symbol_us,
              selectPos: 0,
              tips_text: ''
            })
            this.refreshList(word_list, this.data.wordType)
          }
        }
      }
    }
  },

  doPostWork: function() {
    wx.showToast({
      title: '上传中',
      icon: 'loading',
      duration: 1000
    })
    wx.request({
      url: app.globalData.HOST + '/home/liquidation_word.do',
    })
    var word_list = this.data.word_list.concat(this.data.pass_list)
    var list = []
    for (let i in word_list) {
      var s = '{"id":' + word_list[i]['id'] + ',"level":' + word_list[i]['level'] + ',"word":"' + word_list[i]['word'] + '","meaning":"' + word_list[i]['meaning'] + '"}'
      list.push(s)
    }
    var listStr = list.join(',')
    listStr = '[' + listStr + ']'
    // console.log(listStr)
    wx.request({
      url: app.globalData.HOST + '/home/liquidation_word.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': app.globalData.token
      },
      data: {
        word_list: listStr
      },
      success: (res) => {
        if (res.data.status == 200) {
          if (parseInt(this.data.baseLevel) < 2) {
            var beforePage = getCurrentPages()[0]
            beforePage.loadData(app.globalData.token)
            wx.redirectTo({
              url: '../sign/sign',
            })
          } else {
            wx.reLaunch({
              url: '../home',
            })
          }
          
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
    // console.log(listStr)
    this.data.requestClear = true
    wx.removeStorageSync('new_list')
    wx.removeStorageSync('old_list')
    wx.removeStorageSync('word_list')
    wx.removeStorageSync('pass_list')
    wx.removeStorageSync('currentPointer')
    wx.removeStorageSync('realPointer')
  },

  onSentenceTap: function(event) {
    var audioCtx = this.audioCtx
    if (audioCtx) {
      // audioCtx.stop()
      audioCtx.setSrc(this.data.word_list[this.data.realPointer].sentence_audio)
      audioCtx.play()
    }
  },

  onWordTap: function(event) {
    var audioCtx = this.audioCtx
    if (audioCtx) {
      // audioCtx.stop()
      audioCtx.setSrc(this.data.word_list[this.data.realPointer].pronunciation_us)
      audioCtx.play()
    }
  },

  onSoundClick: function(event) {
    var audioCtx = this.audioCtx
    if (audioCtx) {
      // audioCtx.stop()
      audioCtx.setSrc(this.data.word_list[this.data.realPointer].sentence_audio)
      audioCtx.play()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // let b = wx.canIUse('wx.createInnerAudioContext')
    // console.log(b)
    this.audioCtx = wx.createAudioContext("audio")
    var animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    })

    this.animation = animation
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
    if (!this.data.requestClear) {
      if (this.data.word_list.length > 0 || this.data.pass_list.length > 0) {
        console.log("in")
        wx.setStorageSync('word_list', this.data.word_list)
        wx.setStorageSync('new_list', this.data.new_list)
        wx.setStorageSync('old_list', this.data.old_list)
        wx.setStorageSync('pass_list', this.data.pass_list)
        wx.setStorageSync('currentPointer', this.data.currentPointer)
        wx.setStorageSync('realPointer', this.data.realPointer)
      } else {
        if (wx.getStorageSync('word_list') != undefined) {
          wx.removeStorageSync('word_list')
          wx.removeStorageSync('new_list')
          wx.removeStorageSync('old_list')
          wx.removeStorageSync('pass_list')
          wx.removeStorageSync('currentPointer')
          wx.removeStorageSync('realPointer')
        }
      }
    }
    if (this.audioCtx) {
      wx.stopVoice()
    }
  }
})