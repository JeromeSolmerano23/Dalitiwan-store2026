/* Dalitiwan Store Inventory Management System - Frontend Logic */
const STORAGE_KEYS = {
  PRODUCTS: 'dalitiwan_store_products_v1',
  HISTORY: 'dalitiwan_store_history_v1'
};

const DEFAULT_PRODUCTS = [
  {
    id: 'PRD-001',
    name: 'Sardines',
    category: 'Canned Goods',
    price: 32.00,
    quantity: 28,
    reorderLevel: 10,
    unit: 'can (155g)',
    image: 'assets/images/sardines.svg'
  },
  {
    id: 'PRD-002',
    name: 'Shampoo',
    category: 'Personal Care',
    price: 10.00,
    quantity: 65,
    reorderLevel: 15,
    unit: 'sachet',
    image: 'assets/images/shampoo.svg'
  },
  {
    id: 'PRD-003',
    name: 'Rebisco Biscuits',
    category: 'Snacks & Biscuits',
    price: 8.00,
    quantity: 9,
    reorderLevel: 12,
    unit: 'pack',
    image: 'assets/images/rebisco.svg'
  },
  {
    id: 'PRD-004',
    name: 'Egg',
    category: 'Dairy & Eggs',
    price: 12.00,
    quantity: 42,
    reorderLevel: 15,
    unit: 'piece',
    image: 'assets/images/egg.svg'
  },
  {
    id: 'PRD-005',
    name: 'Instant Noodles',
    category: 'Noodles & Instant',
    price: 15.00,
    quantity: 6,
    reorderLevel: 10,
    unit: 'pack',
    image: 'assets/images/noodles.svg'
  },
  {
    id: 'PRD-006',
    name: 'Bottled Water',
    category: 'Beverages',
    price: 25.00,
    quantity: 0,
    reorderLevel: 10,
    unit: 'bottle (500ml)',
    image: 'assets/images/water.svg'
  },
  {
    id: 'PRD-007',
    name: 'Well-Milled Rice (1 kg)',
    category: 'Rice & Grains',
    price: 52.00,
    quantity: 18,
    reorderLevel: 8,
    unit: 'kg',
    image: 'assets/images/rice.svg'
  },
  {
    id: 'PRD-008',
    name: '3-in-1 Coffee Twin Pack',
    category: 'Beverages',
    price: 14.00,
    quantity: 5,
    reorderLevel: 10,
    unit: 'twin pack',
    image: 'assets/images/coffee.svg'
  }
];

const DEFAULT_HISTORY = [
  {
    id: 'MOV-101',
    productName: 'Well-Milled Rice (1 kg)',
    type: 'Stock In',
    qty: 20,
    beforeQty: 0,
    afterQty: 20,
    note: 'Morning sack delivery at Bakia, Majayjay',
    timestamp: 'Today, 7:15 AM'
  },
  {
    id: 'MOV-102',
    productName: 'Egg',
    type: 'Stock Out',
    qty: 18,
    beforeQty: 60,
    afterQty: 42,
    note: 'Neighborhood retail sales',
    timestamp: 'Today, 9:40 AM'
  },
  {
    id: 'MOV-103',
    productName: 'Rebisco Biscuits',
    type: 'Stock Out',
    qty: 11,
    beforeQty: 20,
    afterQty: 9,
    note: 'Afternoon snack sales (Low Stock)',
    timestamp: 'Today, 1:25 PM'
  },
  {
    id: 'MOV-104',
    productName: 'Bottled Water',
    type: 'Stock Out',
    qty: 12,
    beforeQty: 12,
    afterQty: 0,
    note: 'Sold out cold & regular bottles',
    timestamp: 'Today, 3:50 PM'
  },
  {
    id: 'MOV-105',
    productName: 'Sardines',
    type: 'Stock In',
    qty: 30,
    beforeQty: 0,
    afterQty: 30,
    note: 'Restocked canned goods shelf',
    timestamp: 'Yesterday, 4:30 PM'
  }
];

const CATEGORY_IMAGES = {
  'Canned Goods': 'assets/images/sardines.svg',
  'Personal Care': 'assets/images/shampoo.svg',
  'Snacks & Biscuits': 'assets/images/rebisco.svg',
  'Dairy & Eggs': 'assets/images/egg.svg',
  'Noodles & Instant': 'assets/images/noodles.svg',
  'Beverages': 'assets/images/water.svg',
  'Rice & Grains': 'assets/images/rice.svg'
};

let pendingDeleteId = null;

function getProducts() {
  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_PRODUCTS];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getHistory() {
  const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_HISTORY));
    return [...DEFAULT_HISTORY];
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_HISTORY];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function resetSampleData() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_HISTORY));
  showToast('Sample data for Dalitiwan Store has been restored.');
  renderCurrentPage();
}

function formatPeso(amount) {
  return '₱' + Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getStockStatus(product) {
  const qty = Number(product.quantity);
  const reorder = Number(product.reorderLevel ?? 10);
  if (qty <= 0) {
    return {
      key: 'out',
      label: 'Out of Stock',
      badgeClass: 'badge-out-of-stock',
      icon: 'fa-circle-xmark'
    };
  }
  if (qty <= reorder) {
    return {
      key: 'low',
      label: 'Low Stock',
      badgeClass: 'badge-low-stock',
      icon: 'fa-triangle-exclamation'
    };
  }
  return {
    key: 'in',
    label: 'In Stock',
    badgeClass: 'badge-in-stock',
    icon: 'fa-circle-check'
  };
}

function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#F4B942;"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 2800);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('open');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !backdrop) return;
  sidebar.classList.remove('open');
  backdrop.classList.remove('open');
}

function computeStats(products) {
  const totalProducts = products.length;
  const totalStockItems = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  const lowStockList = products.filter(p => getStockStatus(p).key === 'low');
  const outOfStockList = products.filter(p => getStockStatus(p).key === 'out');
  const inStockList = products.filter(p => getStockStatus(p).key === 'in');
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );

  return {
    totalProducts,
    totalStockItems,
    lowStockList,
    outOfStockList,
    inStockList,
    totalInventoryValue
  };
}

function logMovement(productName, type, qty, beforeQty, afterQty, note = '') {
  const history = getHistory();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
  const entry = {
    id: 'MOV-' + Math.floor(1000 + Math.random() * 9000),
    productName,
    type,
    qty: Number(qty),
    beforeQty: Number(beforeQty),
    afterQty: Number(afterQty),
    note: note || (type === 'Stock In' ? 'Stock added to shelf' : 'Item sold / issued'),
    timestamp: `Today, ${timeStr}`
  };
  history.unshift(entry);
  saveHistory(history.slice(0, 50));
}

/* Modal Controls for Add/Edit Product */
function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const titleEl = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('prodReorder').value = '10';
  document.getElementById('prodUnit').value = 'pc';

  if (productId) {
    const products = getProducts();
    const found = products.find(p => p.id === productId);
    if (found) {
      titleEl.textContent = 'Edit Product';
      document.getElementById('editProductId').value = found.id;
      document.getElementById('prodName').value = found.name;
      document.getElementById('prodCategory').value = found.category;
      document.getElementById('prodPrice').value = found.price;
      document.getElementById('prodQty').value = found.quantity;
      document.getElementById('prodReorder').value = found.reorderLevel ?? 10;
      document.getElementById('prodUnit').value = found.unit || 'pc';
    }
  } else {
    titleEl.textContent = 'Add New Product';
  }

  modal.classList.add('open');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('open');
}

function handleProductFormSubmit(event) {
  event.preventDefault();
  const editId = document.getElementById('editProductId').value.trim();
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const price = parseFloat(document.getElementById('prodPrice').value);
  const quantity = parseInt(document.getElementById('prodQty').value, 10);
  const reorderLevel = parseInt(document.getElementById('prodReorder').value, 10) || 10;
  const unit = document.getElementById('prodUnit').value.trim() || 'pc';

  if (!name || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0) {
    showToast('Please enter valid product details.');
    return;
  }

  const products = getProducts();
  if (editId) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      const prevQty = products[idx].quantity;
      products[idx] = {
        ...products[idx],
        name,
        category,
        price,
        quantity,
        reorderLevel,
        unit,
        image: CATEGORY_IMAGES[category] || products[idx].image || 'assets/images/rice.svg'
      };
      if (prevQty !== quantity) {
        const diff = quantity - prevQty;
        logMovement(
          name,
          diff >= 0 ? 'Stock In' : 'Stock Out',
          Math.abs(diff),
          prevQty,
          quantity,
          'Updated via Edit Product'
        );
      }
      saveProducts(products);
      showToast(`"${name}" has been updated.`);
    }
  } else {
    const newId = 'PRD-' + String(products.length + 1).padStart(3, '0') + '-' + Math.floor(10 + Math.random() * 89);
    const newProd = {
      id: newId,
      name,
      category,
      price,
      quantity,
      reorderLevel,
      unit,
      image: CATEGORY_IMAGES[category] || 'assets/images/rice.svg'
    };
    products.unshift(newProd);
    saveProducts(products);
    if (quantity > 0) {
      logMovement(name, 'Stock In', quantity, 0, quantity, 'Initial stock on new product');
    }
    showToast(`"${name}" added to Dalitiwan Store inventory.`);
  }

  closeProductModal();
  renderCurrentPage();
}

/* Delete Confirmation Modal */
function openDeleteModal(productId) {
  const products = getProducts();
  const target = products.find(p => p.id === productId);
  if (!target) return;

  pendingDeleteId = productId;
  const modal = document.getElementById('deleteModal');
  const label = document.getElementById('deleteProductLabel');
  if (label) label.textContent = `${target.name} (${formatPeso(target.price)})`;
  if (modal) modal.classList.add('open');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('open');
}

function confirmDeleteProduct() {
  if (!pendingDeleteId) return;
  const products = getProducts();
  const target = products.find(p => p.id === pendingDeleteId);
  const filtered = products.filter(p => p.id !== pendingDeleteId);
  saveProducts(filtered);
  if (target) {
    showToast(`Deleted "${target.name}" from products.`);
  }
  closeDeleteModal();
  renderCurrentPage();
}

/* Page Renderers */
function renderDashboard() {
  const products = getProducts();
  const history = getHistory();
  const stats = computeStats(products);

  const elTotalProd = document.getElementById('dashTotalProducts');
  const elTotalItems = document.getElementById('dashTotalItems');
  const elLowStock = document.getElementById('dashLowStock');
  const elOutStock = document.getElementById('dashOutStock');
  const elInvValue = document.getElementById('dashInventoryValue');

  if (elTotalProd) elTotalProd.textContent = stats.totalProducts;
  if (elTotalItems) elTotalItems.textContent = stats.totalStockItems;
  if (elLowStock) elLowStock.textContent = stats.lowStockList.length;
  if (elOutStock) elOutStock.textContent = stats.outOfStockList.length;
  if (elInvValue) elInvValue.textContent = formatPeso(stats.totalInventoryValue);

  // Recent Inventory Activity
  const activityListEl = document.getElementById('dashRecentActivity');
  if (activityListEl) {
    if (history.length === 0) {
      activityListEl.innerHTML = '<div class="empty-state">No recent inventory movements recorded.</div>';
    } else {
      activityListEl.innerHTML = history.slice(0, 6).map(item => {
        const isIn = item.type === 'Stock In';
        const badgeClass = isIn ? 'badge-stock-in' : 'badge-stock-out';
        const sign = isIn ? '+' : '-';
        return `
          <div class="activity-item">
            <div>
              <div class="activity-title">
                <span class="badge ${badgeClass}" style="margin-right:6px;">
                  <i class="fa-solid ${isIn ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
                  ${escapeHtml(item.type)} ${sign}${item.qty}
                </span>
                ${escapeHtml(item.productName)}
              </div>
              <div class="activity-desc">${escapeHtml(item.note)} (${item.beforeQty} → ${item.afterQty} units)</div>
            </div>
            <div class="activity-time">${escapeHtml(item.timestamp)}</div>
          </div>
        `;
      }).join('');
    }
  }

  // Inventory Summary Breakdown
  const summaryEl = document.getElementById('dashInventorySummary');
  if (summaryEl) {
    const total = Math.max(stats.totalProducts, 1);
    const rows = [
      {
        label: 'In Stock Products',
        count: stats.inStockList.length,
        pct: Math.round((stats.inStockList.length / total) * 100),
        color: '#2E7D32'
      },
      {
        label: 'Low Stock Products',
        count: stats.lowStockList.length,
        pct: Math.round((stats.lowStockList.length / total) * 100),
        color: '#D97706'
      },
      {
        label: 'Out of Stock Products',
        count: stats.outOfStockList.length,
        pct: Math.round((stats.outOfStockList.length / total) * 100),
        color: '#DC2626'
      }
    ];

    summaryEl.innerHTML = `
      <div style="margin-bottom:16px;padding:12px 14px;background:var(--secondary);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:600;color:var(--text-secondary);">Estimated Stock Value</span>
        <strong style="font-size:17px;color:var(--primary);">${formatPeso(stats.totalInventoryValue)}</strong>
      </div>
      ${rows.map(r => `
        <div class="summary-row">
          <div class="summary-row-top">
            <span style="font-weight:600;">${r.label}</span>
            <span style="color:var(--text-secondary);">${r.count} items (${r.pct}%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width:${r.pct}%;background-color:${r.color};"></div>
          </div>
        </div>
      `).join('')}
    `;
  }
}

function renderProductsPage() {
  const products = getProducts();
  const searchInput = document.getElementById('productSearch');
  const categorySelect = document.getElementById('productCategoryFilter');
  const tbody = document.getElementById('productsTableBody');
  const mobileList = document.getElementById('productsMobileCards');

  if (!tbody || !mobileList) return;

  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const category = categorySelect ? categorySelect.value : 'ALL';

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query);
    const matchesCat = category === 'ALL' || p.category === category;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No products match your search or category filter.</td></tr>`;
    mobileList.innerHTML = `<div class="empty-state">No products match your search or category filter.</div>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const status = getStockStatus(p);
    return `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="product-thumb" />
            <div>
              <div class="product-name-text">${escapeHtml(p.name)}</div>
              <div class="product-meta-text">${escapeHtml(p.id)} · per ${escapeHtml(p.unit || 'pc')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(p.category)}</td>
        <td><strong>${formatPeso(p.price)}</strong></td>
        <td><strong>${Number(p.quantity)}</strong> <span class="product-meta-text">${escapeHtml(p.unit || '')}</span></td>
        <td>
          <span class="badge ${status.badgeClass}">
            <i class="fa-solid ${status.icon}"></i>
            ${status.label}
          </span>
        </td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn btn-light btn-sm" onclick="openProductModal('${p.id}')" title="Edit Product">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button type="button" class="btn btn-danger-soft btn-sm" onclick="openDeleteModal('${p.id}')" title="Delete Product">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  mobileList.innerHTML = filtered.map(p => {
    const status = getStockStatus(p);
    return `
      <div class="mobile-product-card">
        <div class="mobile-card-top">
          <div class="product-cell">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="product-thumb" />
            <div>
              <div class="product-name-text">${escapeHtml(p.name)}</div>
              <div class="product-meta-text">${escapeHtml(p.category)}</div>
            </div>
          </div>
          <span class="badge ${status.badgeClass}">
            <i class="fa-solid ${status.icon}"></i>
            ${status.label}
          </span>
        </div>
        <div class="mobile-card-grid">
          <div><span style="color:var(--text-secondary);">Price:</span> <strong>${formatPeso(p.price)}</strong></div>
          <div><span style="color:var(--text-secondary);">Stock:</span> <strong>${Number(p.quantity)} ${escapeHtml(p.unit || '')}</strong></div>
        </div>
        <div class="mobile-card-actions">
          <button type="button" class="btn btn-light btn-sm" onclick="openProductModal('${p.id}')">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button type="button" class="btn btn-danger-soft btn-sm" onclick="openDeleteModal('${p.id}')">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderInventoryPage() {
  const products = getProducts();
  const history = getHistory();
  const selectEl = document.getElementById('stockProductSelect');
  const tbody = document.getElementById('inventoryTableBody');
  const mobileList = document.getElementById('inventoryMobileCards');
  const alertsEl = document.getElementById('lowStockAlertsList');
  const historyEl = document.getElementById('stockMovementHistory');

  if (selectEl) {
    const currentVal = selectEl.value;
    selectEl.innerHTML = products.map(p =>
      `<option value="${p.id}">${escapeHtml(p.name)} (Current: ${p.quantity})</option>`
    ).join('');
    if (currentVal && products.some(p => p.id === currentVal)) {
      selectEl.value = currentVal;
    }
  }

  if (tbody && mobileList) {
    tbody.innerHTML = products.map(p => {
      const status = getStockStatus(p);
      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="product-thumb" />
              <div>
                <div class="product-name-text">${escapeHtml(p.name)}</div>
                <div class="product-meta-text">${escapeHtml(p.category)} · ${formatPeso(p.price)}</div>
              </div>
            </div>
          </td>
          <td><strong style="font-size:15px;">${Number(p.quantity)}</strong> <span class="product-meta-text">${escapeHtml(p.unit || '')}</span></td>
          <td>${Number(p.reorderLevel ?? 10)} units</td>
          <td>
            <span class="badge ${status.badgeClass}">
              <i class="fa-solid ${status.icon}"></i>
              ${status.label}
            </span>
          </td>
          <td>
            <div class="action-btns">
              <button type="button" class="btn btn-primary btn-sm" onclick="quickAdjustStock('${p.id}', 'in', 5)">
                <i class="fa-solid fa-plus"></i> +5 In
              </button>
              <button type="button" class="btn btn-light btn-sm" onclick="quickAdjustStock('${p.id}', 'out', 1)">
                <i class="fa-solid fa-minus"></i> -1 Out
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    mobileList.innerHTML = products.map(p => {
      const status = getStockStatus(p);
      return `
        <div class="mobile-product-card">
          <div class="mobile-card-top">
            <div class="product-cell">
              <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="product-thumb" />
              <div>
                <div class="product-name-text">${escapeHtml(p.name)}</div>
                <div class="product-meta-text">Available: <strong>${Number(p.quantity)}</strong> ${escapeHtml(p.unit || '')}</div>
              </div>
            </div>
            <span class="badge ${status.badgeClass}">
              <i class="fa-solid ${status.icon}"></i>
              ${status.label}
            </span>
          </div>
          <div class="mobile-card-actions">
            <button type="button" class="btn btn-primary btn-sm" onclick="quickAdjustStock('${p.id}', 'in', 5)">
              <i class="fa-solid fa-plus"></i> Stock In (+5)
            </button>
            <button type="button" class="btn btn-light btn-sm" onclick="quickAdjustStock('${p.id}', 'out', 1)">
              <i class="fa-solid fa-minus"></i> Stock Out (-1)
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (alertsEl) {
    const alerts = products.filter(p => {
      const st = getStockStatus(p).key;
      return st === 'low' || st === 'out';
    });

    if (alerts.length === 0) {
      alertsEl.innerHTML = `
        <div style="padding:14px;background:var(--success-bg);color:var(--success);border-radius:10px;font-weight:600;">
          <i class="fa-solid fa-circle-check"></i> All store items are well-stocked above reorder thresholds.
        </div>
      `;
    } else {
      alertsEl.innerHTML = alerts.map(p => {
        const st = getStockStatus(p);
        return `
          <div class="activity-item">
            <div>
              <div class="activity-title">
                <span class="badge ${st.badgeClass}" style="margin-right:6px;">
                  <i class="fa-solid ${st.icon}"></i>${st.label}
                </span>
                ${escapeHtml(p.name)}
              </div>
              <div class="activity-desc">Current Stock: <strong>${p.quantity}</strong> (Reorder Alert at ≤ ${p.reorderLevel ?? 10})</div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="quickAdjustStock('${p.id}', 'in', 10)">
              +10 Restock
            </button>
          </div>
        `;
      }).join('');
    }
  }

  if (historyEl) {
    if (history.length === 0) {
      historyEl.innerHTML = '<div class="empty-state">No stock movements recorded yet.</div>';
    } else {
      historyEl.innerHTML = history.slice(0, 10).map(m => {
        const isIn = m.type === 'Stock In';
        return `
          <div class="activity-item">
            <div>
              <div class="activity-title">
                <span class="badge ${isIn ? 'badge-stock-in' : 'badge-stock-out'}" style="margin-right:6px;">
                  ${isIn ? 'Stock In' : 'Stock Out'} (${isIn ? '+' : '-'}${m.qty})
                </span>
                ${escapeHtml(m.productName)}
              </div>
              <div class="activity-desc">${escapeHtml(m.note)} · Qty: ${m.beforeQty} → ${m.afterQty}</div>
            </div>
            <div class="activity-time">${escapeHtml(m.timestamp)}</div>
          </div>
        `;
      }).join('');
    }
  }
}

function handleStockFormSubmit(event) {
  event.preventDefault();
  const productId = document.getElementById('stockProductSelect').value;
  const movementType = document.getElementById('stockTypeSelect').value;
  const qty = parseInt(document.getElementById('stockQtyInput').value, 10);
  const note = document.getElementById('stockNoteInput').value.trim();

  if (!productId || isNaN(qty) || qty <= 0) {
    showToast('Please enter a quantity greater than 0.');
    return;
  }

  quickAdjustStock(productId, movementType, qty, note);
  document.getElementById('stockQtyInput').value = '1';
  document.getElementById('stockNoteInput').value = '';
}

function quickAdjustStock(productId, direction, qty, customNote = '') {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return;

  const prod = products[idx];
  const beforeQty = Number(prod.quantity || 0);

  if (direction === 'out' && beforeQty < qty) {
    showToast(`Insufficient stock for "${prod.name}". Available: ${beforeQty}`);
    return;
  }

  const afterQty = direction === 'in' ? beforeQty + qty : beforeQty - qty;
  prod.quantity = afterQty;
  products[idx] = prod;
  saveProducts(products);

  const label = direction === 'in' ? 'Stock In' : 'Stock Out';
  logMovement(
    prod.name,
    label,
    qty,
    beforeQty,
    afterQty,
    customNote || (direction === 'in' ? 'Quick restock adjustment' : 'Quick counter sale adjustment')
  );

  showToast(`${label}: ${qty} ${prod.name} (${beforeQty} → ${afterQty})`);
  renderCurrentPage();
}

function renderReportsPage() {
  const products = getProducts();
  const stats = computeStats(products);

  const elTotal = document.getElementById('repTotalProducts');
  const elAvail = document.getElementById('repAvailableInventory');
  const elLow = document.getElementById('repLowStockCount');
  const elOut = document.getElementById('repOutStockCount');

  if (elTotal) elTotal.textContent = stats.totalProducts;
  if (elAvail) elAvail.textContent = stats.totalStockItems;
  if (elLow) elLow.textContent = stats.lowStockList.length;
  if (elOut) elOut.textContent = stats.outOfStockList.length;

  // Low Stock Report List
  const lowReportEl = document.getElementById('repLowStockList');
  if (lowReportEl) {
    if (stats.lowStockList.length === 0) {
      lowReportEl.innerHTML = '<div class="empty-state">No low stock products right now.</div>';
    } else {
      lowReportEl.innerHTML = stats.lowStockList.map(p => `
        <div class="activity-item">
          <div>
            <div class="activity-title">${escapeHtml(p.name)}</div>
            <div class="activity-desc">${escapeHtml(p.category)} · Unit Price: ${formatPeso(p.price)}</div>
          </div>
          <span class="badge badge-low-stock">
            <i class="fa-solid fa-triangle-exclamation"></i> ${p.quantity} left
          </span>
        </div>
      `).join('');
    }
  }

  // Out of Stock Report List
  const outReportEl = document.getElementById('repOutStockList');
  if (outReportEl) {
    if (stats.outOfStockList.length === 0) {
      outReportEl.innerHTML = '<div class="empty-state">No out-of-stock products right now.</div>';
    } else {
      outReportEl.innerHTML = stats.outOfStockList.map(p => `
        <div class="activity-item">
          <div>
            <div class="activity-title">${escapeHtml(p.name)}</div>
            <div class="activity-desc">${escapeHtml(p.category)} · Unit Price: ${formatPeso(p.price)}</div>
          </div>
          <span class="badge badge-out-of-stock">
            <i class="fa-solid fa-circle-xmark"></i> Out of Stock
          </span>
        </div>
      `).join('');
    }
  }

  // Visual Chart: Stock Quantity per Product
  const qtyChartEl = document.getElementById('repQuantityChart');
  if (qtyChartEl) {
    const maxQty = Math.max(...products.map(p => Number(p.quantity || 0)), 1);
    qtyChartEl.innerHTML = products.map(p => {
      const pct = Math.round((Number(p.quantity || 0) / maxQty) * 100);
      return `
        <div class="bar-chart-item">
          <div class="bar-chart-label">
            <strong>${escapeHtml(p.name)}</strong>
            <span>${p.quantity} units (${formatPeso(p.price * p.quantity)})</span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-value" style="width:${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Visual Chart: Inventory Value by Category
  const catChartEl = document.getElementById('repCategoryChart');
  if (catChartEl) {
    const catTotals = {};
    products.forEach(p => {
      const cat = p.category || 'General';
      catTotals[cat] = (catTotals[cat] || 0) + Number(p.price || 0) * Number(p.quantity || 0);
    });
    const entries = Object.entries(catTotals);
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    catChartEl.innerHTML = entries.map(([cat, val]) => {
      const pct = Math.round((val / maxVal) * 100);
      return `
        <div class="bar-chart-item">
          <div class="bar-chart-label">
            <strong>${escapeHtml(cat)}</strong>
            <span>${formatPeso(val)}</span>
          </div>
          <div class="bar-chart-track">
            <div class="bar-chart-value warm" style="width:${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Product Inventory Summary Table
  const summaryTbody = document.getElementById('repSummaryTableBody');
  if (summaryTbody) {
    summaryTbody.innerHTML = products.map(p => {
      const status = getStockStatus(p);
      const totalVal = Number(p.price || 0) * Number(p.quantity || 0);
      return `
        <tr>
          <td><strong>${escapeHtml(p.name)}</strong></td>
          <td>${escapeHtml(p.category)}</td>
          <td>${formatPeso(p.price)}</td>
          <td>${Number(p.quantity)}</td>
          <td><strong>${formatPeso(totalVal)}</strong></td>
          <td>
            <span class="badge ${status.badgeClass}">
              <i class="fa-solid ${status.icon}"></i>${status.label}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function renderCurrentPage() {
  const page = document.body.dataset.page;
  if (page === 'dashboard') renderDashboard();
  if (page === 'products') renderProductsPage();
  if (page === 'inventory') renderInventoryPage();
  if (page === 'reports') renderReportsPage();
}

document.addEventListener('DOMContentLoaded', () => {
  // Ensure default sample data exists
  getProducts();
  getHistory();
  renderCurrentPage();

  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });
});
