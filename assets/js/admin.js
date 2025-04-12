// 管理后台的主要功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化主题设置
    initTheme();
    
    // 初始化侧边栏切换
    initSidebarToggle();
    
    // 初始化导航切换
    initNavigation();
    
    // 加载仪表盘数据
    if (document.getElementById('dashboard-section')) {
        loadDashboardData();
    }
    
    // 加载文章列表
    if (document.getElementById('articles-section')) {
        loadArticles();
    }
    
    // 加载个人信息
    if (document.getElementById('profile-section')) {
        loadProfileData();
    }
    
    // 加载聊天机器人数据
    if (document.getElementById('chatbot-section')) {
        loadChatbotData();
    }
    
    // 设置当前年份
    document.getElementById('year').textContent = new Date().getFullYear();
});

// 检查登录状态
function checkLoginStatus() {
    // 在实际应用中,这里应该检查用户是否已登录
    // 如果未登录,则重定向到登录页面
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // 如果当前不是登录页面,且未登录,则重定向到登录页面
    if (!isLoggedIn && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// 初始化主题设置
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const currentTheme = localStorage.getItem('theme') || 'auto';
    document.body.className = `theme-${currentTheme}`;
    
    // 根据当前主题更新图标
    updateThemeIcon();
    
    themeToggle.addEventListener('click', function() {
        let newTheme;
        const currentTheme = localStorage.getItem('theme') || 'auto';
        
        if (currentTheme === 'auto') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'light';
        } else {
            newTheme = 'auto';
        }
        
        localStorage.setItem('theme', newTheme);
        document.body.className = `theme-${newTheme}`;
        
        // 更新主题图标
        updateThemeIcon();
    });
}

// 更新主题图标
function updateThemeIcon() {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (!themeIcon) return;
    
    const currentTheme = localStorage.getItem('theme') || 'auto';
    
    if (currentTheme === 'auto') {
        themeIcon.className = 'fas fa-adjust';
    } else if (currentTheme === 'dark') {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
}

// 初始化侧边栏切换
function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!sidebarToggle || !sidebar) return;
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// 初始化导航切换
function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    if (!navLinks.length) return;
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 获取目标部分
            const targetSection = this.getAttribute('data-section');
            
            // 隐藏所有部分
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // 显示目标部分
            document.getElementById(`${targetSection}-section`).classList.add('active');
            
            // 更新页面标题
            document.getElementById('page-title').textContent = this.querySelector('span').textContent;
        });
    });
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        // 在实际应用中,这里应该从后端 API 获取数据
        // 这里我们使用模拟数据
        const dashboardData = {
            totalArticles: 24,
            totalChats: 152,
            totalFiles: 37,
            lastUpdate: '2023-10-15'
        };
        
        // 更新统计数据
        document.getElementById('total-articles').textContent = dashboardData.totalArticles;
        document.getElementById('total-chats').textContent = dashboardData.totalChats;
        document.getElementById('total-files').textContent = dashboardData.totalFiles;
        document.getElementById('last-update').textContent = formatDate(dashboardData.lastUpdate);
        
        // 加载最近文章
        const recentArticles = [
            { title: '探索人工智能的未来发展', date: '2023-10-10' },
            { title: '云计算技术在现代企业中的应用', date: '2023-09-28' },
            { title: '大数据分析:挑战与机遇', date: '2023-09-15' }
        ];
        
        const recentArticlesList = document.getElementById('recent-articles');
        recentArticlesList.innerHTML = '';
        
        recentArticles.forEach(article => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-title">${article.title}</span>
                <span class="item-date">${formatDate(article.date)}</span>
            `;
            recentArticlesList.appendChild(li);
        });
        
        // 加载最近聊天
        const recentChats = [
            { user: '访客123', preview: '你好，我想了解更多关于人工智能的信息', date: '2023-10-14' },
            { user: '访客456', preview: '这篇文章写得很好，我有一些问题想请教', date: '2023-10-12' },
            { user: '访客789', preview: '你能推荐一些关于数据科学的资源吗?', date: '2023-10-09' }
        ];
        
        const recentChatsList = document.getElementById('recent-chats');
        recentChatsList.innerHTML = '';
        
        recentChats.forEach(chat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="item-title">${chat.user}: ${chat.preview}</span>
                <span class="item-date">${formatDate(chat.date)}</span>
            `;
            recentChatsList.appendChild(li);
        });
        
    } catch (error) {
        console.error('加载仪表盘数据时出错:', error);
    }
}

// 加载文章列表
async function loadArticles() {
    try {
        // 在实际应用中,这里应该从后端 API 获取数据
        // 这里我们使用模拟数据
        const articles = [
            { 
                id: 1, 
                title: '探索人工智能的未来发展', 
                date: '2023-10-10',
                readTime: '10分钟',
                status: '已发布'
            },
            { 
                id: 2, 
                title: '云计算技术在现代企业中的应用', 
                date: '2023-09-28',
                readTime: '15分钟',
                status: '已发布'
            },
            { 
                id: 3, 
                title: '大数据分析:挑战与机遇', 
                date: '2023-09-15',
                readTime: '12分钟',
                status: '草稿'
            },
            { 
                id: 4, 
                title: '物联网如何改变我们的生活', 
                date: '2023-09-05',
                readTime: '8分钟',
                status: '已发布'
            },
            { 
                id: 5, 
                title: '区块链技术的应用场景', 
                date: '2023-08-20',
                readTime: '20分钟',
                status: '已发布'
            }
        ];
        
        const articlesTbody = document.getElementById('articles-tbody');
        articlesTbody.innerHTML = '';
        
        articles.forEach(article => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${article.title}</td>
                <td>${formatDate(article.date)}</td>
                <td>${article.readTime}</td>
                <td>
                    <span class="status-badge ${article.status === '已发布' ? 'published' : 'draft'}">
                        ${article.status}
                    </span>
                </td>
                <td>
                    <div class="article-actions">
                        <button class="edit-btn" data-id="${article.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${article.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            articlesTbody.appendChild(tr);
        });
        
        // 添加编辑和删除按钮的事件监听
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.getAttribute('data-id');
                window.location.href = `editor.html?id=${articleId}`;
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const articleId = this.getAttribute('data-id');
                if (confirm('确定要删除这篇文章吗?')) {
                    deleteArticle(articleId);
                }
            });
        });
        
    } catch (error) {
        console.error('加载文章列表时出错:', error);
    }
}

// 删除文章
async function deleteArticle(id) {
    try {
        // 在实际应用中,这里应该向后端 API 发送删除请求
        console.log(`删除文章 ID: ${id}`);
        
        // 从DOM中移除该行
        const row = document.querySelector(`.delete-btn[data-id="${id}"]`).closest('tr');
        row.remove();
        
        // 显示成功消息
        alert('文章已成功删除!');
        
    } catch (error) {
        console.error('删除文章时出错:', error);
        alert('删除文章时出错，请稍后再试');
    }
}

// 加载个人信息
async function loadProfileData() {
    try {
        // 在实际应用中,这里应该从后端 API 获取数据
        // 这里我们使用模拟数据
        const profileData = {
            name: '名',
            bio: '初三学生，热爱技术和创新，专注于绘画、文字排版、人工智能、编程、云计算和大数据领域的研究与应用。',
            focus: '绘画，文字排版，人工智能，编程，云计算，大数据',
            email: 'lkm836972@outlook.com/gmail.com/qq.com',
            socialLinks: [
                { platform: 'github', url: 'https://github.com/LKM-lkm' },
                { platform: 'twitter', url: 'https://twitter.com/moonlight' },
                { platform: 'weixin', url: 'moonlight_wechat' }
            ]
        };
        
        // 更新表单字段
        document.getElementById('profile-name').value = profileData.name;
        document.getElementById('profile-bio').value = profileData.bio;
        document.getElementById('profile-focus').value = profileData.focus;
        document.getElementById('profile-email').value = profileData.email;
        
        // 更新社交链接
        const socialLinksContainer = document.querySelector('.social-links-editor');
        socialLinksContainer.innerHTML = '';
        
        profileData.socialLinks.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.className = 'social-link-item';
            linkItem.innerHTML = `
                <select class="social-platform">
                    <option value="github" ${link.platform === 'github' ? 'selected' : ''}>GitHub</option>
                    <option value="twitter" ${link.platform === 'twitter' ? 'selected' : ''}>Twitter</option>
                    <option value="weixin" ${link.platform === 'weixin' ? 'selected' : ''}>微信</option>
                    <option value="weibo" ${link.platform === 'weibo' ? 'selected' : ''}>微博</option>
                </select>
                <input type="text" class="social-url" value="${link.url}" placeholder="链接地址">
                <button type="button" class="remove-social-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            socialLinksContainer.appendChild(linkItem);
        });
        
        // 添加"添加链接"按钮
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.id = 'add-social-btn';
        addButton.className = 'btn secondary-btn';
        addButton.innerHTML = '<i class="fas fa-plus"></i> 添加链接';
        socialLinksContainer.appendChild(addButton);
        
        // 添加按钮点击事件
        addButton.addEventListener('click', function() {
            addSocialLinkItem();
        });
        
        // 添加删除按钮事件
        document.querySelectorAll('.remove-social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.social-link-item').remove();
            });
        });
        
    } catch (error) {
        console.error('加载个人信息时出错:', error);
    }
}

// 添加社交链接项
function addSocialLinkItem() {
    const socialLinksContainer = document.querySelector('.social-links-editor');
    const addButton = document.getElementById('add-social-btn');
    
    const linkItem = document.createElement('div');
    linkItem.className = 'social-link-item';
    linkItem.innerHTML = `
        <select class="social-platform">
            <option value="github">GitHub</option>
            <option value="twitter">Twitter</option>
            <option value="weixin">微信</option>
            <option value="weibo">微博</option>
        </select>
        <input type="text" class="social-url" placeholder="链接地址">
        <button type="button" class="remove-social-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 在添加按钮之前插入新的链接项
    socialLinksContainer.insertBefore(linkItem, addButton);
    
    // 添加删除按钮事件
    linkItem.querySelector('.remove-social-btn').addEventListener('click', function() {
        linkItem.remove();
    });
}

// 加载聊天机器人数据
async function loadChatbotData() {
    try {
        // 在实际应用中,这里应该从后端 API 获取数据
        // 这里我们使用模拟数据
        const chatbotData = {
            name: '月光助手',
            greeting: '你好!我是月光助手,很高兴为你解答问题。',
            personality: 'friendly'
        };
        
        // 更新表单字段
        document.getElementById('chatbot-name').value = chatbotData.name;
        document.getElementById('chatbot-greeting').value = chatbotData.greeting;
        document.getElementById('chatbot-personality').value = chatbotData.personality;
        
        // 加载聊天历史
        const chatHistory = [
            { 
                id: 1,
                user: '访客123',
                date: '2023-10-14 15:30',
                messages: [
                    { sender: 'user', content: '你好，我想了解更多关于人工智能的信息' },
                    { sender: 'bot', content: '你好!很高兴为你介绍人工智能。人工智能是计算机科学的一个分支，致力于创造能够模拟人类智能行为的系统。它包括机器学习、自然语言处理、计算机视觉等多个领域。你对哪个方面特别感兴趣?' }
                ]
            },
            { 
                id: 2,
                user: '访客456',
                date: '2023-10-12 09:45',
                messages: [
                    { sender: 'user', content: '这篇文章写得很好，我有一些问题想请教' },
                    { sender: 'bot', content: '谢谢你的赞赏!我很乐意回答你的问题。请问你具体想了解什么?' }
                ]
            },
            { 
                id: 3,
                user: '访客789',
                date: '2023-10-09 17:20',
                messages: [
                    { sender: 'user', content: '你能推荐一些关于数据科学的资源吗?' },
                    { sender: 'bot', content: '当然可以!对于数据科学，我推荐以下资源：1. Kaggle平台 - 提供数据集和竞赛；2. DataCamp - 交互式学习平台；3. "Python for Data Analysis"这本书；4. Coursera上的"Data Science Specialization"课程。这些资源涵盖了不同难度级别，希望能对你有所帮助!' }
                ]
            }
        ];
        
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';
        
        chatHistory.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = chat.id;
            
            // 获取第一条用户消息作为预览
            const previewMessage = chat.messages.find(m => m.sender === 'user')?.content || '';
            
            chatItem.innerHTML = `
                <div class="chat-item-header">
                    <h4>${chat.user}</h4>
                    <span class="chat-date">${chat.date}</span>
                </div>
                <div class="chat-preview">${previewMessage}</div>
                <button class="view-chat-btn btn secondary-btn">查看完整对话</button>
            `;
            
            chatList.appendChild(chatItem);
        });
        
        // 添加查看按钮事件
        document.querySelectorAll('.view-chat-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const chatId = this.closest('.chat-item').dataset.id;
                viewChatDetail(chatId, chatHistory);
            });
        });
        
    } catch (error) {
        console.error('加载聊天机器人数据时出错:', error);
    }
}

// 查看聊天详情
function viewChatDetail(chatId, chatHistory) {
    const chat = chatHistory.find(c => c.id == chatId);
    if (!chat) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content glass-panel">
            <div class="modal-header">
                <h3>与 ${chat.user} 的对话</h3>
                <button class="close-modal-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="chat-messages">
                    ${chat.messages.map(msg => `
                        <div class="chat-message ${msg.sender}">
                            <div class="message-content">
                                <p>${msg.content}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn primary-btn delete-chat-btn" data-id="${chatId}">
                    <i class="fas fa-trash"></i> 删除对话
                </button>
                <button class="btn secondary-btn close-btn">关闭</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭按钮事件
    modal.querySelector('.close-modal-btn').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('.close-btn').addEventListener('click', function() {
        modal.remove();
    });
    
    // 添加删除按钮事件
    modal.querySelector('.delete-chat-btn').addEventListener('click', function() {
        const chatId = this.getAttribute('data-id');
        if (confirm('确定要删除这个对话吗?')) {
            deleteChat(chatId);
            modal.remove();
        }
    });
}

// 删除聊天记录
async function deleteChat(id) {
    try {
        // 在实际应用中,这里应该向后端 API 发送删除请求
        console.log(`删除聊天记录 ID: ${id}`);
        
        // 从DOM中移除该项
        const chatItem = document.querySelector(`.chat-item[data-id="${id}"]`);
        if (chatItem) {
            chatItem.remove();
        }
        
        // 显示成功消息
        alert('聊天记录已成功删除!');
        
    } catch (error) {
        console.error('删除聊天记录时出错:', error);
        alert('删除聊天记录时出错，请稍后再试');
    }
}

// 日期格式化工具函数
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 登录处理
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        // 清除之前的错误信息
        errorMessage.textContent = '';
        
        // 使用固定的用户名和密码
        if (username === 'Likem' && password === 'lkm123') {
            // 登录成功
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify({
                username: 'Likem',
                role: 'admin'
            }));
            window.location.href = 'index.html';
        } else {
            // 登录失败
            errorMessage.textContent = '用户名或密码错误';
        }
    });
}

// 注销处理
if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', function() {
        // 清除登录状态
        localStorage.removeItem('isLoggedIn');
        // 跳转到登录页面
        window.location.href = 'login.html';
    });
}