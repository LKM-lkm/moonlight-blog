const fs = require('fs');
const path = require('path');

// 构建配置
const config = {
  sourceDirs: {
    pages: './',
    assets: './assets',
    admin: './admin'
  },
  targetDir: './dist',
  filesToCopy: [
    // 主页面
    { src: 'index.html', dest: 'index.html' },
    { src: 'article.html', dest: 'article.html' },
    
    // 静态资源
    { src: 'assets/css', dest: 'assets/css' },
    { src: 'assets/js', dest: 'assets/js' },
    { src: 'assets/images', dest: 'assets/images' },
    { src: 'assets/fonts', dest: 'assets/fonts' },
    
    // 后台页面
    { src: 'admin/dashboard/index.html', dest: 'admin/dashboard/index.html' },
    { src: 'admin/views/dashboard.html', dest: 'admin/views/dashboard.html' },
    { src: 'admin/views/articles.html', dest: 'admin/views/articles.html' },
    { src: 'admin/views/comments.html', dest: 'admin/views/comments.html' },
    { src: 'admin/views/users.html', dest: 'admin/views/users.html' },
    { src: 'admin/assets/js/dashboard.js', dest: 'assets/js/dashboard.js' },
    
    // 配置文件
    { src: '_headers', dest: '_headers' },
    { src: '_redirects', dest: '_redirects' }
  ]
};

// 复制文件或目录
function copyFileOrDir(src, dest) {
  const srcPath = path.resolve(src);
  const destPath = path.resolve(config.targetDir, dest);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠️  源文件不存在: ${src}`);
    return;
  }
  
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    // 复制目录
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    const files = fs.readdirSync(srcPath);
    files.forEach(file => {
      const srcFile = path.join(srcPath, file);
      const destFile = path.join(destPath, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        copyFileOrDir(srcFile, path.relative(config.targetDir, destFile));
      } else {
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ 复制文件: ${src} -> ${dest}/${file}`);
      }
    });
  } else {
    // 复制文件
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ 复制文件: ${src} -> ${dest}`);
  }
}

// 修正文件中的路径引用
function fixPaths(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修正相对路径为绝对路径
  const pathFixes = [
    { from: 'href="../assets/', to: 'href="/assets/' },
    { from: 'href="../../assets/', to: 'href="/assets/' },
    { from: 'src="../assets/', to: 'src="/assets/' },
    { from: 'src="../../assets/', to: 'src="/assets/' },
    { from: 'src="../js/', to: 'src="/assets/js/' },
    { from: 'src="../../js/', to: 'src="/assets/js/' }
  ];
  
  let hasChanges = false;
  pathFixes.forEach(fix => {
    if (content.includes(fix.from)) {
      content = content.replace(new RegExp(fix.from, 'g'), fix.to);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`🔧 修正路径: ${filePath}`);
  }
}

// 主构建函数
function build() {
  console.log('🚀 开始构建项目...');
  
  // 清理目标目录
  if (fs.existsSync(config.targetDir)) {
    fs.rmSync(config.targetDir, { recursive: true, force: true });
    console.log('🧹 清理目标目录');
  }
  
  // 创建目标目录
  fs.mkdirSync(config.targetDir, { recursive: true });
  
  // 复制文件
  config.filesToCopy.forEach(item => {
    copyFileOrDir(item.src, item.dest);
  });
  
  // 修正路径
  const htmlFiles = [
    'dist/index.html',
    'dist/article.html',
    'dist/admin/dashboard/index.html',
    'dist/admin/views/dashboard.html',
    'dist/admin/views/articles.html',
    'dist/admin/views/comments.html',
    'dist/admin/views/users.html'
  ];
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fixPaths(file);
    }
  });
  
  console.log('✅ 构建完成！');
  console.log(`📁 部署目录: ${config.targetDir}`);
}

// 运行构建
if (require.main === module) {
  build();
}

module.exports = { build, config }; 