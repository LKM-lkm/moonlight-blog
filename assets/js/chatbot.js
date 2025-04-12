// 聊天机器人功能

document.addEventListener('DOMContentLoaded', () => {
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const sendMessageBtn = document.getElementById('send-message');

    // 加载历史对话
    loadConversations();

    // 发送消息按钮点击事件
    sendMessageBtn.addEventListener('click', handleSendMessage);

    // 输入框按回车键发送
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });
});

// 处理发送消息
function handleSendMessage() {
    const userMessage = chatbotInput.value.trim();

    if (userMessage === '') return;

    // 添加用户消息到聊天界面
    addMessageToChat('user', userMessage);

    // 清空输入框
    chatbotInput.value = '';

    // 显示机器人正在输入状态
    showBotTyping();

    // 发送消息到服务器
    sendMessageToBot(userMessage);
}

// 发送消息到机器人
async function sendMessageToBot(message) {
    try {
        // 向后端发送请求
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('无法获取机器人响应');
        }

        const botResponse = await response.json();

        // 移除机器人正在输入状态
        removeBotTyping();

        // 添加机器人回复到聊天界面
        addMessageToChat('bot', botResponse.reply);

        // 保存对话记录
        saveConversation('user', message);
        saveConversation('bot', botResponse.reply);
    } catch (error) {
        console.error('发送消息时出错:', error);

        // 移除机器人正在输入状态
        removeBotTyping();

        // 显示错误消息
        addMessageToChat('bot', '抱歉，我暂时无法处理你的请求。请稍后再试。');
    }
}

// 添加消息到聊天界面
function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatarIcon = role === 'bot' ? 'fas fa-robot' : 'fas fa-user';

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <p>${content}</p>
        </div>
    `;

    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // 滚动到最新消息
}

// 显示机器人正在输入状态
function showBotTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'bot-typing';

    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // 滚动到最新消息
}

// 移除机器人正在输入状态
function removeBotTyping() {
    const typingIndicator = document.getElementById('bot-typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 加载历史对话
async function loadConversations() {
    try {
        const response = await fetch('/api/chatbot/conversations');
        if (response.ok) {
            const data = await response.json();
            data.conversations.forEach(conversation => {
                addMessageToChat(conversation.role, conversation.content);
            });
        } else {
            console.error('加载对话历史时出错');
        }
    } catch (error) {
        console.error('加载对话历史时出错:', error);
    }
}

// 保存对话记录
async function saveConversation(role, content) {
    try {
        const conversation = {
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        };

        await fetch('/api/chatbot/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(conversation)
        });

        console.log('保存对话:', conversation);
    } catch (error) {
        console.error('保存对话时出错:', error);
    }
}