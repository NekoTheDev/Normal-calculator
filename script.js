const app = {
            current: '0',
            prev: '',
            opCode: null,
            resetNext: false,
            
            // DOM Elements
            els: {
                display: document.getElementById('display'),
                history: document.getElementById('history'),
                viewCalc: document.getElementById('view-calculator'),
                viewPay: document.getElementById('view-payment'),
                payResult: document.getElementById('payment-result'),
                checkout: document.getElementById('checkout-form'),
                planName: document.getElementById('plan-name-display'),
                success: document.getElementById('success-overlay'),
                payBtn: document.getElementById('pay-btn')
            },

            // --- Calculator Functions ---
            updateUI() {
                this.els.display.textContent = this.current;
                this.els.history.textContent = this.prev + (this.opCode ? ` ${this.opCode} ` : '');
            },

            num(n) {
                if (this.current === '0' || this.resetNext) {
                    this.current = String(n);
                    this.resetNext = false;
                } else {
                    if (n === '.' && this.current.includes('.')) return;
                    this.current += n;
                }
                this.updateUI();
            },

            op(operator) {
                if (this.opCode !== null) this.calcInternal();
                this.prev = this.current;
                this.opCode = operator;
                this.resetNext = true;
                this.updateUI();
            },

            calcInternal() {
                if (!this.opCode || this.resetNext) return;
                const a = parseFloat(this.prev);
                const b = parseFloat(this.current);
                if (isNaN(a) || isNaN(b)) return;

                let res = 0;
                switch(this.opCode) {
                    case '+': res = a + b; break;
                    case '-': res = a - b; break;
                    case '*': res = a * b; break;
                    case '/': res = b === 0 ? 0 : a / b; break;
                }
                
                // Fix floating point issues
                res = Math.round(res * 100000000) / 100000000;

                // Handle extremely large results: allow reaching infinity.
                // If result is not finite or exceeds a sensible display threshold,
                // show the infinity symbol and return.
                const LARGE_THRESHOLD = 1e100;
                if (!Number.isFinite(res) || Math.abs(res) > LARGE_THRESHOLD) {
                    this.current = '∞';
                } else {
                    this.current = String(res);
                }
                this.opCode = null;
                this.prev = '';
                this.resetNext = true;
                this.updateUI();
                return this.current;
            },

            del() {
                if (this.resetNext) return;
                this.current = this.current.length > 1 ? this.current.slice(0, -1) : '0';
                this.updateUI();
            },

            clear() {
                this.current = '0';
                this.prev = '';
                this.opCode = null;
                this.resetNext = false;
                this.updateUI();
            },

            // --- Navigation / Logic ---
            calculate() {
                const final = this.calcInternal();
                if (final !== undefined) {
                    this.goToPayment(final);
                }
            },

            goToPayment(amount) {
                this.els.payResult.textContent = amount;
                
                // Switch View Animation
                this.els.viewCalc.style.opacity = '0';
                setTimeout(() => {
                    this.els.viewCalc.classList.remove('active');
                    this.els.viewPay.classList.add('active');
                    // Scroll to top
                    window.scrollTo(0,0);
                }, 300);
            },

            // --- Payment Functions ---
            selectPlan(name) {
                // UI Highlight
                document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
                const card = document.querySelector(`.p-${name.toLowerCase()} .plan-select-btn`).closest('.plan-card');
                card.classList.add('active');

                // Show Form
                this.els.planName.textContent = name.toUpperCase();
                this.els.checkout.style.display = 'block';
                this.els.checkout.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },

            processPayment(e) {
                e.preventDefault();
                const btn = this.els.payBtn;
                const spinner = btn.querySelector('.spinner');
                const text = btn.querySelector('span');

                // Loading State
                btn.disabled = true;
                text.style.display = 'none';
                spinner.style.display = 'block';

                setTimeout(() => {
                    spinner.style.display = 'none';
                    text.style.display = 'block';
                    this.els.success.style.display = 'flex';
                }, 1500);
            },

            reset() {
                // Reset everything to initial state
                this.clear();
                this.els.viewPay.classList.remove('active');
                this.els.viewCalc.classList.add('active');
                this.els.viewCalc.style.opacity = '1';
                this.els.checkout.style.display = 'none';
                this.els.success.style.display = 'none';
                this.els.payBtn.disabled = false;
                document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('active'));
                document.querySelector('form').reset();
            }
        };