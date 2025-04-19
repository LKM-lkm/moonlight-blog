class ChatBot {
    constructor() {
        this.container = null;
        this.messagesContainer = null;
        this.input = null;
        this.sendButton = null;
        this.closeButton = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // 创建聊天界面
        this.createChatInterface();
        
        // 绑定事件
        this.bindEvents();
        
        // 添加欢迎消息
        this.addMessage('你好！欢迎来到Moonlight博客。', 'bot');
        
        this.isInitialized = true;
    }

    createChatInterface() {
        // 创建聊天容器
        this.container = document.createElement('div');
        this.container.className = 'chat-container';
        
        // 创建聊天头部
        const header = document.createElement('div');
        header.className = 'chat-header';
        header.innerHTML = `
            <h3>Moonlight助手</h3>
            <button class="close-chat" aria-label="关闭聊天">×</button>
        `;
        
        // 创建消息容器
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'chat-messages';
        
        // 创建输入区域
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-input';
        inputContainer.innerHTML = `
            <input type="text" placeholder="请输入您的问题..." aria-label="聊天输入框">
            <button class="send-message" aria-label="发送消息">
                <i class="fas fa-paper-plane"></i>
            </button>
        `;
        
        // 组装界面
        this.container.appendChild(header);
        this.container.appendChild(this.messagesContainer);
        this.container.appendChild(inputContainer);
        
        // 获取元素引用
        this.input = inputContainer.querySelector('input');
        this.sendButton = inputContainer.querySelector('.send-message');
        this.closeButton = header.querySelector('.close-chat');
        
        // 添加到页面
        document.body.appendChild(this.container);
    }

    bindEvents() {
        // 发送消息事件
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // 关闭聊天窗口
        this.closeButton.addEventListener('click', () => {
            this.container.style.display = 'none';
        });
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // 添加用户消息
        this.addMessage(message, 'user');
        
        // 清空输入框
        this.input.value = '';
        
        // 禁用发送按钮
        this.sendButton.disabled = true;
        
        try {
            // 发送请求到服务器
            const response = await fetch('/admin/api/chat/bot.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 添加机器人回复
                this.addMessage(data.message, 'bot');
            } else {
                throw new Error(data.message || '发送失败');
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessage('抱歉，我暂时无法回复，请稍后再试。', 'bot');
        } finally {
            // 启用发送按钮
            this.sendButton.disabled = false;
        }
    }

    addMessage(text, type) {
        const message = document.createElement('div');
        message.className = `message ${type}-message`;
        message.textContent = text;
        
        this.messagesContainer.appendChild(message);
        
        // 滚动到底部
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// 初始化聊天机器人
document.addEventListener('DOMContentLoaded', () => {
    const chatBot = new ChatBot();
    chatBot.init();
}); 