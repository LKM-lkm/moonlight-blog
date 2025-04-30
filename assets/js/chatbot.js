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
    answer: "这是一个个人博客网站，博主是一名学生，热爱技术和创新。主要关注绘画、文字排版，人工智能、云计算和大数据领域。"
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
const presetAnswers = {
  "你好": "你好！我是Moonlight助手，有什么可以帮您的吗？",
  "你是谁": "我是Moonlight助手，这个网站的问答机器人。",
  "更多": "您好！Moonlight博客目前正在建设中，功能尚不完善，敬请期待！",
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
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM加载完成，初始化聊天机器人...");
  initChatbot();
});

// 初始化聊天机器人
function initChatbot() {
  console.log("初始化聊天机器人...");
  
  // 查找DOM元素
  chatbotWrapper = document.querySelector(".chatbot-wrapper");
  chatbotContainer = document.querySelector(".chatbot-container");
  chatbotToggle = document.querySelector(".chatbot-toggle");
  chatbotClose = document.querySelector(".chatbot-close");
  chatbotForm = document.querySelector(".chatbot-form");
  messageInput = document.querySelector("#chatbot-input");
  messagesList = document.querySelector(".chatbot-messages");
  
  console.log("聊天机器人元素:", 
    chatbotWrapper ? "包装器OK" : "包装器不存在", 
    chatbotContainer ? "容器OK" : "容器不存在", 
    chatbotToggle ? "切换按钮OK" : "切换按钮不存在"
  );
  
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
  setTimeout(function() {
    // 先添加第一条消息
    addBotMessage(welcomeMessages[0]);
    
    // 延迟添加后续消息，营造打字效果
    for (let i = 1; i < welcomeMessages.length; i++) {
      setTimeout(() => {
        addBotMessage(welcomeMessages[i]);
        // 在最后一条消息后显示预设问题
        if (i === welcomeMessages.length - 1) {
          showPresetQuestions();
        }
      }, i * 300);
    }
  }, 500);
}

// 绑定聊天机器人事件
function bindChatbotEvents() {
  console.log("绑定聊天机器人事件...");
  
  if (chatbotToggle) {
    chatbotToggle.addEventListener('click', function(e) {
      console.log("点击聊天机器人切换按钮");
      e.preventDefault();
      toggleChatbot();
    });
  }
  
  if (chatbotClose) {
    chatbotClose.addEventListener('click', function(e) {
      console.log("点击关闭按钮");
      e.preventDefault();
      chatbotContainer.classList.remove("active");
    });
  }
  
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage();
    });
  }
  
  console.log("事件绑定完成");
}

// 切换聊天机器人显示/隐藏
function toggleChatbot() {
  console.log("切换聊天机器人状态");
  
  chatbotContainer.classList.toggle("active");
  
  // 如果是打开状态，聚焦输入框并滚动到底部
  if (chatbotContainer.classList.contains("active")) {
    if (messageInput) {
      messageInput.focus();
    }
    scrollToBottom();
  }
}

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