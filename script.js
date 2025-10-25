// Vinyl Shop JavaScript
class VinylShop {
    constructor() {
        this.cart = [];
        this.products = this.initializeProducts();
        this.filteredProducts = [...this.products];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFeaturedProducts();
        this.renderCatalog();
        this.updateCartDisplay();
    }

    initializeProducts() {
        return [
            {
                id: 1,
                title: "Dark Side of the Moon",
                artist: "Pink Floyd",
                genre: "rock",
                year: 1973,
                price: 29.99,
                image: null,
                featured: true,
                description: "A masterpiece of progressive rock that defined a generation."
            },
            {
                id: 2,
                title: "Kind of Blue",
                artist: "Miles Davis",
                genre: "jazz",
                year: 1959,
                price: 34.99,
                image: null,
                featured: true,
                description: "The best-selling jazz album of all time."
            },
            {
                id: 3,
                title: "Abbey Road",
                artist: "The Beatles",
                genre: "rock",
                year: 1969,
                price: 39.99,
                image: null,
                featured: true,
                description: "The Beatles' final studio album."
            },
            {
                id: 4,
                title: "Blue",
                artist: "Joni Mitchell",
                genre: "pop",
                year: 1971,
                price: 27.99,
                image: null,
                featured: false,
                description: "A deeply personal and influential folk album."
            },
            {
                id: 5,
                title: "Bitches Brew",
                artist: "Miles Davis",
                genre: "jazz",
                year: 1970,
                price: 32.99,
                image: null,
                featured: false,
                description: "Revolutionary fusion jazz masterpiece."
            },
            {
                id: 6,
                title: "Led Zeppelin IV",
                artist: "Led Zeppelin",
                genre: "rock",
                year: 1971,
                price: 35.99,
                image: null,
                featured: false,
                description: "One of the greatest rock albums ever recorded."
            },
            {
                id: 7,
                title: "The Wall",
                artist: "Pink Floyd",
                genre: "rock",
                year: 1979,
                price: 42.99,
                image: null,
                featured: false,
                description: "A rock opera about isolation and personal struggle."
            },
            {
                id: 8,
                title: "Time Out",
                artist: "Dave Brubeck",
                genre: "jazz",
                year: 1959,
                price: 28.99,
                image: null,
                featured: false,
                description: "Groundbreaking jazz album with unusual time signatures."
            },
            {
                id: 9,
                title: "Rumours",
                artist: "Fleetwood Mac",
                genre: "rock",
                year: 1977,
                price: 31.99,
                image: null,
                featured: false,
                description: "One of the best-selling albums of all time."
            },
            {
                id: 10,
                title: "A Love Supreme",
                artist: "John Coltrane",
                genre: "jazz",
                year: 1965,
                price: 33.99,
                image: null,
                featured: false,
                description: "A spiritual jazz masterpiece."
            },
            {
                id: 11,
                title: "Hotel California",
                artist: "Eagles",
                genre: "rock",
                year: 1976,
                price: 30.99,
                image: null,
                featured: false,
                description: "The Eagles' most successful album."
            },
            {
                id: 12,
                title: "Sgt. Pepper's Lonely Hearts Club Band",
                artist: "The Beatles",
                genre: "rock",
                year: 1967,
                price: 37.99,
                image: null,
                featured: false,
                description: "Often considered the greatest album of all time."
            },
            {
                id: 13,
                title: "Kind of Blue",
                artist: "Miles Davis",
                genre: "jazz",
                year: 1959,
                price: 34.99,
                image: null,
                featured: false,
                description: "The best-selling jazz album of all time."
            },
            {
                id: 14,
                title: "Thriller",
                artist: "Michael Jackson",
                genre: "pop",
                year: 1982,
                price: 29.99,
                image: null,
                featured: false,
                description: "The best-selling album of all time."
            },
            {
                id: 15,
                title: "Back in Black",
                artist: "AC/DC",
                genre: "rock",
                year: 1980,
                price: 26.99,
                image: null,
                featured: false,
                description: "One of the best-selling albums in history."
            },
            {
                id: 16,
                title: "The Rise and Fall of Ziggy Stardust",
                artist: "David Bowie",
                genre: "rock",
                year: 1972,
                price: 32.99,
                image: null,
                featured: false,
                description: "A glam rock concept album."
            },
            {
                id: 17,
                title: "Blue Train",
                artist: "John Coltrane",
                genre: "jazz",
                year: 1957,
                price: 27.99,
                image: null,
                featured: false,
                description: "A hard bop jazz classic."
            },
            {
                id: 18,
                title: "Born to Run",
                artist: "Bruce Springsteen",
                genre: "rock",
                year: 1975,
                price: 28.99,
                image: null,
                featured: false,
                description: "Springsteen's breakthrough album."
            },
            {
                id: 19,
                title: "Pet Sounds",
                artist: "The Beach Boys",
                genre: "pop",
                year: 1966,
                price: 33.99,
                image: null,
                featured: false,
                description: "A pioneering pop album with complex arrangements."
            },
            {
                id: 20,
                title: "Electric Ladyland",
                artist: "Jimi Hendrix",
                genre: "rock",
                year: 1968,
                price: 36.99,
                image: null,
                featured: false,
                description: "Hendrix's final studio album."
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter controls
        const genreFilter = document.getElementById('genreFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (genreFilter) {
            genreFilter.addEventListener('change', () => this.applyFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyFilters());
        }

        // Cart functionality
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.querySelector('.close-cart');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }
        if (closeCart) {
            closeCart.addEventListener('click', () => this.toggleCart());
        }
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Genre cards
        const genreCards = document.querySelectorAll('.genre-card');
        genreCards.forEach(card => {
            card.addEventListener('click', () => {
                const genre = card.dataset.genre;
                this.filterByGenre(genre);
            });
        });

        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Close cart when clicking outside
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.toggleCart();
                }
            });
        }

        // Contact form
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletter(e));
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        this.filteredProducts = this.products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.artist.toLowerCase().includes(searchTerm) ||
            product.genre.toLowerCase().includes(searchTerm)
        );
        this.renderCatalog();
    }

    applyFilters() {
        const genreFilter = document.getElementById('genreFilter').value;
        const priceFilter = document.getElementById('priceFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;

        this.filteredProducts = this.products.filter(product => {
            let matchesGenre = !genreFilter || product.genre === genreFilter;
            let matchesPrice = true;

            if (priceFilter) {
                const [min, max] = priceFilter.split('-').map(p => 
                    p === '+' ? Infinity : parseInt(p)
                );
                matchesPrice = product.price >= min && product.price <= max;
            }

            return matchesGenre && matchesPrice;
        });

        // Sort products
        this.sortProducts(sortFilter);
        this.renderCatalog();
    }

    sortProducts(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'year':
                this.filteredProducts.sort((a, b) => b.year - a.year);
                break;
        }
    }

    filterByGenre(genre) {
        const genreFilter = document.getElementById('genreFilter');
        if (genreFilter) {
            genreFilter.value = genre;
            this.applyFilters();
        }
        this.scrollToSection('catalog');
    }

    renderFeaturedProducts() {
        const featuredGrid = document.getElementById('featuredGrid');
        if (!featuredGrid) return;

        const featuredProducts = this.products.filter(product => product.featured);
        
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="product-card fade-in">
                <div class="product-image">
                    <div class="product-placeholder">${product.artist.charAt(0)}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-artist">${product.artist}</p>
                    <span class="product-genre">${product.genre}</span>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart" onclick="vinylShop.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCatalog() {
        const catalogGrid = document.getElementById('catalogGrid');
        if (!catalogGrid) return;

        catalogGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card fade-in">
                <div class="product-image">
                    <div class="product-placeholder">${product.artist.charAt(0)}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-artist">${product.artist} (${product.year})</p>
                    <span class="product-genre">${product.genre}</span>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart" onclick="vinylShop.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.updateCartDisplay();
        this.showCartNotification();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartDisplay();
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">${item.artist.charAt(0)}</div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-artist">${item.artist}</div>
                        </div>
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="vinylShop.updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="vinylShop.updateQuantity(${item.id}, 1)">+</button>
                            <button class="remove-item" onclick="vinylShop.removeFromCart(${item.id})">Remove</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2);
        }
    }

    toggleCart() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
        }
    }

    showCartNotification() {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = 'Added to cart!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Thank you for your order! Total: $${total.toFixed(2)}\n\nThis is a demo - no actual payment will be processed.`);
        
        // Clear cart after checkout
        this.cart = [];
        this.updateCartDisplay();
        this.toggleCart();
    }

    handleContactForm(e) {
        e.preventDefault();
        alert('Thank you for your message! We\'ll get back to you soon.');
        e.target.reset();
    }

    handleNewsletter(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        alert(`Thank you for subscribing with ${email}!`);
        e.target.reset();
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the vinyl shop when the page loads
let vinylShop;
document.addEventListener('DOMContentLoaded', () => {
    vinylShop = new VinylShop();
});

// Smooth scrolling for hero buttons
function scrollToSection(sectionId) {
    if (vinylShop) {
        vinylShop.scrollToSection(sectionId);
    }
}

// Mobile menu toggle (if needed)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all product cards and sections
    document.querySelectorAll('.product-card, .genre-card, .about-content, .contact-content').forEach(el => {
        observer.observe(el);
    });

    // Add hover effects to vinyl records
    document.querySelectorAll('.vinyl-record').forEach(record => {
        record.addEventListener('mouseenter', () => {
            record.style.transform += ' scale(1.05)';
        });
        
        record.addEventListener('mouseleave', () => {
            record.style.transform = record.style.transform.replace(' scale(1.05)', '');
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.style.display === 'block') {
            vinylShop.toggleCart();
        }
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add some fun easter eggs
let clickCount = 0;
document.querySelector('.nav-logo').addEventListener('click', () => {
    clickCount++;
    if (clickCount === 5) {
        alert('🎵 VinylVibe Secret: You found the hidden groove! 🎵');
        clickCount = 0;
    }
});