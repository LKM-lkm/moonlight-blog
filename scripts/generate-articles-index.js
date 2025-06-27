const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, '../articles');
const outputFile = path.join(articlesDir, 'index.json');

function parseFrontmatter(content) {
  const match = content.match(/^---([\s\S]*?)---/);
  let meta = {};
  if (match) {
    const fm = match[1].trim();
    fm.split('\n').forEach(line => {
      const [k, ...v] = line.split(':');
      meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
    });
  }
  return meta;
}

function getAllMarkdownFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'));
}

function main() {
  const files = getAllMarkdownFiles(articlesDir);
  const articles = files.map(filename => {
    const filePath = path.join(articlesDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = parseFrontmatter(content);
    return {
      file: filename,
      title: meta.title || '',
      date: meta.date || '',
      cover: meta.cover || '',
      excerpt: meta.excerpt || '',
      tags: meta.tags ? meta.tags.split(',').map(t => t.trim()) : [],
      top: meta.top === 'true' || meta.top === '1',
      author: meta.author || '',
    };
  });
  // 置顶优先，时间倒序
  articles.sort((a, b) => {
    if (a.top && !b.top) return -1;
    if (!a.top && b.top) return 1;
    return (b.date || '').localeCompare(a.date || '');
  });
  fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`已生成 ${outputFile}，共${articles.length}篇文章。`);
}

main(); 