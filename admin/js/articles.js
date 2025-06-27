document.addEventListener('DOMContentLoaded', function() {
    fetch('../../articles/index.json')
        .then(res => res.json())
        .then(data => renderAdminArticles(data));
});

function renderAdminArticles(articles) {
    const tbody = document.querySelector('#admin-articles-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    articles.forEach(article => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${article.title || ''}</td>
            <td>${article.author || ''}</td>
            <td>${article.date || ''}</td>
            <td><div class='admin-article-tags'>${(article.tags||[]).map(tag => `<span class='tag'>${tag}</span>`).join('')}</div></td>
            <td>${article.top ? '<span class="admin-top-badge">置顶</span>' : ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 新建文章弹窗逻辑
function showArticleModal(show) {
    const modal = document.getElementById('article-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}
document.getElementById('new-article-btn').onclick = () => showArticleModal(true);
document.getElementById('modal-close-btn').onclick = () => showArticleModal(false);
document.getElementById('modal-cancel-btn').onclick = () => showArticleModal(false);

document.getElementById('article-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('article-title').value.trim();
    if (!title) return alert('标题不能为空');
    const author = document.getElementById('article-author').value.trim() || '匿名';
    const tags = document.getElementById('article-tags').value.trim();
    const excerpt = document.getElementById('article-excerpt').value.trim();
    const content = document.getElementById('article-content').value.trim();
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `${date}-${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')}.md`;
    let frontmatter = [
        '---',
        `title: "${title}"`,
        `date: ${date}`,
        `author: ${author}`,
        tags ? `tags: ${tags}` : '',
        excerpt ? `excerpt: "${excerpt}"` : '',
        '---',
        ''
    ].filter(Boolean).join('\n');
    const md = frontmatter + (content ? ('\n' + content) : '\n');
    // 下载Markdown文件
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showArticleModal(false);
    alert('已生成并下载Markdown文件，请将其放入articles目录并运行生成索引脚本。');
}; 