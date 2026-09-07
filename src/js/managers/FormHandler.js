/**
 * Form Handler
 * Handles form validation, calculation, and Zalo integration
 * @module managers/FormHandler
 */

import APP_CONFIG from '../config/app.config.js';
import appState from '../state/AppState.js';
import { isValidVnPhone, isValidName, isValidAddress, normalizePhone } from '../utils/validation.js';
import { formatVnd } from '../utils/format.js';
import logger from '../utils/logger.js';

class FormHandler {
    constructor() {
        this.form = null;
        this.productSelect = null;
        this.quantityInput = null;
        this.totalPriceDisplay = null;
        this.submitButton = null;
    }

    /**
     * Initialize form handler
     */
    init() {
        logger.info('[FormHandler]', 'Initializing...');
        
        this.cacheElements();
        this.setupEventListeners();
        this.setupValidation();
        
        logger.info('[FormHandler]', 'Initialized');
    }

    /**
     * Cache form elements
     */
    cacheElements() {
        this.form = document.getElementById('orderForm');
        this.productSelect = document.getElementById('product');
        this.quantityInput = document.getElementById('quantity');
        this.totalPriceDisplay = document.getElementById('totalPrice');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        this.nameInput = document.getElementById('name');
        this.phoneInput = document.getElementById('phone');
        this.addressInput = document.getElementById('address');
        this.messageInput = document.getElementById('message');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.form) {
            logger.warn('[FormHandler]', 'Order form not found');
            return;
        }

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Calculate total on product/quantity change
        if (this.productSelect) {
            this.productSelect.addEventListener('change', () => {
                this.calculateTotal();
            });
        }

        if (this.quantityInput) {
            this.quantityInput.addEventListener('input', () => {
                this.calculateTotal();
            });
        }

        // Real-time validation
        [this.nameInput, this.phoneInput, this.addressInput].forEach(input => {
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    // Clear error on input
                    this.clearFieldError(input);
                });
            }
        });
    }

    /**
     * Setup form validation
     */
    setupValidation() {
        // Phone number validation
        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d+]/g, '');
            });
        }

        // Quantity validation
        if (this.quantityInput) {
            this.quantityInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const min = parseInt(e.target.min);
                const max = parseInt(e.target.max);

                if (value < min) e.target.value = min;
                if (value > max) e.target.value = max;
            });
        }
    }

    /**
     * Validate a single field
     * @param {HTMLElement} field - Input field to validate
     * @returns {boolean} Is valid
     */
    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }

        if (fieldName === 'phone' && value) {
            if (!isValidVnPhone(value)) {
                isValid = false;
                errorMessage = APP_CONFIG.form.validation.phone.message;
            }
        }

        if (fieldName === 'name' && value) {
            if (!isValidName(value, APP_CONFIG.form.validation.name.minLength)) {
                isValid = false;
                errorMessage = APP_CONFIG.form.validation.name.message;
            }
        }

        if (fieldName === 'address' && value && !isValidAddress(value)) {
            isValid = false;
            errorMessage = 'Please enter a more complete delivery address';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    /**
     * Show field error
     * @param {HTMLElement} field - Input field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        field.classList.add('error');
        
        // Add visual indicator
        field.style.borderColor = 'var(--color-danger)';
        
        // Find or create error message element
        let errorEl = field.parentElement.querySelector('.form-error');
        
        if (!errorEl) {
            errorEl = document.createElement('p');
            errorEl.className = 'form-error';
            field.parentElement.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }

    /**
     * Clear field error
     * @param {HTMLElement} field - Input field
     */
    clearFieldError(field) {
        field.classList.remove('error');
        field.style.borderColor = '';
        
        const errorEl = field.parentElement.querySelector('.form-error');
        if (errorEl) {
            errorEl.classList.remove('visible');
        }
    }

    /**
     * Calculate order total
     */
    calculateTotal() {
        if (!this.productSelect || !this.quantityInput || !this.totalPriceDisplay) {
            return;
        }

        const selectedOption = this.productSelect.options[this.productSelect.selectedIndex];
        const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const quantity = parseInt(this.quantityInput.value) || 0;
        
        const total = price * quantity;
        
        // Update display with formatted price
        this.totalPriceDisplay.textContent = formatVnd(total);
        
        // Update state
        appState.set('orderTotal', total);
    }

    /**
     * Format price with thousand separators
     * @param {number} price - Price to format
     * @returns {string} Formatted price
     */
    formatPrice(price) {
        return formatVnd(price);
    }

    /**
     * Validate entire form
     * @returns {boolean} Is valid
     */
    validateForm() {
        const fields = [
            this.nameInput,
            this.phoneInput,
            this.addressInput
        ];

        let isValid = true;

        fields.forEach(field => {
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate product selection
        if (!this.productSelect.value) {
            this.showFieldError(this.productSelect, 'Please select a product');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handle form submission
     */
    handleSubmit() {
        // Validate form
        if (!this.validateForm()) {
            logger.warn('[FormHandler]', 'Form validation failed');
            
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return;
        }

        // Get form data
        const formData = this.getFormData();
        
        // Save to state
        appState.set('formData', formData);
        
        // Generate Zalo message
        const message = this.generateZaloMessage(formData);
        
        // Open Zalo with message
        this.openZalo(message);
        
        logger.info('[FormHandler]', 'Order prepared for Zalo');
    }

    /**
     * Get form data
     * @returns {object} Form data
     */
    getFormData() {
        const selectedOption = this.productSelect.options[this.productSelect.selectedIndex];
        
        return {
            name: this.nameInput.value.trim(),
            phone: normalizePhone(this.phoneInput.value.trim()),
            address: this.addressInput.value.trim(),
            product: selectedOption.textContent,
            productId: this.productSelect.value,
            quantity: parseInt(this.quantityInput.value),
            totalPrice: appState.get('orderTotal'),
            message: this.messageInput?.value.trim() || '',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate Zalo message from form data
     * @param {object} data - Form data
     * @returns {string} Message text
     */
    generateZaloMessage(data) {
        const lang = appState.get('currentLanguage');
        
        if (lang === 'vi') {
            return `🍖 ĐƠN HÀNG MỚI - DELTADEV LINK

👤 Họ tên: ${data.name}
📞 SĐT: ${data.phone}
📍 Địa chỉ: ${data.address}

🛒 SẢN PHẨM
- ${data.product}
- Số lượng: ${data.quantity}

💰 TỔNG TIỀN: ${this.formatPrice(data.totalPrice)}

${data.message ? `📝 Ghi chú: ${data.message}` : ''}

---
Cảm ơn bạn đã đặt hàng! 🙏`;
        } else {
            return `🍖 NEW ORDER - DELTADEV LINK

👤 Name: ${data.name}
📞 Phone: ${data.phone}
📍 Address: ${data.address}

🛒 ORDER DETAILS
- ${data.product}
- Quantity: ${data.quantity}

💰 TOTAL: ${this.formatPrice(data.totalPrice)}

${data.message ? `📝 Notes: ${data.message}` : ''}

---
Thank you for your order! 🙏`;
        }
    }

    /**
     * Open Zalo with pre-filled message
     * @param {string} message - Message text
     */
    openZalo(message) {
        const zaloNumber = APP_CONFIG.contact.zaloNumber;
        const zaloWebUrl = `https://zalo.me/${zaloNumber}`;

        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(message).catch(() => {});
        }

        window.open(zaloWebUrl, '_blank', 'noopener,noreferrer');
        this.showSuccessMessage();
    }

    /**
     * Show success message
     */
    showSuccessMessage() {
        const lang = appState.get('currentLanguage');
        const message = lang === 'vi' 
            ? '✅ Đã sao chép đơn hàng. Đang mở Zalo để gửi...' 
            : '✅ Order copied. Opening Zalo to send...';
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 right-8 bg-success text-white px-6 py-4 rounded-lg shadow-xl z-50 animate-slideInUp';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Reset form
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
            this.calculateTotal();
            
            // Clear all errors
            const errors = this.form.querySelectorAll('.form-error');
            errors.forEach(error => error.remove());
            
            const errorFields = this.form.querySelectorAll('.error');
            errorFields.forEach(field => {
                field.classList.remove('error');
                field.style.borderColor = '';
            });
        }
    }
}

export default FormHandler;
