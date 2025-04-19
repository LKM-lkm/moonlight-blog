/**
 * 聊天机器人脚本
 * 实现基本的聊天界面交互功能
 */

// DOM 元素
let chatbotToggle;
let chatbotContainer;
let chatbotMessages;
let chatbotForm;
let chatbotInput;
let chatbotClose;
let chatbotSubmit;

// 预设的回复
const responses = {
    '你好': '你好！欢迎使用我们的在线客服。有什么可以帮到您的吗？',
    '你是谁': '我是Moonlight博客的智能助手，可以回答您关于本站的问题，或者帮您导航至相关内容。',
    '网站': '这是一个名为Moonlight的个人博客系统，主要分享技术文章、生活感悟和各类有趣的内容。',
    '联系': '您可以通过页面底部的联系方式与管理员取得联系，或者发送邮件至lkm836972@outlook.com。',
    '微信': '您可以添加博主微信号：likeme2010Ming 进行联系。',
    '最新': '您可以点击首页的"最新文章"栏目，或者使用顶部导航栏的搜索功能，按发布日期排序。',
    '热门': '暂无，您可以在首页的"热门推荐"栏目寻找。',
    '再见': '感谢您的使用！如果还有其他问题，随时欢迎回来咨询。祝您有愉快的一天！',
    '谢谢': '不客气！很高兴能帮到您。还有其他问题吗？',
    '简介': '我是名，初三学生，热爱技术和创新，专注于绘画、文字排版，人工智能、云计算和大数据领域的研究与应用。喜欢探索新技术，用代码创造美好的数字世界。'
};

// 默认回复
const defaultResponse = '抱歉，我无法理解您的问题。您可以尝试询问关于网站的基本信息，或者使用更简单的表述方式。';

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    chatbotToggle = document.getElementById('chatbot-toggle');
    chatbotContainer = document.getElementById('chatbot-container');
    chatbotMessages = document.getElementById('chatbot-messages');
    chatbotForm = document.querySelector('.chatbot-form');
    chatbotInput = document.getElementById('chatbot-input');
    chatbotClose = document.getElementById('chatbot-close');
    chatbotSubmit = document.getElementById('chatbot-submit');

    if (!chatbotToggle || !chatbotContainer || !chatbotMessages || !chatbotForm || !chatbotInput || !chatbotClose || !chatbotSubmit) {
        console.error('聊天机器人初始化失败：找不到必要的DOM元素');
        return;
    }

    // 绑定事件
    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    chatbotForm.addEventListener('submit', handleSubmit);
    
    // 添加欢迎消息
    addBotMessage('你好！我是Moonlight的智能助手，很高兴为您服务。您可以询问我关于网站的任何问题。');
});

// 切换聊天窗口显示状态
function toggleChatbot() {
    chatbotContainer.classList.toggle('active');
    if (chatbotContainer.classList.contains('active')) {
        chatbotInput.focus();
        scrollToBottom();
    }
}

// 处理消息提交
function handleSubmit(e) {
    e.preventDefault();
    const message = chatbotInput.value.trim();
    
    if (message) {
        // 添加用户消息
        addUserMessage(message);
        chatbotInput.value = '';
        
        // 处理回复
        processUserMessage(message);
    }
}

// 添加用户消息
function addUserMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    chatbotMessages.appendChild(messageElement);
    scrollToBottom();
}

// 添加机器人消息
function addBotMessage(text, delay = 1000) {
    // 添加"正在输入"指示器
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = `
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    chatbotMessages.appendChild(typingIndicator);
    scrollToBottom();
    
    // 延迟后显示实际消息
    setTimeout(() => {
        chatbotMessages.removeChild(typingIndicator);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        chatbotMessages.appendChild(messageElement);
        scrollToBottom();
    }, delay);
}

// 处理用户消息
function processUserMessage(message) {
    let hasResponse = false;
    const lowerMessage = message.toLowerCase();
    
    // 检查是否有匹配的预设回复
    for (const key in responses) {
        if (lowerMessage.includes(key.toLowerCase())) {
            addBotMessage(responses[key]);
            hasResponse = true;
            break;
        }
    }
    
    // 如果没有匹配的预设回复，使用默认回复
    if (!hasResponse) {
        addBotMessage(defaultResponse);
    }
}

// 滚动到底部
function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}