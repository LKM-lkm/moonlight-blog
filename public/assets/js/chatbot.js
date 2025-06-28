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

// 统一问答结构，支持精确与模糊匹配
const presetQAList = [
  { question: ["你好"], answer: "你好！我是Moonlight助手，有什么可以帮您的吗？" },
  { question: ["介绍", "简介"], answer: "Moonlight是由名（Likem）搭建的个人博客项目，用于记录分享软件操作技巧、生活日常、技术学习等。" },
  { question: ["你是谁"], answer: "我是Moonlight助手，这个网站的问答机器人。" },
  { question: ["更多"], answer: "您好！Moonlight博客目前正在建设中，功能尚不完善，敬请期待！" },
  { question: ["帮助"], answer: "我可以帮您了解网站的功能、导航到特定页面，或者回答关于博客的问题。请告诉我您想了解什么？" },
  { question: ["博主是谁？", "博主"], answer: "博主热爱技术和创新，专注于AI、云计算和大数据、软件操作等。" },
  { question: ["联系", "如何联系站长？", "博主的联系方式有哪些？"], answer: "您可以通过页面底部的社交媒体链接或邮箱联系博主。" },
  { question: ["功能", "网站有哪些功能？"], answer: "本站支持文章浏览、评论、主题切换、聊天机器人等功能。" },
  { question: ["主题", "切换主题？", "如何切换深色/浅色主题？", "主题切换"], answer: "点击右上角的月亮/太阳图标即可切换明暗主题。" },
  { question: ["注册", "如何注册？"], answer: "目前本站暂未开放注册功能，敬请期待后续更新。" },
  { question: ["推荐文章", "有推荐的文章吗？"], answer: "您可以在首页查看最新文章，或通过导航栏的'文章'页面浏览所有文章。" },
  { question: ["技术栈", "博主的技术栈有哪些？"], answer: "前端：HTML5、CSS3、JavaScript、Vue、React；后端：PHP、Node.js、MySQL、Redis。" },
  { question: ["AI工具", "博主推荐哪些AI工具？"], answer: "推荐ChatGPT、Notion AI、FLUX、Stable Diffusion等。" },
  { question: ["数学公式", "博客支持哪些数学公式和代码高亮？"], answer: "支持LaTeX数学公式和多种编程语言的代码高亮。" },
  { question: ["代码高亮"], answer: "支持多种编程语言的代码高亮。" },
  { question: ["经验分享", "博主的学习/成长经历？"], answer: "博主正在学习中，热爱技术创新，喜欢分享和交流。" },
  { question: ["编程语言", "博主最喜欢的编程语言？"], answer: "最喜欢JavaScript和Python，简单高效，生态丰富。" },
  { question: ["书籍推荐", "博主推荐的书籍/资源？"], answer: "推荐《Behind Bars》《深入浅出Node.js》《人工智能简史》等。" },
  { question: ["移动端", "博客是否支持移动端访问？"], answer: "博客采用响应式设计，手机、平板均可流畅访问。" },
  { question: ["收藏", "如何收藏/分享文章？"], answer: "可通过浏览器自带的收藏功能或复制链接分享。" },
  { question: ["未来计划", "博主的未来计划是什么？"], answer: "持续优化博客功能，分享更多AI与软件操作技巧，欢迎关注！" }
];

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
      const msg = message.trim().toLowerCase();
      // 1. 精确匹配
      for (const qa of presetQAList) {
        for (const q of qa.question) {
          if (msg === q.toLowerCase()) {
            return qa.answer;
          }
        }
      }
      // 2. 模糊匹配
      for (const qa of presetQAList) {
        for (const q of qa.question) {
          if (msg.includes(q.toLowerCase()) || q.toLowerCase().includes(msg)) {
            return qa.answer;
          }
        }
      }
      // 3. 默认回复
      return '抱歉，我还在学习中，暂时无法回答这个问题。您可以尝试提问：' + presetQAList.slice(0, 3).map(qa => qa.question[0]).join(' / ');
    },
    showWelcome() {
      this.addMessage('你好，我是Moonlight助手，有什么可以帮您的吗？', 'bot');
    }
  };
  chatbot.init();
});

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