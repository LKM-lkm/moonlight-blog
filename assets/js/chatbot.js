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
  {
    question: "这个博客是做什么的？",
    answer: "这是一个个人博客网站，博主是一名学生，热爱技术和创新。主要关注绘画、文字排版、人工智能、云计算和大数据领域。"
  },
  {
    question: "如何联系站长？",
    answer: "您可以通过页面底部的社交媒体链接或者发送邮件到站长邮箱联系我们。"
  },
  {
    question: "有推荐的文章吗？",
    answer: "您可以在首页查看最新文章，或者通过导航栏的\"文章\"页面浏览所有文章。"
  }
];

// 聊天机器人回复
const botResponses = {
  "你好": "你好！很高兴见到你！请问有什么我可以帮你的吗？",
  "关于": "这是一个个人博客网站，博主是一名学生，热爱技术和创新。主要关注绘画、文字排版、人工智能、云计算和大数据领域。",
  "文章": "您可以在首页查看最新文章，或者通过导航栏的\"文章\"页面浏览所有文章。",
  "联系": "您可以通过页面底部的社交媒体链接或者邮箱联系博主。",
  "你是谁": "我是Moonlight助手，这个网站的问答机器人。",
  "帮助": "我可以帮您了解网站的功能、导航到特定页面，或者回答关于博客的问题。请告诉我您想了解什么？"
};

// 欢迎消息
const welcomeMessages = [
  "我是Moonlight助手，可以帮您：",
  "1. 了解博客内容和功能",
  "2. 回答常见问题",
  "3. 提供导航帮助"
];

// DOM加载完成后初始化聊天机器人
document.addEventListener("DOMContentLoaded", () => {
  initChatbot();
});

// 初始化聊天机器人
function initChatbot() {
  // 查找DOM元素
  chatbotWrapper = document.querySelector(".chatbot-wrapper");
  chatbotContainer = document.getElementById("chatbot-container");
  chatbotToggle = document.getElementById("chatbot-toggle");
  chatbotClose = document.getElementById("chatbot-close");
  chatbotForm = document.getElementById("chatbot-form");
  messageInput = document.getElementById("chatbot-input");
  messagesList = document.getElementById("chatbot-messages");
  
  // 确保所有元素存在
  if (!chatbotToggle || !chatbotContainer || !messagesList) {
    console.error("聊天机器人元素不存在，跳过初始化");
    return;
  }
  
  // 清空现有消息，避免重复
  messagesList.innerHTML = "";
  
  // 绑定事件
  bindChatbotEvents();
  
  // 添加欢迎消息
  setTimeout(() => {
    // 先添加第一条消息
    addBotMessage("这是一个个人博客网站，博主是一名学生，热爱技术和创新。主要关注绘画、文字排版、人工智能、云计算和大数据领域。");
    
    // 延迟添加后续消息，营造打字效果
    setTimeout(() => {
      welcomeMessages.forEach((message, index) => {
        setTimeout(() => {
          addBotMessage(message);
          // 在最后一条消息后显示预设问题
          if (index === welcomeMessages.length - 1) {
            showPresetQuestions();
          }
        }, index * 300);
      });
    }, 300);
  }, 500);
}

// 绑定聊天机器人事件
function bindChatbotEvents() {
  // 切换聊天机器人显示/隐藏
  chatbotToggle.addEventListener("click", toggleChatbot);
  
  // 关闭聊天机器人
  chatbotClose.addEventListener("click", () => {
    chatbotContainer.classList.remove("active");
  });
  
  // 处理表单提交
  chatbotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });
}

// 切换聊天机器人显示/隐藏
function toggleChatbot() {
  chatbotContainer.classList.toggle("active");
  
  // 如果是打开状态，聚焦输入框
  if (chatbotContainer.classList.contains("active")) {
    if (messageInput) messageInput.focus();
    scrollToBottom();
  }
}

// 发送消息
function sendMessage() {
  if (!messageInput || !messageInput.value.trim()) return;
  
  const message = messageInput.value.trim();
  addUserMessage(message);
  messageInput.value = "";
  
  // 显示正在输入指示器
  showTypingIndicator();
  
  // 模拟延迟后回复
  setTimeout(() => {
    removeTypingIndicator();
    handleUserMessage(message);
  }, 1000);
}

// 处理用户消息
function handleUserMessage(message) {
  // 检查是否匹配预设问题
  const preset = presetQA.find(qa => 
    qa.question.toLowerCase().includes(message.toLowerCase()) || 
    message.toLowerCase().includes(qa.question.toLowerCase())
  );
  
  if (preset) {
    addBotMessage(preset.answer);
    return;
  }
  
  // 检查是否匹配响应列表
  let responseFound = false;
  for (let key in botResponses) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      addBotMessage(botResponses[key]);
      responseFound = true;
      break;
    }
  }
  
  // 如果没有匹配，显示默认回复
  if (!responseFound) {
    addBotMessage("抱歉，我还在学习中。您可以试试以下问题：");
    showPresetQuestions();
  }
}

// 添加用户消息
function addUserMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement("div");
  messageElement.className = "message user-message";
  messageElement.innerHTML = `<div class="message-content">${message}</div>`;
  messagesList.appendChild(messageElement);
  
  scrollToBottom();
}

// 添加机器人消息
function addBotMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement("div");
  messageElement.className = "message bot-message";
  messageElement.innerHTML = `<div class="message-content">${message}</div>`;
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
  
  presetQA.forEach(qa => {
    const questionButton = document.createElement("button");
    questionButton.className = "preset-question";
    questionButton.textContent = qa.question;
    questionButton.addEventListener("click", () => {
      addUserMessage(qa.question);
      
      // 显示正在输入指示器
      showTypingIndicator();
      
      // 模拟延迟后回复
      setTimeout(() => {
        removeTypingIndicator();
        addBotMessage(qa.answer);
      }, 800);
    });
    
    questionsElement.appendChild(questionButton);
  });
  
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
  const typingIndicator = document.getElementById("typing-indicator");
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

// 导出API以便全局访问
window.chatbotAPI = {
  init: initChatbot,
  toggle: toggleChatbot,
  addUserMessage,
  addBotMessage,
  handleUserMessage
}; 