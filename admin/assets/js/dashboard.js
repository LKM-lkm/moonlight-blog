document.addEventListener('DOMContentLoaded', () => {
    // 初始化图表
    initVisitsChart();
    initUserDistributionChart();
    
    // 侧边栏切换
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
    
    // 点击外部关闭侧边栏
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 576) {
            const isClickInside = sidebar.contains(e.target) || menuToggle.contains(e.target);
            if (!isClickInside && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        }
    });
    
    // 访问趋势图表
    function initVisitsChart() {
        const chart = echarts.init(document.getElementById('visitsChart'));
        const option = {
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLine: {
                    lineStyle: {
                        color: '#4b5563'
                    }
                },
                axisLabel: {
                    color: '#9ca3af'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#4b5563'
                    }
                },
                axisLabel: {
                    color: '#9ca3af'
                },
                splitLine: {
                    lineStyle: {
                        color: '#374151'
                    }
                }
            },
            series: [
                {
                    name: '访问量',
                    type: 'line',
                    smooth: true,
                    data: [120, 132, 101, 134, 90, 230, 210],
                    itemStyle: {
                        color: '#6366f1'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {
                                offset: 0,
                                color: 'rgba(99, 102, 241, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(99, 102, 241, 0.1)'
                            }
                        ])
                    }
                }
            ]
        };
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        // 切换时间范围
        const timeButtons = document.querySelectorAll('.chart-actions button');
        timeButtons.forEach(button => {
            button.addEventListener('click', () => {
                timeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // 这里可以根据选择的时间范围更新数据
            });
        });
    }
    
    // 用户分布图表
    function initUserDistributionChart() {
        const chart = echarts.init(document.getElementById('userDistributionChart'));
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#9ca3af'
                }
            },
            series: [
                {
                    name: '用户分布',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: 1048, name: '华东' },
                        { value: 735, name: '华北' },
                        { value: 580, name: '华南' },
                        { value: 484, name: '西南' },
                        { value: 300, name: '其他' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    itemStyle: {
                        color: function(params) {
                            const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                            return colors[params.dataIndex];
                        }
                    }
                }
            ]
        };
        chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            chart.resize();
        });
        
        // 切换数据类型
        const typeButtons = document.querySelectorAll('#userDistributionChart + .chart-actions button');
        typeButtons.forEach(button => {
            button.addEventListener('click', () => {
                typeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                // 这里可以根据选择的类型更新数据
            });
        });
    }
    
    // 通知系统
    const notifications = document.querySelector('.notifications');
    notifications.addEventListener('click', () => {
        // 这里可以添加通知面板的显示逻辑
        console.log('显示通知面板');
    });
    
    // 搜索功能
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            // 这里可以添加搜索逻辑
            console.log('搜索:', searchTerm);
        }
    });
    
    // 用户菜单
    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = userMenu.querySelector('.dropdown-menu');
    
    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
    
    document.addEventListener('click', () => {
        dropdownMenu.style.display = 'none';
    });
    
    // 退出登录
    const logoutButton = document.querySelector('.dropdown-menu a:last-child');
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        // 这里添加退出登录逻辑
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    });
}); 