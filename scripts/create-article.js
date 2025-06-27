const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const articlesDir = path.join(__dirname, '../articles');
const indexScript = path.join(__dirname, 'generate-articles-index.js');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const title = (await prompt('文章标题: ')).trim();
  if (!title) return console.log('标题不能为空');
  const author = (await prompt('作者: ')).trim() || '匿名';
  const tags = (await prompt('标签(逗号分隔): ')).trim();
  const excerpt = (await prompt('摘要: ')).trim();
  const content = (await prompt('正文(可留空): ')).trim();
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `${date}-${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')}.md`;
  const filePath = path.join(articlesDir, fileName);
  if (fs.existsSync(filePath)) return console.log('同名文章已存在');
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `date: ${date}`,
    `author: ${author}`,
    tags ? `tags: ${tags}` : '',
    excerpt ? `excerpt: "${excerpt}"` : '',
    '---',
    ''
  ].filter(Boolean).join('\n');
  fs.writeFileSync(filePath, frontmatter + (content ? ('\n' + content) : '\n'), 'utf-8');
  console.log(`已创建: ${filePath}`);
  // 自动更新索引
  execSync(`node ${indexScript}`);
  console.log('已自动更新 articles/index.json');
}

if (require.main === module) main(); 