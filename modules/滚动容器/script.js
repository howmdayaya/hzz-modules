// script.js

// 1. 数据源（包含尺寸信息）
const cardsData = [
    {
        id: 1,
        size: 'large',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200',
        alt: 'MacBook Air 1',
        caption: '包再合适不过。'
    },
    {
        id: 2,
        size: 'medium',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800',
        alt: 'MacBook Air 2',
        tag: '13 英寸 MacBook Air',
        caption: 'MacBook Air 的电池续航最长可达 18 小时¹。'
    },
    {
        id: 3,
        size: 'small',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600',
        alt: 'MacBook Air 3',
        tag: '13 英寸 MacBook Air',
        caption: '显示屏也超赞，随时随地追剧、观影。'
    },
    {
        id: 4,
        size: 'medium',
        image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
        alt: 'MacBook Air 4',
        caption: '轻薄设计，随身携带毫无压力。'
    }
];

// 2. 封装轮播类
class Carousel {
    constructor(trackId, prevBtnId, nextBtnId) {
        this.track = document.getElementById(trackId);
        this.prevBtn = document.getElementById(prevBtnId);
        this.nextBtn = document.getElementById(nextBtnId);
        
        this.currentIndex = 0;
        this.cardElements = [];
        
        this.init();
    }

    // 初始化
    init() {
        this.renderCards();
        this.bindEvents();
        this.updateState(); // 初始状态检查
    }

    // 渲染卡片
    renderCards() {
        const fragment = document.createDocumentFragment();
        
        cardsData.forEach(data => {
            const card = document.createElement('div');
            card.className = `card card--${data.size}`;
            
            let tagHTML = data.tag ? `<span class="tag">${data.tag}</span>` : '';
            
            card.innerHTML = `
                <div class="image-container">
                    <img src="${data.image}" alt="${data.alt}" loading="lazy">
                    ${tagHTML}
                </div>
                <p class="caption">${data.caption}</p>
            `;
            
            fragment.appendChild(card);
        });
        
        this.track.appendChild(fragment);
        
        // 收集所有卡片 DOM
        this.cardElements = Array.from(this.track.querySelectorAll('.card'));
    }

    // 绑定事件
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.scrollPrev());
        this.nextBtn.addEventListener('click', () => this.scrollNext());
        
        // 监听滚动，使用 requestAnimationFrame 优化性能
        let ticking = false;
        this.track.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateState();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.updateState());
    }

    // 滚动到指定索引的卡片
    scrollToCard(index) {
        if (index < 0 || index >= this.cardElements.length) return;
        
        const card = this.cardElements[index];
        if (!card) return;

        // 计算卡片相对于滚动容器的真实左偏移量
        // 注意：因为 flex 布局有 gap，offsetLeft 已经包含了 gap，非常精准
        const scrollLeft = card.offsetLeft - this.track.offsetLeft;
        
        this.track.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }

    scrollNext() {
        if (this.currentIndex < this.cardElements.length - 1) {
            this.scrollToCard(this.currentIndex + 1);
        }
    }

    scrollPrev() {
        if (this.currentIndex > 0) {
            this.scrollToCard(this.currentIndex - 1);
        }
    }

    // 更新按钮状态和当前索引
    updateState() {
        const { scrollLeft, scrollWidth, clientWidth } = this.track;
        const maxScroll = scrollWidth - clientWidth;

        // 更新按钮禁用状态（容差处理 1px 浏览器的亚像素渲染问题）
        this.prevBtn.disabled = scrollLeft <= 1;
        this.nextBtn.disabled = scrollLeft >= maxScroll - 1;

        // 找出当前视口最左侧可见的卡片索引
        for (let i = 0; i < this.cardElements.length; i++) {
            const card = this.cardElements[i];
            const cardLeft = card.offsetLeft - this.track.offsetLeft;
            
            // 允许 20px 的误差范围
            if (cardLeft >= scrollLeft - 20) {
                this.currentIndex = i;
                break;
            }
        }
    }
}

// 3. 实例化
document.addEventListener('DOMContentLoaded', () => {
    new Carousel('carouselTrack', 'prevBtn', 'nextBtn');
});