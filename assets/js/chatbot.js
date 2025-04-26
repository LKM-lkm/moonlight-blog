/**
 * 月光云海博客 - 聊天机器人功能
 * 提供聊天机器人界面和基本交互功能
 */

// 全局变量
let chatbotWrapper;
let chatbotContainer;
let chatbotToggle;
let messagesList;
let messageInput;
let sendButton;
let typingIndicator;

// 预设问题和回答
const presetQA = [
  {
    question: "这个博客是做什么的？",
    answer: "月光云海博客是一个现代化的个人博客系统，具有优雅的设计和丰富的功能。"
  },
  {
    question: "如何联系站长？",
    answer: "您可以通过页面底部的社交媒体链接或者发送邮件到站长邮箱联系我们。"
  },
  {
    question: "有推荐的文章吗？",
    answer: "您可以查看首页推荐栏目，那里有最新和最热门的文章推荐。"
  }
];

// DOM加载完成后初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

// 初始化聊天机器人
function initChatbot() {
  // 查找DOM元素
  chatbotWrapper = document.querySelector('.chatbot-wrapper');
  if (!chatbotWrapper) {
    console.warn('聊天机器人容器不存在，跳过初始化');
    return;
  }
  
  chatbotToggle = document.querySelector('.chatbot-toggle');
  chatbotContainer = document.querySelector('.chatbot-container');
  messagesList = document.querySelector('.chatbot-messages');
  messageInput = document.querySelector('.chatbot-input');
  sendButton = document.querySelector('.chatbot-send');
  typingIndicator = document.querySelector('.typing-indicator');
  
  // 绑定事件
  bindChatbotEvents();
  
  // 添加欢迎消息
  setTimeout(() => {
    addBotMessage("你好！欢迎来到月光云海博客。有什么可以帮助你的吗？");
    showPresetQuestions();
  }, 500);
}

// 绑定聊天机器人事件
function bindChatbotEvents() {
  // 切换聊天机器人显示/隐藏
  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', toggleChatbot);
  }
  
  // 发送消息
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }
  
  // 输入框按回车发送
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
}

// 切换聊天机器人显示/隐藏
function toggleChatbot() {
  if (chatbotContainer) {
    chatbotContainer.classList.toggle('active');
    chatbotToggle.classList.toggle('active');
    
    // 如果是首次打开，滚动到底部
    if (chatbotContainer.classList.contains('active')) {
      scrollToBottom();
    }
  }
}

// 发送消息
function sendMessage() {
  if (!messageInput || !messageInput.value.trim()) return;
  
  const message = messageInput.value.trim();
  addUserMessage(message);
  messageInput.value = '';
  
  // 显示正在输入指示器
  showTypingIndicator();
  
  // 模拟延迟后回复
  setTimeout(() => {
    hideTypingIndicator();
    processBotReply(message);
  }, 1000 + Math.random() * 1000);
}

// 处理机器人回复
function processBotReply(userMessage) {
  // 检查是否匹配预设问题
  const preset = presetQA.find(qa => 
    qa.question.toLowerCase().includes(userMessage.toLowerCase()) || 
    userMessage.toLowerCase().includes(qa.question.toLowerCase())
  );
  
  if (preset) {
    addBotMessage(preset.answer);
  } else {
    // 默认回复
    addBotMessage("感谢您的留言！我会尽快回复您的问题。您也可以尝试我们的预设问题。");
    showPresetQuestions();
  }
}

// 添加用户消息
function addUserMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message user-message';
  messageElement.innerHTML = `<p>${message}</p>`;
  messagesList.appendChild(messageElement);
  
  scrollToBottom();
}

// 添加机器人消息
function addBotMessage(message) {
  if (!messagesList) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message bot-message';
  messageElement.innerHTML = `<p>${message}</p>`;
  messagesList.appendChild(messageElement);
  
  scrollToBottom();
}

// 显示预设问题
function showPresetQuestions() {
  if (!messagesList) return;
  
  const questionsElement = document.createElement('div');
  questionsElement.className = 'preset-questions';
  
  presetQA.forEach(qa => {
    const questionButton = document.createElement('button');
    questionButton.className = 'preset-question';
    questionButton.textContent = qa.question;
    questionButton.addEventListener('click', () => {
      addUserMessage(qa.question);
      
      // 显示正在输入指示器
      showTypingIndicator();
      
      // 模拟延迟后回复
      setTimeout(() => {
        hideTypingIndicator();
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
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
  }
}

// 隐藏正在输入指示器
function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.style.display = 'none';
  }
}

// 滚动到底部
function scrollToBottom() {
  if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight;
  }
}

// 导出API以供其他模块使用
export {
  initChatbot,
  toggleChatbot,
  addUserMessage,
  addBotMessage
}; 