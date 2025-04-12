/**
 * 文章编辑器脚本
 * 处理Markdown编辑器初始化、文件上传和文章保存功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }
    
    // 获取DOM元素
    const articleTitleInput = document.getElementById('article-title');
    const articleCategorySelect = document.getElementById('article-category');
    const articleTagsInput = document.getElementById('article-tags');
    const articleDescriptionInput = document.getElementById('article-description');
    const articleCoverInput = document.getElementById('article-cover');
    const coverPreview = document.getElementById('cover-preview');
    const coverUploadBtn = document.getElementById('cover-upload-btn');
    const fileUploadInput = document.getElementById('file-upload');
    const uploadZone = document.getElementById('upload-zone');
    const attachmentList = document.getElementById('attachment-list');
    const articleStatusToggle = document.getElementById('article-status');
    const articleCommentsToggle = document.getElementById('article-comments');
    const articleDateInput = document.getElementById('article-date');
    const previewBtn = document.getElementById('preview-btn');
    const draftBtn = document.getElementById('draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    const previewModal = document.getElementById('preview-modal');
    const previewClose = document.getElementById('preview-close');
    
    // 设置当前日期为默认值
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    articleDateInput.value = formattedDate;
    
    // 初始化Markdown编辑器
    const easyMDE = new EasyMDE({
        element: document.getElementById('markdown-editor'),
        autofocus: true,
        spellChecker: false,
        renderingConfig: {
            codeSyntaxHighlighting: true,
        },
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'code', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        placeholder: '在这里开始撰写文章内容...',
        status: ['lines', 'words', 'cursor']
    });
    
    // 从URL获取文章ID（如果有）
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    // 如果有文章ID，加载文章数据
    if (articleId) {
        loadArticle(articleId);
    }
    
    // 封面图片上传
    coverUploadBtn.addEventListener('click', function() {
        articleCoverInput.click();
    });
    
    articleCoverInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('请选择图片文件');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                coverPreview.innerHTML = `<img src="${e.target.result}" alt="文章封面">`;
                
                // 保存图片到localStorage（实际应用中应上传到服务器）
                // 此处简化处理，仅用于演示
                localStorage.setItem('tempCoverImage', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 附件上传
    uploadZone.addEventListener('click', function() {
        fileUploadInput.click();
    });
    
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
    
    fileUploadInput.addEventListener('change', function(e) {
        handleFileUpload(e.target.files);
    });
    
    // 文章预览
    previewBtn.addEventListener('click', function() {
        showPreview();
    });
    
    // 关闭预览
    previewClose.addEventListener('click', function() {
        previewModal.classList.remove('active');
    });
    
    // 保存草稿
    draftBtn.addEventListener('click', function() {
        saveArticle(false);
    });
    
    // 发布文章
    publishBtn.addEventListener('click', function() {
        saveArticle(true);
    });
    
    /**
     * 处理文件上传
     * @param {FileList} files - 用户选择的文件列表
     */
    function handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        // 清除"无附件"提示
        const noAttachments = attachmentList.querySelector('.no-attachments');
        if (noAttachments) {
            attachmentList.removeChild(noAttachments);
        }
        
        Array.from(files).forEach(file => {
            // 检查文件大小
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert(`文件 ${file.name} 超过10MB限制`);
                return;
            }
            
            // 创建附件项目
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'attachment-item';
            
            // 获取文件图标
            const fileIcon = getFileIcon(file.name);
            
            // 格式化文件大小
            const fileSize = formatFileSize(file.size);
            
            attachmentItem.innerHTML = `
                <div class="attachment-info">
                    <div class="attachment-icon">
                        <i class="${fileIcon}"></i>
                    </div>
                    <div>
                        <div class="attachment-name">${file.name}</div>
                        <div class="attachment-size">${fileSize}</div>
                    </div>
                </div>
                <div class="attachment-actions">
                    <button type="button" class="preview-btn" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button type="button" class="delete-btn" title="删除">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            // 添加删除功能
            const deleteBtn = attachmentItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                attachmentList.removeChild(attachmentItem);
                
                // 如果没有附件，显示"无附件"提示
                if (attachmentList.children.length === 0) {
                    attachmentList.innerHTML = `
                        <div class="no-attachments">
                            <i class="fas fa-file-upload"></i>
                            <p>尚未添加附件</p>
                        </div>
                    `;
                }
            });
            
            // 保存文件数据（实际应用中应上传到服务器）
            // 此处简化处理，仅用于演示
            const reader = new FileReader();
            reader.onload = function(e) {
                attachmentItem.dataset.fileData = e.target.result;
                attachmentItem.dataset.fileName = file.name;
                attachmentItem.dataset.fileSize = file.size;
                attachmentItem.dataset.fileType = file.type;
            };
            reader.readAsDataURL(file);
            
            // 添加到附件列表
            attachmentList.appendChild(attachmentItem);
        });
    }
    
    /**
     * 根据文件扩展名获取对应的图标
     * @param {string} filename - 文件名
     * @returns {string} - Font Awesome图标类名
     */
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const iconMap = {
            // 文档
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'txt': 'fas fa-file-alt',
            'rtf': 'fas fa-file-alt',
            
            // 表格
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'csv': 'fas fa-file-csv',
            
            // 演示文稿
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint',
            
            // 压缩文件
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            '7z': 'fas fa-file-archive',
            
            // 图片
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'svg': 'fas fa-file-image',
            
            // 音频
            'mp3': 'fas fa-file-audio',
            'wav': 'fas fa-file-audio',
            'ogg': 'fas fa-file-audio',
            
            // 视频
            'mp4': 'fas fa-file-video',
            'avi': 'fas fa-file-video',
            'mov': 'fas fa-file-video',
            
            // 代码
            'html': 'fas fa-file-code',
            'css': 'fas fa-file-code',
            'js': 'fas fa-file-code',
            'json': 'fas fa-file-code',
            'php': 'fas fa-file-code',
            'py': 'fas fa-file-code',
        };
        
        return iconMap[ext] || 'fas fa-file';
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @returns {string} - 格式化后的文件大小
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 显示文章预览
     */
    function showPreview() {
        // 获取表单数据
        const title = articleTitleInput.value || '无标题';
        const category = articleCategorySelect.value ? 
            articleCategorySelect.options[articleCategorySelect.selectedIndex].text : '未分类';
        const tags = articleTagsInput.value || '无标签';
        const content = easyMDE.value();
        const date = new Date(articleDateInput.value || Date.now()).toLocaleDateString('zh-CN');
        
        // 设置预览内容
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-category').textContent = category;
        document.getElementById('preview-tags').textContent = tags;
        document.getElementById('preview-date').textContent = date;
        
        // 渲染Markdown内容
        document.getElementById('preview-content').innerHTML = marked.parse(content);
        
        // 处理附件预览
        const previewAttachments = document.getElementById('preview-attachments');
        const attachmentItems = document.querySelectorAll('.attachment-item');
        
        if (attachmentItems.length === 0) {
            previewAttachments.style.display = 'none';
        } else {
            previewAttachments.style.display = 'block';
            
            const attachmentsList = previewAttachments.querySelector('.attachments-preview-list');
            attachmentsList.innerHTML = '';
            
            attachmentItems.forEach(item => {
                const fileName = item.querySelector('.attachment-name').textContent;
                const fileSize = item.querySelector('.attachment-size').textContent;
                const fileIcon = item.querySelector('.attachment-icon i').className;
                
                const li = document.createElement('li');
                li.innerHTML = `
                    <i class="${fileIcon} attachment-preview-icon"></i>
                    <div class="attachment-preview-info">
                        <div class="attachment-preview-name">${fileName}</div>
                        <div class="attachment-preview-size">${fileSize}</div>
                    </div>
                    <a href="#" class="attachment-preview-download">
                        <i class="fas fa-download"></i> 下载
                    </a>
                `;
                
                attachmentsList.appendChild(li);
            });
        }
        
        // 显示预览模态框
        previewModal.classList.add('active');
    }
    
    /**
     * 保存文章
     * @param {boolean} isPublished - 是否发布文章
     */
    function saveArticle(isPublished) {
        // 验证表单
        if (!articleTitleInput.value.trim()) {
            alert('请输入文章标题');
            articleTitleInput.focus();
            return;
        }
        
        if (!easyMDE.value().trim()) {
            alert('请输入文章内容');
            easyMDE.codemirror.focus();
            return;
        }
        
        // 收集表单数据
        const articleData = {
            id: articleId || generateId(),
            title: articleTitleInput.value.trim(),
            description: articleDescriptionInput.value.trim(),
            category: articleCategorySelect.value,
            tags: articleTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            content: easyMDE.value(),
            coverImage: localStorage.getItem('tempCoverImage') || null,
            status: isPublished ? 'published' : 'draft',
            allowComments: articleCommentsToggle.checked,
            date: articleDateInput.value ? new Date(articleDateInput.value).toISOString() : new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            attachments: getAttachments()
        };
        
        // 保存文章数据到本地存储
        saveArticleToStorage(articleData);
        
        // 清除临时数据
        localStorage.removeItem('tempCoverImage');
        
        // 显示成功消息
        alert(isPublished ? '文章发布成功！' : '草稿保存成功！');
        
        // 跳转到文章列表页面
        window.location.href = 'index.html#articles';
    }
    
    /**
     * 获取附件数据
     * @returns {Array} - 附件数据数组
     */
    function getAttachments() {
        const attachmentItems = document.querySelectorAll('.attachment-item');
        const attachments = [];
        
        attachmentItems.forEach(item => {
            if (item.dataset.fileData) {
                attachments.push({
                    name: item.dataset.fileName,
                    size: parseInt(item.dataset.fileSize),
                    type: item.dataset.fileType,
                    data: item.dataset.fileData
                });
            }
        });
        
        return attachments;
    }
    
    /**
     * 保存文章数据到本地存储
     * @param {Object} article - 文章数据
     */
    function saveArticleToStorage(article) {
        // 获取现有文章数据
        let articles = JSON.parse(localStorage.getItem('articles') || '[]');
        
        // 检查是否是更新现有文章
        const existingIndex = articles.findIndex(a => a.id === article.id);
        
        if (existingIndex !== -1) {
            // 更新现有文章
            articles[existingIndex] = article;
        } else {
            // 添加新文章
            articles.push(article);
        }
        
        // 保存到本地存储
        localStorage.setItem('articles', JSON.stringify(articles));
    }
    
    /**
     * 从本地存储加载文章数据
     * @param {string} id - 文章ID
     */
    function loadArticle(id) {
        // 获取文章数据
        const articles = JSON.parse(localStorage.getItem('articles') || '[]');
        const article = articles.find(a => a.id === id);
        
        if (!article) {
            alert('文章不存在！');
            window.location.href = 'index.html#articles';
            return;
        }
        
        // 填充表单
        articleTitleInput.value = article.title;
        articleCategorySelect.value = article.category;
        articleTagsInput.value = article.tags.join(', ');
        articleDescriptionInput.value = article.description;
        easyMDE.value(article.content);
        articleStatusToggle.checked = article.status === 'published';
        articleCommentsToggle.checked = article.allowComments;
        
        if (article.date) {
            const date = new Date(article.date);
            articleDateInput.value = date.toISOString().slice(0, 16);
        }
        
        // 显示封面图片
        if (article.coverImage) {
            coverPreview.innerHTML = `<img src="${article.coverImage}" alt="文章封面">`;
            localStorage.setItem('tempCoverImage', article.coverImage);
        }
        
        // 显示附件
        if (article.attachments && article.attachments.length > 0) {
            // 清除"无附件"提示
            attachmentList.innerHTML = '';
            
            article.attachments.forEach(attachment => {
                const attachmentItem = document.createElement('div');
                attachmentItem.className = 'attachment-item';
                
                const fileIcon = getFileIcon(attachment.name);
                const fileSize = formatFileSize(attachment.size);
                
                attachmentItem.innerHTML = `
                    <div class="attachment-info">
                        <div class="attachment-icon">
                            <i class="${fileIcon}"></i>
                        </div>
                        <div>
                            <div class="attachment-name">${attachment.name}</div>
                            <div class="attachment-size">${fileSize}</div>
                        </div>
                    </div>
                    <div class="attachment-actions">
                        <button type="button" class="preview-btn" title="预览">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="delete-btn" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                
                // 保存文件数据
                attachmentItem.dataset.fileData = attachment.data;
                attachmentItem.dataset.fileName = attachment.name;
                attachmentItem.dataset.fileSize = attachment.size;
                attachmentItem.dataset.fileType = attachment.type;
                
                // 添加删除功能
                const deleteBtn = attachmentItem.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', function() {
                    attachmentList.removeChild(attachmentItem);
                    
                    // 如果没有附件，显示"无附件"提示
                    if (attachmentList.children.length === 0) {
                        attachmentList.innerHTML = `
                            <div class="no-attachments">
                                <i class="fas fa-file-upload"></i>
                                <p>尚未添加附件</p>
                            </div>
                        `;
                    }
                });
                
                // 添加到附件列表
                attachmentList.appendChild(attachmentItem);
            });
        }
    }
    
    /**
     * 生成唯一ID
     * @returns {string} - 唯一ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // 加载Marked库
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    document.head.appendChild(script);
});