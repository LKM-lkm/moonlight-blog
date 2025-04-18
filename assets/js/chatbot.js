/**
 * 聊天机器人脚本
 * 实现基本的聊天界面交互功能
 */

// 聊天机器人DOM元素
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');

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
function initChatbot() {
    // 聊天框开关事件
    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);
    
    // 发送消息事件
    chatbotForm.addEventListener('submit', handleMessageSubmit);
    
    // 添加欢迎消息
    addWelcomeMessage();
    
    // 存储聊天记录
    loadChatHistory();
}

// 打开/关闭聊天框
function toggleChatbot() {
    chatbotContainer.classList.toggle('active');
    chatbotToggle.classList.toggle('active');
    
    // 如果打开聊天框，则聚焦到输入框
    if (chatbotContainer.classList.contains('active')) {
        chatbotInput.focus();
        // 滚动到最新消息
        scrollToBottom();
    }
}

// 处理消息提交
function handleMessageSubmit(e) {
    e.preventDefault();
    
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // 添加用户消息
    addUserMessage(message);
    
    // 清空输入框
    chatbotInput.value = '';
    
    // 显示"正在输入"指示器
    showTypingIndicator();
    
    // 模拟延迟后响应
    setTimeout(() => {
        removeTypingIndicator();
        processUserMessage(message);
    }, 1000);
}

// 添加用户消息
function addUserMessage(text) {
    const messageElement = createMessageElement('user', text);
    chatbotMessages.appendChild(messageElement);
    scrollToBottom();
    
    // 保存聊天记录
    saveChatHistory();
}

// 添加机器人消息
function addBotMessage(text, delay = 0) {
    // 添加"正在输入"指示器
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatbotMessages.appendChild(typingIndicator);
    scrollToBottom();
    
    // 延迟后显示实际消息
    setTimeout(() => {
        // 移除"正在输入"指示器
        chatbotMessages.removeChild(typingIndicator);
        
        // 添加机器人消息
        const messageElement = createMessageElement('bot', text);
        chatbotMessages.appendChild(messageElement);
        scrollToBottom();
        
        // 保存聊天记录
        saveChatHistory();
    }, delay || 1000);
}

// 创建消息元素
function createMessageElement(type, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    const icon = document.createElement('i');
    icon.className = type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    avatar.appendChild(icon);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    content.appendChild(paragraph);
    
    messageElement.appendChild(avatar);
    messageElement.appendChild(content);
    
    return messageElement;
}

// 处理用户消息
function processUserMessage(message) {
    let hasResponse = false;
    
    // 检查是否有匹配的预设回复
    for (const key in responses) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
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

// 添加欢迎消息
function addWelcomeMessage() {
    setTimeout(() => {
        addBotMessage('你好！欢迎来到Moonlight博客。有什么可以帮到您的吗？');
    }, 500);
}

// 显示"正在输入"指示器
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.id = 'typing-indicator';
    typingElement.className = 'message bot-message typing';
    typingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatbotMessages.appendChild(typingElement);
    scrollToBottom();
}

// 移除"正在输入"指示器
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// 保存聊天记录
function saveChatHistory() {
    const messages = chatbotMessages.innerHTML;
    localStorage.setItem('chatHistory', messages);
}

// 加载聊天记录
function loadChatHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatbotMessages.innerHTML = savedHistory;
    }
}

// 页面加载时初始化聊天机器人
document.addEventListener('DOMContentLoaded', initChatbot);