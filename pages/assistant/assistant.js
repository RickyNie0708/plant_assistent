// pages/assistant/assistant.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    chatHistory: [], // 对话历史
    userInput: '', // 用户输入
    isRecording: false, // 是否正在录音
    isThinking: false, // AI是否正在思考
    isStreaming: false, // 是否正在流式接收回复
    streamingContent: '', // 流式接收的内容
    currentAiMessageId: null, // 当前正在接收的AI消息ID
    messages: [
      {
        id: 1,
        type: 'ai',
        content: '你好！我是你的植物养护助手🌱\n我可以帮你解答关于植物养护的各种问题，比如：\n• 浇水频率\n• 光照需求\n• 施肥建议\n• 病虫害防治\n\n请问有什么可以帮助你的吗？',
        time: '刚刚'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('AI助手页面加载');
    
    // 检查云开发环境是否初始化
    if (!wx.cloud) {
      wx.showModal({
        title: '提示',
        content: '请先开通云开发功能',
        showCancel: false
      });
      return;
    }
    
    // 从本地存储加载历史记录
    const chatHistory = wx.getStorageSync('aiChatHistory') || [];
    if (chatHistory.length > 0) {
      this.setData({
        messages: chatHistory
      });
    }
    
    // 初始化云环境（如果尚未初始化）
    try {
      wx.cloud.init({
        env: '你的云环境ID', // 替换为你的实际环境ID
        traceUser: true,
      });
      console.log('云开发初始化成功');
    } catch (err) {
      console.error('云开发初始化失败:', err);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 页面加载完成后自动聚焦输入框
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.input-field').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          wx.pageScrollTo({
            scrollTop: res[0].bottom,
            duration: 300
          });
        }
      });
    }, 500);
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const userInput = this.data.userInput.trim();
    if (!userInput) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      time: this.formatTime(new Date())
    };

    // 更新消息列表
    this.setData({
      messages: [...this.data.messages, userMessage],
      userInput: '',
      isThinking: true,
      isStreaming: false,
      streamingContent: '',
      currentAiMessageId: null
    });

    // 滚动到底部
    this.scrollToBottom();

    // 调用真实的AI接口
    this.getAIResponse(userInput);
  },

  /**
   * 获取AI回复 - 使用微信云开发AI能力
   */
  async getAIResponse(userInput) {
    try {
      // 方法1：使用智能体（推荐）
      await this.callAIBot(userInput);
      
      // 方法2：也可以使用直接调用大模型
      // await this.callAIModel(userInput);
      
    } catch (error) {
      console.error('AI调用失败:', error);
      this.showAIError(error);
    }
  },

  /**
   * 方法1：调用智能体（推荐，功能更完整）
   */
  async callAIBot(userInput) {
    // 这里需要替换为你自己的智能体ID
    // 在云开发控制台 -> AI -> 智能体 中创建并获取botId
    const botId = '你的智能体ID'; // 替换为你的实际智能体ID
    
    // 如果没有配置智能体ID，使用直接调用模型的方式
    if (!botId || botId === '你的智能体ID') {
      await this.callAIModel(userInput);
      return;
    }
    
    try {
      const res = await wx.cloud.extend.AI.bot.sendMessage({
        data: {
          botId: botId,
          msg: userInput,
          // 可选：传递对话历史
          history: this.buildConversationHistory()
        }
      });
      
      // 处理流式返回
      let fullResponse = '';
      for await (let chunk of res.textStream) {
        fullResponse += chunk;
        
        // 如果是第一条AI消息，先创建消息对象
        if (!this.data.currentAiMessageId) {
          const aiMessageId = Date.now() + 1;
          const aiMessage = {
            id: aiMessageId,
            type: 'ai',
            content: chunk,
            time: '正在输入...'
          };
          
          this.setData({
            messages: [...this.data.messages, aiMessage],
            isThinking: false,
            isStreaming: true,
            currentAiMessageId: aiMessageId,
            streamingContent: chunk
          });
        } else {
          // 更新现有消息
          this.setData({
            streamingContent: fullResponse,
            messages: this.data.messages.map(msg => 
              msg.id === this.data.currentAiMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          });
        }
        
        // 滚动到底部
        this.scrollToBottom();
      }
      
      // 流式接收完成
      this.finalizeAIResponse(fullResponse);
      
    } catch (error) {
      console.error('智能体调用失败:', error);
      throw error;
    }
  },

  /**
   * 方法2：直接调用大模型
   */
  async callAIModel(userInput) {
    try {
      // 创建模型实例 - 使用混元精简版（有免费额度）
      const model = wx.cloud.extend.AI.createModel({
        model: 'hunyuan-lite', // 可以使用：hunyuan-lite, hunyuan-pro, claude-3-haiku等
      });
      
      // 构建对话历史
      const recentMessages = this.data.messages.slice(-6); // 取最近6条作为上下文
      const history = recentMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // 添加当前用户输入
      history.push({
        role: 'user',
        content: userInput
      });
      
      // 系统提示词，让AI扮演植物养护专家
      const systemPrompt = {
        role: 'system',
        content: '你是一个专业的植物养护专家，擅长解答各种植物养护问题，包括浇水、光照、施肥、病虫害防治等。请用专业但易懂的语言回答用户的问题，可以适当使用表情符号增加亲和力。如果用户的问题超出植物养护范围，请委婉地表示你主要专注于植物养护方面的问题。'
      };
      
      // 调用模型
      const result = await model.invoke({
        messages: [systemPrompt, ...history],
        temperature: 0.7, // 控制回答的随机性 0-1
        max_tokens: 1000, // 最大回复长度
      });
      
      // 获取AI回复
      const aiResponse = result.response;
      
      // 添加AI消息
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        time: '刚刚'
      };
      
      this.setData({
        messages: [...this.data.messages, aiMessage],
        isThinking: false
      });
      
      // 保存历史记录
      this.saveChatHistory();
      
      // 滚动到底部
      this.scrollToBottom();
      
    } catch (error) {
      console.error('模型调用失败:', error);
      throw error;
    }
  },

  /**
   * 构建对话历史（用于智能体）
   */
  buildConversationHistory() {
    const recentMessages = this.data.messages.slice(-10); // 限制历史长度
    return recentMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  },

  /**
   * 最终化AI回复
   */
  finalizeAIResponse(fullResponse) {
    this.setData({
      isStreaming: false,
      streamingContent: '',
      currentAiMessageId: null,
      messages: this.data.messages.map(msg => 
        msg.id === this.data.currentAiMessageId 
          ? { 
              ...msg, 
              content: fullResponse,
              time: '刚刚'
            }
          : msg
      )
    });
    
    // 保存历史记录
    this.saveChatHistory();
  },

  /**
   * 显示AI错误
   */
  showAIError(error) {
    console.error('AI调用错误:', error);
    
    // 添加错误提示消息
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: `抱歉，我暂时无法回答这个问题。\n\n错误信息：${error.message || '未知错误'}\n\n请检查：\n1. 云开发环境是否正确配置\n2. AI扩展能力是否已开通\n3. 网络连接是否正常`,
      time: '刚刚'
    };
    
    this.setData({
      messages: [...this.data.messages, errorMessage],
      isThinking: false,
      isStreaming: false
    });
    
    // 保存历史记录
    this.saveChatHistory();
    
    // 滚动到底部
    this.scrollToBottom();
  },

  /**
   * 快速提问
   */
  quickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({
      userInput: question
    });
    
    // 延迟发送，让用户看到输入框变化
    setTimeout(() => {
      this.sendMessage();
    }, 300);
  },

  /**
   * 停止接收流式回复
   */
  stopStreaming() {
    // 注意：微信云开发AI暂不支持停止流式请求
    // 这里只能提示用户
    if (this.data.isStreaming) {
      wx.showToast({
        title: '正在生成回复，请稍候',
        icon: 'none'
      });
    }
  },

  // ===================== 以下原有函数保持不变 =====================
  
  /**
   * 保存对话历史到本地存储
   */
  saveChatHistory() {
    wx.setStorageSync('aiChatHistory', this.data.messages.slice(-20)); // 只保存最近20条
  },

  /**
   * 用户输入处理
   */
  onInputChange(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      });
    }, 100);
  },

  /**
   * 清空对话
   */
  clearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定要清空当前对话吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            messages: [{
              id: 1,
              type: 'ai',
              content: '对话已清空！我是你的植物养护助手🌱\n有什么可以帮助你的吗？',
              time: '刚刚'
            }],
            isThinking: false,
            isStreaming: false
          });
          
          wx.setStorageSync('aiChatHistory', []);
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 24小时内
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return date.getMonth() + 1 + '月' + date.getDate() + '日';
    }
  },

  // ... 其他生命周期函数和原有方法保持不变
});