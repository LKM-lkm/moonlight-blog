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
  { question: "有推荐的文章吗？", answer: "您可以在首页查看最新文章，或通过导航栏的'文章'页面浏览所有文章。" },
  { question: "Moonlight博客的主要内容是什么？", answer: "Moonlight博客主要分享AI、前端开发、云计算、生活随笔等内容。" },
  { question: "博主的技术栈有哪些？", answer: "前端：HTML5、CSS3、JavaScript、Vue、React；后端：PHP、Node.js、MySQL、Redis；云服务：Cloudflare、Vercel等。" },
  { question: "如何投稿或参与博客内容建设？", answer: "目前暂不开放投稿，后续会考虑开放社区投稿功能，敬请期待。" },
  { question: "博主推荐哪些AI工具？", answer: "推荐ChatGPT、Notion AI、Midjourney、Stable Diffusion等。" },
  { question: "博客支持哪些数学公式和代码高亮？", answer: "支持LaTeX数学公式和多种编程语言的代码高亮。" },
  { question: "如何切换深色/浅色主题？", answer: "点击右上角的月亮/太阳图标即可一键切换。" },
  { question: "博主的联系方式有哪些？", answer: "可通过GitHub、B站、邮箱等方式联系，详见首页社交链接。" },
  { question: "博主的学习/成长经历？", answer: "博主自学编程多年，热爱技术创新，喜欢分享和交流。" },
  { question: "博主最喜欢的编程语言？", answer: "最喜欢JavaScript和Python，简单高效，生态丰富。" },
  { question: "博主推荐的书籍/资源？", answer: "推荐《JavaScript高级程序设计》《深入浅出Node.js》《人工智能简史》等。" },
  { question: "博客是否支持移动端访问？", answer: "支持，博客采用响应式设计，手机、平板均可流畅访问。" },
  { question: "如何收藏/分享文章？", answer: "可通过浏览器自带的收藏功能或复制链接分享。" },
  { question: "博主的未来计划是什么？", answer: "持续优化博客功能，分享更多AI与前端开发内容，欢迎关注！" }
];

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
  "推荐文章": "您可以在首页查看最新文章，或通过导航栏的'文章'页面浏览所有文章。",
  "技术栈": "前端：HTML5、CSS3、JavaScript、Vue、React；后端：PHP、Node.js、MySQL、Redis。",
  "AI工具": "推荐ChatGPT、Notion AI、Midjourney、Stable Diffusion等。",
  "数学公式": "支持LaTeX数学公式，详情见文章页。",
  "代码高亮": "支持多种编程语言的代码高亮。",
  "主题切换": "点击右上角的月亮/太阳图标即可一键切换。",
  "经验分享": "博主自学编程多年，热爱技术创新，喜欢分享和交流。",
  "编程语言": "最喜欢JavaScript和Python，简单高效，生态丰富。",
  "书籍推荐": "推荐《JavaScript高级程序设计》《深入浅出Node.js》《人工智能简史》等。",
  "移动端": "博客采用响应式设计，手机、平板均可流畅访问。",
  "收藏": "可通过浏览器自带的收藏功能或复制链接分享。",
  "未来计划": "持续优化博客功能，分享更多AI与前端开发内容，欢迎关注！"
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
      const msg = message.trim().toLowerCase();
      // 1. 关键词精确匹配 presetAnswers
      for (const key in presetAnswers) {
        if (msg === key.toLowerCase() || msg.includes(key.toLowerCase())) {
          return presetAnswers[key];
        }
      }
      // 2. 智能模糊匹配 presetQA
      for (const qa of presetQA) {
        const q = qa.question.trim().toLowerCase();
        if (msg === q || msg.includes(q) || q.includes(msg)) {
          return qa.answer;
        }
      }
      // 3. 默认回复
      return '抱歉，我还在学习中，暂时无法回答这个问题。您可以尝试提问：' + presetQA.slice(0, 3).map(qa => qa.question).join(' / ');
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