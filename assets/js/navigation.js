// 导航功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有导航链接
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // 如果是锚点链接
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else if (href === '#') {
          // 如果是首页链接，滚动到顶部
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}); 