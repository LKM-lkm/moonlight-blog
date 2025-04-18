/**
 * 系统设置页面JavaScript
 * 
 * 处理系统设置页面的交互逻辑，包括：
 * - 面板切换
 * - 表单处理
 * - 文件上传
 * - 设置保存
 * - 备份管理
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化设置页面
    initSettingsPage();
    
    // 初始化表单
    initForms();
    
    // 初始化文件上传
    initFileUploads();
    
    // 初始化密码显示切换
    initPasswordToggles();
    
    // 初始化存储类型切换
    initStorageTypeSwitch();
    
    // 初始化备份操作
    initBackupOperations();
});

/**
 * 初始化设置页面
 */
function initSettingsPage() {
    // 获取所有导航项和面板
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.settings-panel');
    
    // 为每个导航项添加点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 获取目标面板
            const targetPanel = document.querySelector(`.settings-panel[data-panel="${this.dataset.panel}"]`);
            
            if (!targetPanel) return;
            
            // 移除所有导航项的active类
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 隐藏所有面板
            panels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
            
            // 激活当前导航项
            this.classList.add('active');
            
            // 显示目标面板
            targetPanel.classList.add('active');
            targetPanel.style.display = 'block';
            
            // 更新URL哈希
            window.location.hash = this.dataset.panel;
        });
    });
    
    // 根据URL哈希显示对应面板
    if (window.location.hash) {
        const targetPanel = window.location.hash.substring(1);
        const navItem = document.querySelector(`.nav-item[data-panel="${targetPanel}"]`);
        
        if (navItem) {
            navItem.click();
        }
    } else {
        // 默认显示第一个面板
        navItems[0].click();
    }
}

/**
 * 初始化表单
 */
function initForms() {
    // 获取所有表单
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // 为表单添加提交事件
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = new FormData(this);
            const data = {};
            
            // 转换FormData为对象
            for (const [key, value] of formData.entries()) {
                // 处理复选框
                if (formData.getAll(key).length > 1) {
                    data[key] = formData.getAll(key);
                } else {
                    data[key] = value;
                }
            }
            
            // 获取设置类型
            const type = this.dataset.type;
            
            // 显示加载状态
            showLoading('正在保存设置...');
            
            // 发送请求
            fetch(`/api/settings/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                // 隐藏加载状态
                hideLoading();
                
                if (result.status === 200) {
                    // 显示成功消息
                    showMessage('success', result.message);
                } else {
                    // 显示错误消息
                    showMessage('error', result.message);
                }
            })
            .catch(error => {
                // 隐藏加载状态
                hideLoading();
                
                // 显示错误消息
                showMessage('error', '保存设置失败: ' + error.message);
            });
        });
        
        // 为重置按钮添加点击事件
        const resetBtn = form.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                // 确认重置
                if (confirm('确定要重置此表单吗？所有更改将丢失。')) {
                    form.reset();
                }
            });
        }
    });
}

/**
 * 初始化文件上传
 */
function initFileUploads() {
    // 获取所有文件上传控件
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        // 为文件输入添加change事件
        input.addEventListener('change', function() {
            // 获取文件
            const file = this.files[0];
            
            if (!file) return;
            
            // 验证文件类型
            const allowedTypes = this.dataset.allowedTypes ? this.dataset.allowedTypes.split(',') : [];
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
                showMessage('error', '不支持的文件类型');
                this.value = '';
                return;
            }
            
            // 验证文件大小
            const maxSize = this.dataset.maxSize ? parseInt(this.dataset.maxSize) : 5 * 1024 * 1024; // 默认5MB
            if (file.size > maxSize) {
                showMessage('error', '文件大小超过限制');
                this.value = '';
                return;
            }
            
            // 显示加载状态
            showLoading('正在上传文件...');
            
            // 创建FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', this.dataset.uploadType);
            
            // 发送请求
            fetch('/api/settings/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                // 隐藏加载状态
                hideLoading();
                
                if (result.status === 200) {
                    // 更新预览
                    const preview = document.querySelector(`#${this.dataset.preview}`);
                    if (preview) {
                        if (preview.tagName === 'IMG') {
                            preview.src = result.data.url;
                        } else {
                            preview.textContent = result.data.filename;
                        }
                    }
                    
                    // 更新隐藏输入
                    const hiddenInput = document.querySelector(`#${this.dataset.target}`);
                    if (hiddenInput) {
                        hiddenInput.value = result.data.url;
                    }
                    
                    // 显示成功消息
                    showMessage('success', '文件上传成功');
                } else {
                    // 显示错误消息
                    showMessage('error', result.message);
                }
            })
            .catch(error => {
                // 隐藏加载状态
                hideLoading();
                
                // 显示错误消息
                showMessage('error', '文件上传失败: ' + error.message);
            });
        });
    });
}

/**
 * 初始化密码显示切换
 */
function initPasswordToggles() {
    // 获取所有密码显示切换按钮
    const toggles = document.querySelectorAll('.password-toggle');
    
    toggles.forEach(toggle => {
        // 为切换按钮添加点击事件
        toggle.addEventListener('click', function() {
            // 获取密码输入框
            const input = document.querySelector(`#${this.dataset.target}`);
            
            if (!input) return;
            
            // 切换密码显示
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
}

/**
 * 初始化存储类型切换
 */
function initStorageTypeSwitch() {
    // 获取存储类型选择框
    const storageType = document.querySelector('#storageType');
    
    if (!storageType) return;
    
    // 获取本地存储设置和S3存储设置
    const localStorageSettings = document.querySelector('.storage-settings[data-type="local"]');
    const s3StorageSettings = document.querySelector('.storage-settings[data-type="s3"]');
    
    // 为存储类型选择框添加change事件
    storageType.addEventListener('change', function() {
        // 隐藏所有存储设置
        document.querySelectorAll('.storage-settings').forEach(settings => {
            settings.classList.remove('active');
        });
        
        // 显示选中的存储设置
        const selectedSettings = document.querySelector(`.storage-settings[data-type="${this.value}"]`);
        if (selectedSettings) {
            selectedSettings.classList.add('active');
        }
    });
    
    // 触发change事件以显示初始设置
    storageType.dispatchEvent(new Event('change'));
}

/**
 * 初始化备份操作
 */
function initBackupOperations() {
    // 获取备份操作按钮
    const createBackupBtn = document.querySelector('#createBackup');
    const downloadBackupBtn = document.querySelector('#downloadBackup');
    const restoreBackupBtn = document.querySelector('#restoreBackup');
    const deleteBackupBtn = document.querySelector('#deleteBackup');
    
    // 为创建备份按钮添加点击事件
    if (createBackupBtn) {
        createBackupBtn.addEventListener('click', function() {
            // 显示加载状态
            showLoading('正在创建备份...');
            
            // 发送请求
            fetch('/api/settings/backup/create', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(result => {
                // 隐藏加载状态
                hideLoading();
                
                if (result.status === 200) {
                    // 刷新备份列表
                    loadBackupHistory();
                    
                    // 显示成功消息
                    showMessage('success', '备份创建成功');
                } else {
                    // 显示错误消息
                    showMessage('error', result.message);
                }
            })
            .catch(error => {
                // 隐藏加载状态
                hideLoading();
                
                // 显示错误消息
                showMessage('error', '创建备份失败: ' + error.message);
            });
        });
    }
    
    // 为下载备份按钮添加点击事件
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', function() {
            // 获取选中的备份
            const selectedBackup = document.querySelector('input[name="backup"]:checked');
            
            if (!selectedBackup) {
                showMessage('warning', '请选择一个备份');
                return;
            }
            
            // 显示加载状态
            showLoading('正在准备下载...');
            
            // 发送请求
            fetch(`/api/settings/backup/${selectedBackup.value}/download`, {
                method: 'GET'
            })
            .then(response => {
                // 隐藏加载状态
                hideLoading();
                
                if (response.ok) {
                    // 获取文件名
                    const filename = response.headers.get('Content-Disposition').split('filename=')[1].replace(/"/g, '');
                    
                    // 下载文件
                    response.blob().then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        a.remove();
                    });
                    
                    // 显示成功消息
                    showMessage('success', '备份下载成功');
                } else {
                    // 显示错误消息
                    response.json().then(result => {
                        showMessage('error', result.message);
                    });
                }
            })
            .catch(error => {
                // 隐藏加载状态
                hideLoading();
                
                // 显示错误消息
                showMessage('error', '下载备份失败: ' + error.message);
            });
        });
    }
    
    // 为恢复备份按钮添加点击事件
    if (restoreBackupBtn) {
        restoreBackupBtn.addEventListener('click', function() {
            // 获取选中的备份
            const selectedBackup = document.querySelector('input[name="backup"]:checked');
            
            if (!selectedBackup) {
                showMessage('warning', '请选择一个备份');
                return;
            }
            
            // 确认恢复
            if (confirm('确定要恢复此备份吗？当前设置将被覆盖。')) {
                // 显示加载状态
                showLoading('正在恢复备份...');
                
                // 发送请求
                fetch(`/api/settings/backup/${selectedBackup.value}/restore`, {
                    method: 'POST'
                })
                .then(response => response.json())
                .then(result => {
                    // 隐藏加载状态
                    hideLoading();
                    
                    if (result.status === 200) {
                        // 刷新页面
                        window.location.reload();
                    } else {
                        // 显示错误消息
                        showMessage('error', result.message);
                    }
                })
                .catch(error => {
                    // 隐藏加载状态
                    hideLoading();
                    
                    // 显示错误消息
                    showMessage('error', '恢复备份失败: ' + error.message);
                });
            }
        });
    }
    
    // 为删除备份按钮添加点击事件
    if (deleteBackupBtn) {
        deleteBackupBtn.addEventListener('click', function() {
            // 获取选中的备份
            const selectedBackup = document.querySelector('input[name="backup"]:checked');
            
            if (!selectedBackup) {
                showMessage('warning', '请选择一个备份');
                return;
            }
            
            // 确认删除
            if (confirm('确定要删除此备份吗？此操作不可撤销。')) {
                // 显示加载状态
                showLoading('正在删除备份...');
                
                // 发送请求
                fetch(`/api/settings/backup/${selectedBackup.value}`, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(result => {
                    // 隐藏加载状态
                    hideLoading();
                    
                    if (result.status === 200) {
                        // 刷新备份列表
                        loadBackupHistory();
                        
                        // 显示成功消息
                        showMessage('success', '备份删除成功');
                    } else {
                        // 显示错误消息
                        showMessage('error', result.message);
                    }
                })
                .catch(error => {
                    // 隐藏加载状态
                    hideLoading();
                    
                    // 显示错误消息
                    showMessage('error', '删除备份失败: ' + error.message);
                });
            }
        });
    }
    
    // 加载备份历史
    loadBackupHistory();
}

/**
 * 加载备份历史
 */
function loadBackupHistory() {
    // 获取备份历史表格
    const backupHistory = document.querySelector('#backupHistory');
    
    if (!backupHistory) return;
    
    // 显示加载状态
    showLoading('正在加载备份历史...');
    
    // 发送请求
    fetch('/api/settings/backup', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(result => {
        // 隐藏加载状态
        hideLoading();
        
        if (result.status === 200) {
            // 清空表格
            backupHistory.innerHTML = '';
            
            // 添加备份记录
            result.data.forEach(backup => {
                const row = document.createElement('tr');
                
                // 添加单选按钮
                row.innerHTML = `
                    <td>
                        <input type="radio" name="backup" value="${backup.id}">
                    </td>
                    <td>${backup.name}</td>
                    <td>${backup.description || '-'}</td>
                    <td>${formatDate(backup.created_at)}</td>
                    <td>${formatFileSize(backup.size)}</td>
                    <td>
                        <span class="status-badge ${backup.status === 'success' ? 'success' : 'error'}">
                            ${backup.status === 'success' ? '成功' : '失败'}
                        </span>
                    </td>
                `;
                
                backupHistory.appendChild(row);
            });
            
            // 如果没有备份记录
            if (result.data.length === 0) {
                backupHistory.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">暂无备份记录</td>
                    </tr>
                `;
            }
        } else {
            // 显示错误消息
            showMessage('error', result.message);
        }
    })
    .catch(error => {
        // 隐藏加载状态
        hideLoading();
        
        // 显示错误消息
        showMessage('error', '加载备份历史失败: ' + error.message);
    });
}

/**
 * 测试邮件设置
 */
function testEmailSettings() {
    // 获取邮件设置表单
    const emailForm = document.querySelector('form[data-type="email"]');
    
    if (!emailForm) return;
    
    // 获取测试邮件按钮
    const testEmailBtn = document.querySelector('#testEmail');
    
    if (!testEmailBtn) return;
    
    // 为测试邮件按钮添加点击事件
    testEmailBtn.addEventListener('click', function() {
        // 获取表单数据
        const formData = new FormData(emailForm);
        const data = {};
        
        // 转换FormData为对象
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // 显示加载状态
        showLoading('正在发送测试邮件...');
        
        // 发送请求
        fetch('/api/settings/email/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            // 隐藏加载状态
            hideLoading();
            
            if (result.status === 200) {
                // 显示成功消息
                showMessage('success', '测试邮件发送成功');
            } else {
                // 显示错误消息
                showMessage('error', result.message);
            }
        })
        .catch(error => {
            // 隐藏加载状态
            hideLoading();
            
            // 显示错误消息
            showMessage('error', '发送测试邮件失败: ' + error.message);
        });
    });
}

/**
 * 清除缓存
 */
function clearCache() {
    // 获取清除缓存按钮
    const clearCacheBtn = document.querySelector('#clearCache');
    
    if (!clearCacheBtn) return;
    
    // 为清除缓存按钮添加点击事件
    clearCacheBtn.addEventListener('click', function() {
        // 确认清除缓存
        if (confirm('确定要清除缓存吗？')) {
            // 显示加载状态
            showLoading('正在清除缓存...');
            
            // 发送请求
            fetch('/api/settings/advanced/clear-cache', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(result => {
                // 隐藏加载状态
                hideLoading();
                
                if (result.status === 200) {
                    // 显示成功消息
                    showMessage('success', '缓存清除成功');
                } else {
                    // 显示错误消息
                    showMessage('error', result.message);
                }
            })
            .catch(error => {
                // 隐藏加载状态
                hideLoading();
                
                // 显示错误消息
                showMessage('error', '清除缓存失败: ' + error.message);
            });
        }
    });
}

/**
 * 显示加载状态
 * 
 * @param {string} message 加载消息
 */
function showLoading(message) {
    // 创建加载遮罩
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-message">${message}</div>
    `;
    
    // 添加到页面
    document.body.appendChild(overlay);
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    // 获取加载遮罩
    const overlay = document.querySelector('.loading-overlay');
    
    if (overlay) {
        // 从页面移除
        overlay.remove();
    }
}

/**
 * 显示消息
 * 
 * @param {string} type 消息类型
 * @param {string} message 消息内容
 */
function showMessage(type, message) {
    // 创建消息容器
    const container = document.querySelector('.message-container') || document.createElement('div');
    container.className = 'message-container';
    
    // 如果容器不存在，添加到页面
    if (!document.querySelector('.message-container')) {
        document.body.appendChild(container);
    }
    
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <button class="message-close">&times;</button>
    `;
    
    // 添加到容器
    container.appendChild(messageElement);
    
    // 为关闭按钮添加点击事件
    const closeBtn = messageElement.querySelector('.message-close');
    closeBtn.addEventListener('click', function() {
        // 添加淡出动画
        messageElement.classList.add('fade-out');
        
        // 动画结束后移除元素
        setTimeout(() => {
            messageElement.remove();
            
            // 如果容器为空，移除容器
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    });
    
    // 自动关闭
    setTimeout(() => {
        // 添加淡出动画
        messageElement.classList.add('fade-out');
        
        // 动画结束后移除元素
        setTimeout(() => {
            messageElement.remove();
            
            // 如果容器为空，移除容器
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, 5000);
}

/**
 * 格式化日期
 * 
 * @param {string} dateString 日期字符串
 * @return {string} 格式化后的日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * 格式化文件大小
 * 
 * @param {number} bytes 字节数
 * @return {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 