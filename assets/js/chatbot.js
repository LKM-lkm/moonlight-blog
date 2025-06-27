/**
 * 月光云海博客 - 聊天机器人功能
 * 提供聊天机器人界面和基本交互功能
 */

// 全局变量
let chatbotWrapper;
let chatbotContainer;
let chatbotToggle;
let chatbotClose;
let messagesList;
let messageInput;
let chatbotForm;
let typingIndicator;

// 预设问题和回答
const presetQA = [
  { question: "博主是谁？", answer: "博主是一名热爱技术和创新的学生，专注于AI、云计算和大数据。" },
  { question: "如何联系站长？", answer: "您可以通过页面底部的社交媒体链接或邮箱联系博主。" },
  { question: "网站有哪些功能？", answer: "本站支持文章浏览、评论、主题切换、聊天机器人等功能。" },
  { question: "如何切换主题？", answer: "点击右上角的月亮/太阳图标即可切换明暗主题。" },
  { question: "如何注册？", answer: "目前本站暂未开放注册功能，敬请期待后续更新。" },
  { question: "有推荐的文章吗？", answer: "您可以在首页查看最新文章，或通过导航栏的'文章'页面浏览所有文章。" }
];

// 聊天机器人回复
const presetAnswers = {
  "你好": "你好！我是Moonlight助手，有什么可以帮您的吗？",
  "你是谁": "我是Moonlight助手，这个网站的问答机器人。",
  "更多": "您好！Moonlight博客目前正在建设中，功能尚不完善，敬请期待！",
  "帮助": "我可以帮您了解网站的功能、导航到特定页面，或者回答关于博客的问题。请告诉我您想了解什么？",
  "博主是谁": "博主是一名热爱技术和创新的学生，专注于AI、云计算和大数据。",
  "联系方式": "您可以通过页面底部的社交媒体链接或邮箱联系博主。",
  "网站功能": "本站支持文章浏览、评论、主题切换、聊天机器人等功能。",
  "如何切换主题": "点击右上角的月亮/太阳图标即可切换明暗主题。",
  "如何注册": "目前本站暂未开放注册功能，敬请期待后续更新。",
  "推荐文章": "您可以在首页查看最新文章，或通过导航栏的'文章'页面浏览所有文章。"
};

// 欢迎消息
const welcomeMessages = [
  "我是Moonlight助手，可以帮您：",
  "1. 了解博客内容和功能",
  "2. 回答常见问题",
  "3. 提供导航帮助"
];

// DOM加载完成后初始化聊天机器人
document.addEventListener("DOMContentLoaded", function() {
  const chatbot = {
    toggle: document.querySelector(".chatbot-toggle"),
    container: document.querySelector(".chatbot-container"),
    messages: document.querySelector(".chatbot-messages"),
    input: document.querySelector(".chatbot-input"),
    sendBtn: document.querySelector(".chatbot-submit"),
    
    init() {
      this.toggle.addEventListener('click', () => this.toggleChatbot());
      const form = document.querySelector('.chatbot-form');
      if(form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.sendMessage();
        });
      }
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });
      // 关闭按钮事件
      const closeBtn = document.querySelector('.chatbot-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.container.classList.remove('active');
        });
      }
      // 自动显示欢迎消息
      this.showWelcome();
    },
    
    toggleChatbot() {
      this.container.classList.toggle('active');
    },
    
    sendMessage() {
      const message = this.input.value.trim();
      if (!message) return;
      this.addMessage(message, 'user');
      this.input.value = '';
      setTimeout(() => {
        const response = this.getResponse(message);
        this.addMessage(response, 'bot');
      }, 500);
    },
    
    addMessage(text, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chatbot-message ${type}`;
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.textContent = text;
      messageDiv.appendChild(bubble);
      this.messages.appendChild(messageDiv);
      this.messages.scrollTop = this.messages.scrollHeight;
    },
    
    getResponse(message) {
      const responses = {
        '你好': '你好！我是月光博客的AI助手，有什么可以帮你的吗？',
        '再见': '再见！祝你有个愉快的一天！',
        '默认': '抱歉，我还在学习中，暂时无法回答这个问题。'
      };
      return responses[message] || responses['默认'];
    },
    showWelcome() {
      this.addMessage('你好，我是Moonlight助手，有什么可以帮您的吗？', 'bot');
    }
  };
  chatbot.init();
});

// 发送消息
function sendMessage() {
  if (!messageInput || !messageInput.value.trim()) return;
  
  var message = messageInput.value.trim();
  addUserMessage(message);
  messageInput.value = "";
  
  // 显示正在输入指示器
  showTypingIndicator();
  
  // 模拟延迟后回复
  setTimeout(function() {
    removeTypingIndicator();
    handleUserMessage(message);
  }, 1000);
}

// 处理用户消息
function handleUserMessage(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // 检查是否匹配预设问题
  let matchedPreset = null;
  for (const qa of presetQA) {
    const questionLower = qa.question.toLowerCase();
    if (questionLower.includes(lowerMessage) || lowerMessage.includes(questionLower)) {
      matchedPreset = qa;
      break;
    }
  }
  
  if (matchedPreset) {
    addBotMessage(matchedPreset.answer);
    return;
  }
  
  // 检查是否匹配响应列表
  let responseFound = false;
  for (const key in presetAnswers) {
    if (lowerMessage === key.toLowerCase() || lowerMessage.includes(key.toLowerCase())) {
      console.log("匹配到关键词:", key);
      addBotMessage(presetAnswers[key]);
      responseFound = true;
      break;
    }
  }
  
  // 如果没有匹配，显示默认回复
  if (!responseFound) {
    console.log("未匹配到回答，显示默认回复");
    addBotMessage("抱歉，我还在学习中。您可以试试以下问题：");
    showPresetQuestions();
  }
}

// 添加用户消息
function addUserMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement("div");
  messageElement.className = "message user-message";
  messageElement.innerHTML = '<div class="message-content">' + message + '</div>';
  messagesList.appendChild(messageElement);
  
  scrollToBottom();
}

// 添加机器人消息
function addBotMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement("div");
  messageElement.className = "message bot-message";
  messageElement.innerHTML = '<div class="message-content">' + message + '</div>';
  messagesList.appendChild(messageElement);
  
  scrollToBottom();
}

// 显示预设问题
function showPresetQuestions() {
  if (!messagesList) return;
  
  // 检查是否已经存在预设问题
  const existingQuestions = messagesList.querySelector('.preset-questions');
  if (existingQuestions) {
    existingQuestions.remove();
  }
  
  const questionsElement = document.createElement("div");
  questionsElement.className = "preset-questions";
  
  for (let i = 0; i < presetQA.length; i++) {
    (function(qa) {
      const questionButton = document.createElement("button");
      questionButton.className = "preset-question";
      questionButton.textContent = qa.question;
      questionButton.onclick = function() {
        addUserMessage(qa.question);
        
        // 显示正在输入指示器
        showTypingIndicator();
        
        // 模拟延迟后回复
        setTimeout(function() {
          removeTypingIndicator();
          addBotMessage(qa.answer);
        }, 800);
      };
      
      questionsElement.appendChild(questionButton);
    })(presetQA[i]);
  }
  
  messagesList.appendChild(questionsElement);
  scrollToBottom();
}

// 显示正在输入指示器
function showTypingIndicator() {
  if (!messagesList) return;
  
  // 移除已存在的输入指示器
  removeTypingIndicator();
  
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot-message typing-indicator";
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  typingDiv.id = "typing-indicator";
  messagesList.appendChild(typingDiv);
  scrollToBottom();
}

// 隐藏正在输入指示器
function removeTypingIndicator() {
  var typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
  if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight;
    }
}