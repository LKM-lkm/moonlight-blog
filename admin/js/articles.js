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