#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const articlesDir = path.join(__dirname, '../articles');
const indexFile = path.join(articlesDir, 'index.json');

function getAllMarkdownFiles() {
  return fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));
}

function updateIndex() {
  const files = getAllMarkdownFiles();
  const articles = files.map(filename => {
    const filePath = path.join(articlesDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---([\s\S]*?)---/);
    let meta = {};
    if (match) {
      const fm = match[1].trim();
      fm.split('\n').forEach(line => {
        const [k, ...v] = line.split(':');
        meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
      });
    }
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
  fs.writeFileSync(indexFile, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`已更新索引，共${articles.length}篇文章。`);
}

function addArticle() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('文章标题: ', title => {
    rl.question('作者: ', author => {
      rl.question('标签(逗号分隔): ', tags => {
        rl.question('摘要: ', excerpt => {
          rl.question('封面图片URL(可选): ', cover => {
            const date = new Date().toISOString().slice(0, 10);
            const filename = `${date}-${title.replace(/[^\w\u4e00-\u9fa5]+/g, '-')}.md`;
            const filePath = path.join(articlesDir, filename);
            const frontmatter = `---\ntitle: ${title}\ndate: ${date}\nauthor: ${author}\ntags: ${tags}\ncover: ${cover}\nexcerpt: ${excerpt}\ntop: false\n---\n\n正文内容...`;
            fs.writeFileSync(filePath, frontmatter, 'utf-8');
            console.log(`已创建: ${filename}`);
            rl.close();
            updateIndex();
          });
        });
      });
    });
  });
}

function deleteArticle(filename) {
  const filePath = path.join(articlesDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log('文件不存在:', filename);
    return;
  }
  fs.unlinkSync(filePath);
  console.log('已删除:', filename);
  updateIndex();
}

function listArticles() {
  const files = getAllMarkdownFiles();
  files.forEach(f => console.log(f));
  console.log(`共${files.length}篇文章。`);
}

function editArticle(filename) {
  const filePath = path.join(articlesDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log('文件不存在:', filename);
    return;
  }
  const editor = process.env.EDITOR || 'notepad';
  require('child_process').spawn(editor, [filePath], { stdio: 'inherit' });
}

const [,, cmd, arg] = process.argv;
switch (cmd) {
  case 'add': addArticle(); break;
  case 'delete': deleteArticle(arg); break;
  case 'edit': editArticle(arg); break;
  case 'list': listArticles(); break;
  case 'update': updateIndex(); break;
  default:
    console.log('用法: node scripts/manage-articles.js [add|edit|delete|list|update] [filename]');
} 