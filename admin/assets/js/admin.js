/**
 * 管理后台主要JavaScript文件
 */

import '../../assets/css/style.css';
import '../../assets/css/theme.css';
import '../../assets/css/login.css';

// 管理后台工具函数
var adminUtils = {
  showMessage: function(message, type) {
    var messageElement = document.createElement('div');
    messageElement.className = 'message message-' + (type || 'info');
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(function() { messageElement.remove(); }, 3000);
  },

  formatDate: function(date) {
    return new Date(date).toLocaleString();
  },

  debounce: function(func, wait) {
    var timeout;
    return function() {
      var args = arguments;
      var context = this;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// 管理后台主脚本
document.addEventListener('DOMContentLoaded', function() {
    console.log('管理后台已加载');
    
    // 初始化侧边栏
    initSidebar();
    
    // 初始化页面加载
    initPageLoad();
    
    // 初始化通用功能
    initCommonFeatures();
});

// 初始化侧边栏
function initSidebar() {
    var sidebar = document.querySelector('.admin-sidebar');
    var toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            document.querySelector('.admin-content').classList.toggle('expanded');
        });
    }
    
    // 处理菜单项高亮
    highlightCurrentMenuItem();
}

// 高亮当前菜单项
function highlightCurrentMenuItem() {
    var currentPath = window.location.pathname;
    var menuItems = document.querySelectorAll('.admin-menu a');
    
    menuItems.forEach(function(item) {
        var itemPath = item.getAttribute('href');
        if (currentPath.endsWith(itemPath)) {
            item.classList.add('active');
            
            // 如果在折叠菜单中，展开父菜单
            var parentLi = item.closest('li.has-submenu');
            if (parentLi) {
                parentLi.classList.add('expanded');
            }
        }
    });
}

// 初始化页面加载
function initPageLoad() {
    var contentLinks = document.querySelectorAll('.admin-menu a[data-target]');
    
    contentLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            var target = this.getAttribute('data-target');
            loadPageContent(target);
            
            // 更新URL，不刷新页面
            history.pushState({page: target}, '', this.getAttribute('href'));
            
            // 更新菜单高亮
            document.querySelectorAll('.admin-menu a').forEach(function(item) {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // 处理浏览器前进后退
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.page) {
            loadPageContent(e.state.page);
            highlightCurrentMenuItem();
        }
    });
}

// 加载页面内容
function loadPageContent(target) {
    var contentContainer = document.querySelector('.admin-content-inner');
    if (!contentContainer) return;
    
    // 显示加载中
    if (adminUtils && adminUtils.showLoading) {
        adminUtils.showLoading();
    }
    
    // 使用fetch加载页面内容
    fetch('pages/' + target + '.html')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('页面加载失败');
            }
            return response.text();
        })
        .then(function(html) {
            contentContainer.innerHTML = html;
            
            // 初始化新加载页面的脚本
            initPageScripts(target);
            
            // 隐藏加载中
            if (adminUtils && adminUtils.hideLoading) {
                adminUtils.hideLoading();
            }
        })
        .catch(function(error) {
            contentContainer.innerHTML = '<div class="error-message">加载页面时出错: ' + error.message + '</div>';
            
            // 隐藏加载中
            if (adminUtils && adminUtils.hideLoading) {
                adminUtils.hideLoading();
            }
            
            // 显示错误消息
            if (adminUtils && adminUtils.showMessage) {
                adminUtils.showMessage('页面加载失败: ' + error.message, 'error');
            }
        });
}

// 初始化页面特定脚本
function initPageScripts(pageId) {
    console.log('初始化页面脚本:', pageId);
    
    // 根据页面ID执行特定初始化
    switch(pageId) {
        case 'dashboard':
            initDashboard();
            break;
        case 'articles':
            initArticles();
            break;
        case 'users':
            initUsers();
            break;
        case 'settings':
            initSettings();
            break;
        // 可添加其他页面初始化
    }
}

// 初始化通用功能
function initCommonFeatures() {
    // 初始化顶部栏用户菜单
    var userMenuToggle = document.querySelector('.user-menu-toggle');
    var userMenu = document.querySelector('.user-dropdown');
    
    if (userMenuToggle && userMenu) {
        userMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            userMenu.classList.toggle('active');
        });
        
        // 点击外部关闭
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
    
    // 初始化深色模式切换
    initDarkModeToggle();
}

// 初始化深色模式切换
function initDarkModeToggle() {
    var darkModeToggle = document.getElementById('dark-mode-toggle');
    var savedTheme = localStorage.getItem('admin-theme');
    
    // 应用已保存的主题
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        if (savedTheme === 'dark-mode') {
            darkModeToggle.checked = true;
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // 跟随系统偏好
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // 切换事件
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');
                localStorage.setItem('admin-theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');
                localStorage.setItem('admin-theme', 'light-mode');
            }
        });
    }
}

// 全局管理应用对象
var adminApp = {
    showMessage: function(message, type) {
        if (adminUtils && adminUtils.showMessage) {
            adminUtils.showMessage(message, type);
        }
    },
    
    formatDate: function(date) {
        if (adminUtils && adminUtils.formatDate) {
            return adminUtils.formatDate(date);
        }
        return date;
    },
    
    debounce: function(func, wait) {
        if (adminUtils && adminUtils.debounce) {
            return adminUtils.debounce(func, wait);
        }
        return func;
    }
};

// 检查用户登录状态
function checkAuthStatus() {
    try {
        fetch('/admin/api/auth/check.php')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (!data.success) {
                    window.location.href = '/admin/login/';
                    return false;
                }
                return true;
            })
            .catch(function(error) {
                console.error('检查登录状态失败:', error);
                adminUtils.showMessage('检查登录状态失败，请刷新页面重试', 'error');
                return false;
            });
    } catch (error) {
        console.error('检查登录状态失败:', error);
        return false;
    }
}

// 初始化用户菜单
function initUserMenu() {
    var userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            userMenu.classList.toggle('active');
        });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }
}

// 处理退出登录
function handleLogout() {
    fetch('/admin/api/auth/logout.php', {
        method: 'POST',
        credentials: 'same-origin'
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            window.location.href = '/admin/login/';
        } else {
            adminUtils.showMessage(data.message || '退出失败，请重试', 'error');
        }
    })
    .catch(function(error) {
        console.error('退出登录失败:', error);
        adminUtils.showMessage('退出登录失败，请重试', 'error');
    });
} 