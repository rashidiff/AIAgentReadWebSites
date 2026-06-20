const products = [
    {
        id: 1,
        name: "QuietMax Pro",
        category: "Noise-Cancelling Headphones",
        price: 129,
        batteryLife: "40 hours",
        noiseCancelling: "Active ANC",
        bestFor: "Remote meetings and open-office work",
        stock: "In stock",
        rating: 4.6,
        reviews: 184,
        description: "Comfortable noise-cancelling headphones designed for remote workers and long meetings."
    },
    {
        id: 2,
        name: "SoundLite Air",
        category: "Noise-Cancelling Headphones",
        price: 79,
        batteryLife: "28 hours",
        noiseCancelling: "Passive noise isolation",
        bestFor: "Students",
        stock: "In stock",
        rating: 4.2,
        reviews: 96,
        description: "Lightweight headphones for studying, online classes, and everyday listening."
    },
    {
        id: 3,
        name: "FocusBeat X",
        category: "Noise-Cancelling Headphones",
        price: 149,
        batteryLife: "45 hours",
        noiseCancelling: "Active ANC",
        bestFor: "Open offices",
        stock: "Low stock",
        rating: 4.7,
        reviews: 142,
        description: "Premium headphones for professionals who need long battery life and strong noise cancellation."
    },
    {
        id: 4,
        name: "TravelSound Mini",
        category: "Noise-Cancelling Headphones",
        price: 99,
        batteryLife: "32 hours",
        noiseCancelling: "Active ANC",
        bestFor: "Travel",
        stock: "Out of stock",
        rating: 4.3,
        reviews: 73,
        description: "Compact travel headphones with foldable design and strong battery performance."
    },
    {
        id: 5,
        name: "ViewGo 14",
        category: "Portable Monitors",
        price: 179,
        size: "14 inch",
        resolution: "Full HD",
        bestFor: "Students",
        stock: "In stock",
        rating: 4.4,
        reviews: 121,
        description: "Portable monitor for studying, presentations, and light productivity."
    },
    {
        id: 6,
        name: "DualDesk 15",
        category: "Portable Monitors",
        price: 229,
        size: "15.6 inch",
        resolution: "Full HD",
        bestFor: "Remote workers",
        stock: "In stock",
        rating: 4.5,
        reviews: 138,
        description: "A second-screen solution for remote workers who need more workspace."
    },
    {
        id: 7,
        name: "ColorPro 16",
        category: "Portable Monitors",
        price: 319,
        size: "16 inch",
        resolution: "2.5K",
        bestFor: "Designers",
        stock: "Low stock",
        rating: 4.8,
        reviews: 87,
        description: "High-resolution portable monitor for creative work and color-sensitive tasks."
    },
    {
        id: 8,
        name: "LiteScreen 13",
        category: "Portable Monitors",
        price: 139,
        size: "13 inch",
        resolution: "HD",
        bestFor: "Travel and mobile remote work",
        stock: "In stock",
        rating: 4.1,
        reviews: 64,
        description: "Lightweight portable screen for travel and basic productivity."
    },
    {
        id: 9,
        name: "ErgoType Flex",
        category: "Ergonomic Keyboards",
        price: 89,
        type: "Split ergonomic keyboard",
        connectivity: "Bluetooth",
        bestFor: "Programmers",
        stock: "In stock",
        rating: 4.5,
        reviews: 112,
        description: "Split ergonomic keyboard designed for long coding and writing sessions."
    },
    {
        id: 10,
        name: "KeyLite Mini",
        category: "Ergonomic Keyboards",
        price: 49,
        type: "Compact keyboard",
        connectivity: "USB-C",
        bestFor: "Students",
        stock: "In stock",
        rating: 4.0,
        reviews: 58,
        description: "Compact and affordable keyboard for small desks and student setups."
    },
    {
        id: 11,
        name: "OfficeBoard Pro",
        category: "Ergonomic Keyboards",
        price: 69,
        type: "Full-size keyboard",
        connectivity: "Wireless",
        bestFor: "Office teams",
        stock: "In stock",
        rating: 4.3,
        reviews: 91,
        description: "Full-size keyboard for office productivity and daily business use."
    },
    {
        id: 12,
        name: "SilentKeys Touch",
        category: "Ergonomic Keyboards",
        price: 59,
        type: "Low-noise keyboard",
        connectivity: "Bluetooth",
        bestFor: "Shared workspaces",
        stock: "Out of stock",
        rating: 4.2,
        reviews: 76,
        description: "Quiet keyboard for shared offices, libraries, and late-night work."
    }
];

const displayCategoryMap = {
    "Noise-Cancelling Headphones": "Headphones for remote meetings and focus",
    "Portable Monitors": "Portable monitors for mobile productivity",
    "Ergonomic Keyboards": "Ergonomic keyboards for comfortable typing and desk work"
};

function getDisplayCategory(categoryKey) {
    return displayCategoryMap[categoryKey] || categoryKey;
}

function getCanonicalCategoryKey(categoryValue) {
    const map = {
        "Noise-Cancelling Headphones": "headphones",
        "Portable Monitors": "monitors",
        "Ergonomic Keyboards": "keyboards",
        headphones: "headphones",
        monitors: "monitors",
        keyboards: "keyboards"
    };
    return map[categoryValue] || null;
}

function getProductTypeNoun(product) {
    const key = getCanonicalCategoryKey(product.category);
    if (key === 'headphones') return 'headphone';
    if (key === 'monitors') return 'monitor';
    if (key === 'keyboards') return 'keyboard';
    return 'product';
}

// Cart Logic
let cart = JSON.parse(localStorage.getItem('ecotech_cart')) || [];

function toProductSlug(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getProductSlugById(productId) {
    const product = products.find((p) => p.id === productId);
    return product ? toProductSlug(product.name) : '';
}

function getStockMetadata(stockStatus) {
    const normalized = String(stockStatus || '').trim().toLowerCase();
    if (normalized === 'in stock') {
        return {
            dataStockStatus: 'in_stock',
            availability: 'available',
            purchasable: true
        };
    }
    if (normalized === 'low stock') {
        return {
            dataStockStatus: 'low_stock',
            availability: 'available',
            purchasable: true
        };
    }
    if (normalized === 'out of stock') {
        return {
            dataStockStatus: 'out_of_stock',
            availability: 'unavailable',
            purchasable: false
        };
    }
    if (normalized === 'unavailable') {
        return {
            dataStockStatus: 'unavailable',
            availability: 'unavailable',
            purchasable: false
        };
    }
    return {
        dataStockStatus: normalized.replace(/\s+/g, '_') || 'unavailable',
        availability: 'unavailable',
        purchasable: false
    };
}

function ensureStatusRegion() {
    let region = document.getElementById('action-status');
    if (!region) {
        region = document.createElement('div');
        region.id = 'action-status';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.style.margin = '0.5rem 0';
        const main = document.querySelector('main');
        if (main) {
            main.prepend(region);
        } else {
            document.body.prepend(region);
        }
    }
    return region;
}

function announceActionStatus(message) {
    const region = ensureStatusRegion();
    region.textContent = message;
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const stockMeta = getStockMetadata(product.stock);
    if (!stockMeta.purchasable) {
        announceActionStatus(`Action unavailable: ${product.name} is ${String(product.stock || 'unavailable').toLowerCase()}.`);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
        announceActionStatus(`${product.name} quantity updated in cart. Quantity: ${existingItem.quantity}.`);
    } else {
        cart.push({ ...product, quantity: 1 });
        announceActionStatus(`${product.name} has been added to cart. Quantity: 1.`);
    }

    saveCart();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('ecotech_cart', JSON.stringify(cart));
}

// Initialize common UI elements
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    ensureStatusRegion();

    // Home Page specific logic
    if (document.getElementById('featured-products')) {
        renderFeaturedProducts();
    }
    if (document.getElementById('deals-grid')) {
        renderDeals();
    }
});

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    // Just pick the first 3 products as featured
    const featured = products.slice(0, 3);
    
    featured.forEach(product => {
        const stockMeta = getStockMetadata(product.stock);
        const productType = product.category === "Noise-Cancelling Headphones"
            ? "Active or passive noise-cancelling headphones"
            : product.category === "Portable Monitors"
                ? "Portable monitor"
                : product.category === "Ergonomic Keyboards"
                    ? "Ergonomic keyboard"
                    : null;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', toProductSlug(product.name));
        card.setAttribute('data-product-name', product.name);
        card.setAttribute('data-category', getCanonicalCategoryKey(product.category) || product.category);
        card.setAttribute('data-price', String(product.price));
        card.setAttribute('data-stock-status', stockMeta.dataStockStatus);
        card.setAttribute('data-availability', stockMeta.availability);
        card.setAttribute('data-purchasable', String(stockMeta.purchasable));
        if (typeof product.rating !== 'undefined') {
            card.setAttribute('data-rating', String(product.rating));
        }
        if (product.batteryLife) {
            card.setAttribute('data-battery-life', product.batteryLife);
        }
        card.innerHTML = `
            <div class="product-img">📦</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                ${productType ? `<p><strong>Product type:</strong> ${productType}</p>` : ''}
                <p><strong>Category:</strong> ${getDisplayCategory(product.category)}</p>
                <p><strong>Price:</strong> €${product.price}</p>
                <p><strong>Currency:</strong> EUR</p>
                <p id="stock-${toProductSlug(product.name)}"><strong>Stock status:</strong> ${product.stock}</p>
                <p><strong>Rating:</strong> ${product.rating}/5</p>
                ${product.batteryLife ? `<p><strong>Battery life:</strong> ${product.batteryLife}</p>` : ''}
                ${product.noiseCancelling ? `<p><strong>Noise cancelling type:</strong> ${product.noiseCancelling}</p>` : ''}
                <p><strong>Best use case:</strong> ${product.bestFor}</p>
                <a href="pages/products.html?q=${encodeURIComponent(product.name)}" class="btn" style="margin-top: 1rem; width: 100%; text-align: center;" data-action="view-details" data-product-id="${toProductSlug(product.name)}" data-product-name="${product.name}" data-category="${getCanonicalCategoryKey(product.category) || product.category}" aria-label="View details for ${product.name}">View details for ${product.name}</a>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderDeals() {
    const container = document.getElementById('deals-grid');
    if (!container) return;

    // Mock some deals (products 4, 7, 12)
    const dealIds = [4, 7, 12];
    const deals = products.filter(p => dealIds.includes(p.id));

    deals.forEach(product => {
        const stockMeta = getStockMetadata(product.stock);
        const productTypeNoun = getProductTypeNoun(product);
        const discount = 20;
        const originalPrice = product.price + discount;
        const productType = product.category === "Noise-Cancelling Headphones"
            ? "Active or passive noise-cancelling headphones"
            : product.category === "Portable Monitors"
                ? "Portable monitor"
                : product.category === "Ergonomic Keyboards"
                    ? "Ergonomic keyboard"
                    : null;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', toProductSlug(product.name));
        card.setAttribute('data-product-name', product.name);
        card.setAttribute('data-category', getCanonicalCategoryKey(product.category) || product.category);
        card.setAttribute('data-price', String(product.price));
        card.setAttribute('data-stock-status', stockMeta.dataStockStatus);
        card.setAttribute('data-availability', stockMeta.availability);
        card.setAttribute('data-purchasable', String(stockMeta.purchasable));
        if (typeof product.rating !== 'undefined') {
            card.setAttribute('data-rating', String(product.rating));
        }
        if (product.batteryLife) {
            card.setAttribute('data-battery-life', product.batteryLife);
        }
        card.innerHTML = `
            <div class="product-img">🔥</div>
            <div class="product-info">
                <span style="background: var(--accent-color); color: white; padding: 2px 5px; font-size: 0.8rem; border-radius: 4px;">DEAL</span>
                <h3>${product.name}</h3>
                <p><span style="text-decoration: line-through; color: var(--light-text);">€${originalPrice}</span> <strong style="color: var(--accent-color);">€${product.price}</strong></p>
                <p style="font-size: 0.9rem; margin: 0.5rem 0;">${product.description}</p>
                ${productType ? `<p><strong>Product type:</strong> ${productType}</p>` : ''}
                <p><strong>Category:</strong> ${getDisplayCategory(product.category)}</p>
                <p><strong>Price:</strong> €${product.price}</p>
                <p><strong>Currency:</strong> EUR</p>
                <p id="stock-${toProductSlug(product.name)}"><strong>Stock status:</strong> ${product.stock}</p>
                <p><strong>Rating:</strong> ${product.rating}/5</p>
                ${product.batteryLife ? `<p><strong>Battery life:</strong> ${product.batteryLife}</p>` : ''}
                ${product.noiseCancelling ? `<p><strong>Noise cancelling type:</strong> ${product.noiseCancelling}</p>` : ''}
                <p><strong>Best use case:</strong> ${product.bestFor}</p>
                <button class="btn" type="button" style="width: 100%;" onclick="addToCart(${product.id})" data-action="add-to-cart" data-product-id="${toProductSlug(product.name)}" data-product-name="${product.name}" data-category="${getCanonicalCategoryKey(product.category) || product.category}" data-stock-status="${stockMeta.dataStockStatus}" data-availability="${stockMeta.availability}" data-purchasable="${String(stockMeta.purchasable)}" aria-label="${!stockMeta.purchasable ? `Add ${product.name} ${productTypeNoun} to cart unavailable because product is ${String(product.stock || 'unavailable').toLowerCase()}` : `Add ${product.name} ${productTypeNoun} to cart`}"${!stockMeta.purchasable ? ` disabled aria-disabled="true" aria-describedby="stock-${toProductSlug(product.name)}"` : ''}>Add ${product.name} to cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

