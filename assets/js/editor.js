document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化主题设置
    initTheme();
    
    // 初始化侧边栏切换
    initSidebarToggle();
    
    // 初始化Markdown编辑器
    initMarkdownEditor();
    
    // 初始化封面上传
    initCoverUpload();
    
    // 初始化预览功能
    initPreview();
    
    // 初始化保存和发布功能
    initSaveAndPublish();
    
    // 从URL中获取文章ID（如果有的话）
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    // 如果有文章ID，则加载文章内容
    if (articleId) {
        loadArticleContent(articleId);
        document.getElementById('editor-title').textContent = '编辑文章';
    } else {
        document.getElementById('editor-title').textContent = '新建文章';
    }
});

// Markdown编辑器实例
let mdeEditor;

// 初始化Markdown编辑器
function initMarkdownEditor() {
    mdeEditor = new EasyMDE({
        element: document.getElementById('markdown-editor'),
        spellChecker: false,
        autosave: {
            enabled: true,
            uniqueId: 'moonlight-editor',
            delay: 1000,
        },
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'quote', 'code', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        placeholder: '开始编写你的文章内容...',
        status: ['autosave', 'lines', 'words', 'cursor'],
        uploadImage: true,
        imageUploadFunction: handleImageUpload
    });
}

// 处理图片上传
function handleImageUpload(file, onSuccess, onError) {
    // 在实际应用中，这里应该向后端API发送图片上传请求
    // 这里我们使用FileReader模拟上传过程，将图片转换为base64
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // 这里应该将图片上传到服务器，然后返回URL
        // 这里我们直接返回base64数据作为演示
        onSuccess(e.target.result);
    };
    reader.onerror = function(e) {
        onError('图片上传失败');
    };
    reader.readAsDataURL(file);
}

// 初始化封面上传
function initCoverUpload() {
    const selectCoverBtn = document.getElementById('select-cover-btn');
    const coverUploadInput = document.getElementById('cover-upload');
    const coverPreview = document.getElementById('cover-preview');
    
    selectCoverBtn.addEventListener('click', function() {
        coverUploadInput.click();
    });
    
    coverUploadInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                coverPreview.innerHTML = `<img src="${e.target.result}" alt="封面预览">`;
                coverPreview.classList.add('has-cover');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 初始化预览功能
function initPreview() {
    const previewBtn = document.getElementById('preview-article-btn');
    const previewModal = document.getElementById('preview-modal');
    const closePreviewBtn = document.querySelector('.close-preview-btn');
    
    previewBtn.addEventListener('click', function() {
        // 获取文章数据
        const title = document.getElementById('article-title').value || '文章标题';
        const category = document.getElementById('article-category').options[document.getElementById('article-category').selectedIndex].text;
        const tags = document.getElementById('article-tags').value || '无标签';
        const content = mdeEditor.value();
        
        // 更新预览
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-date').textContent = formatDate(new Date());
        document.getElementById('preview-category').textContent = category;
        document.getElementById('preview-tags').textContent = tags;
        document.getElementById('preview-content').innerHTML = marked.parse(content);
        
        // 显示预览模态框
        previewModal.classList.add('active');
    });
    
    closePreviewBtn.addEventListener('click', function() {
        previewModal.classList.remove('active');
    });
    
    // 点击模态框外部关闭
    previewModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// 初始化保存和发布功能
function initSaveAndPublish() {
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const publishBtn = document.getElementById('publish-btn');
    
    saveDraftBtn.addEventListener('click', function() {
        saveArticle('draft');
    });
    
    publishBtn.addEventListener('click', function() {
        saveArticle('published');
    });
}

// 保存文章
async function saveArticle(status) {
    try {
        // 获取表单数据
        const title = document.getElementById('article-title').value;
        const excerpt = document.getElementById('article-excerpt').value;
        const category = document.getElementById('article-category').value;
        const tags = document.getElementById('article-tags').value;
        const content = mdeEditor.value();
        
        // 检查必填字段
        if (!title) {
            alert('请输入文章标题');
            return;
        }
        
        if (!content) {
            alert('请输入文章内容');
            return;
        }
        
        // 获取URL中的文章ID（如果有的话）
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        // 构建文章数据
        const articleData = {
            id: articleId || null,
            title: title,
            excerpt: excerpt,
            category: category,
            tags: tags.split(',').map(tag => tag.trim()),
            content: content,
            status: status,
            date: new Date().toISOString()
        };
        
        // 在实际应用中，这里应该向后端API发送保存文章请求
        console.log('保存文章:', articleData);
        
        // 模拟保存成功
        alert(status === 'published' ? '文章已成功发布!' : '草稿已保存!');
        
        // 跳转到文章管理页面
        window.location.href = 'index.html#articles';
        
    } catch (error) {
        console.error('保存文章时出错:', error);
        alert('保存文章时出错，请稍后再试');
    }
}

// 加载文章内容
async function loadArticleContent(id) {
    try {
        // 在实际应用中，这里应该从后端API获取文章数据
        // 这里我们使用模拟数据
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const articleData = {
            id: id,
            title: '探索人工智能的未来发展',
            excerpt: '本文将探讨人工智能技术的未来发展趋势及其对社会的影响。',
            category: 'technology',
            tags: ['AI', '人工智能', '技术趋势'],
            content: `# 探索人工智能的未来发展

## 引言

人工智能(AI)技术正以前所未有的速度发展，改变着我们的生活、工作和思考方式。随着机器学习、深度学习和神经网络等技术的不断进步，AI系统在各个领域的应用也越来越广泛。本文将探讨AI技术的未来发展趋势及其潜在影响。

## AI的当前状态

目前，AI已经在以下领域取得了显著成就：

- **自然语言处理**：如GPT模型能够生成流畅的文本，理解并回应复杂查询
- **计算机视觉**：实现了图像识别、物体检测和场景理解
- **推荐系统**：个性化内容推荐，提升用户体验
- **自动驾驶**：辅助和自动驾驶技术的不断进步

## 未来发展趋势

### 1. 多模态AI

未来的AI系统将能够同时处理和理解多种类型的数据，包括文本、图像、声音和视频，实现更全面的感知能力。

### 2. 可解释性AI

随着AI应用在关键决策领域的扩展，对AI决策过程的可解释性需求也在增加。未来的AI系统将更加透明，能够解释其决策逻辑。

### 3. 边缘计算与AI

AI计算将逐渐从云端向终端设备迁移，实现更低的延迟和更高的隐私保护。

## 社会影响

AI技术的发展将对社会产生深远影响：

1. **就业变革**：部分工作岗位可能被自动化，同时创造新的工作机会
2. **教育转型**：教育内容和方式需要适应AI时代的需求
3. **伦理挑战**：隐私、安全和公平性等问题需要社会共同应对

## 结论

人工智能技术的发展正处于一个关键阶段，未来将呈现多元化、智能化和普及化的趋势。我们需要积极拥抱这些变化，同时谨慎应对其中的挑战，确保AI技术的发展方向符合人类的长远利益。`,
            status: 'published',
            date: '2023-10-10T10:30:00.000Z'
        };
        
        // 填充表单
        document.getElementById('article-title').value = articleData.title;
        document.getElementById('article-excerpt').value = articleData.excerpt;
        document.getElementById('article-category').value = articleData.category;
        document.getElementById('article-tags').value = articleData.tags.join(', ');
        mdeEditor.value(articleData.content);
        
    } catch (error) {
        console.error('加载文章内容时出错:', error);
        alert('加载文章内容时出错，请稍后再试');
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