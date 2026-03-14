/**
 * Google Lens Table Scanner
 * Main Application Class
 * Version: 2.0.0 - Enhanced with auto table formatting
 */

class GoogleLensTableScanner {
    constructor() {
        this.version = '2.0.0';
        this.tableData = [];
        this.processedData = [];
        this.currentFormat = 'auto';
        this.scanHistory = [];
        this.currentView = 'scan';
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.loadElements();
        this.attachEvents();
        this.loadFromStorage();
        this.checkDevice();
        this.setupServiceWorker();
        this.animateWelcome();
    }

    /**
     * Load DOM elements
     */
    loadElements() {
        // Navigation
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.navScan = document.getElementById('navScan');
        this.navTable = document.getElementById('navTable');
        this.navHistory = document.getElementById('navHistory');
        this.navHelp = document.getElementById('navHelp');

        // Main sections
        this.mainContent = document.getElementById('mainContent');
        this.statsCard = document.getElementById('statsCard');
        this.tableSection = document.getElementById('tableSection');
        this.resultsSection = document.getElementById('resultsSection');
        this.historySection = document.getElementById('historySection');

        // Stats elements
        this.tableSize = document.getElementById('tableSize');
        this.totalCells = document.getElementById('totalCells');
        this.filledCells = document.getElementById('filledCells');

        // Action buttons
        this.googleLensBtn = document.getElementById('googleLensBtn');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.menuBtn = document.getElementById('menuBtn');

        // Table controls
        this.tableRows = document.getElementById('tableRows');
        this.tableCols = document.getElementById('tableCols');
        this.resizeTableBtn = document.getElementById('resizeTableBtn');
        this.editTableBtn = document.getElementById('editTableBtn');
        this.refreshTableBtn = document.getElementById('refreshTableBtn');
        this.clearTableBtn = document.getElementById('clearTableBtn');
        this.processDataBtn = document.getElementById('processDataBtn');
        this.exportExcelBtn = document.getElementById('exportExcelBtn');

        // Results controls
        this.copyResultsBtn = document.getElementById('copyResultsBtn');
        this.downloadResultsBtn = document.getElementById('downloadResultsBtn');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.resultsCount = document.getElementById('resultsCount');

        // History controls
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Table view
        this.tableView = document.getElementById('tableView');

        // Modal elements
        this.pasteModal = document.getElementById('pasteModal');
        this.pasteArea = document.getElementById('pasteArea');
        this.previewSection = document.getElementById('previewSection');
        this.previewContent = document.getElementById('previewContent');
        this.confirmPasteBtn = document.getElementById('confirmPasteBtn');
        this.cancelPasteBtn = document.getElementById('cancelPasteBtn');
        this.closePasteModalBtn = document.getElementById('closePasteModalBtn');

        // Format buttons
        this.formatBtns = document.querySelectorAll('.format-btn');

        // Sample buttons
        this.sampleBtns = document.querySelectorAll('.sample-btn');

        // Loading and toast
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.toast = document.getElementById('toast');
        this.toastIcon = document.getElementById('toastIcon');
        this.toastMessage = document.getElementById('toastMessage');
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Navigation
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Main actions
        this.googleLensBtn.addEventListener('click', () => this.openGoogleLens());
        this.pasteBtn.addEventListener('click', () => this.openPasteModal());
        this.menuBtn.addEventListener('click', () => this.toggleMenu());

        // Table controls
        this.resizeTableBtn.addEventListener('click', () => this.resizeTable());
        this.editTableBtn.addEventListener('click', () => this.toggleEditMode());
        this.refreshTableBtn.addEventListener('click', () => this.refreshTable());
        this.clearTableBtn.addEventListener('click', () => this.clearTable());
        this.processDataBtn.addEventListener('click', () => this.processTableData());
        this.exportExcelBtn.addEventListener('click', () => this.exportToExcel());

        // Results controls
        this.copyResultsBtn.addEventListener('click', () => this.copyResults());
        this.downloadResultsBtn.addEventListener('click', () => this.downloadResults());

        // History controls
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Modal events
        this.confirmPasteBtn.addEventListener('click', () => this.handlePaste());
        this.cancelPasteBtn.addEventListener('click', () => this.closePasteModal());
        this.closePasteModalBtn.addEventListener('click', () => this.closePasteModal());

        // Format selection
        this.formatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFormat(e.target);
            });
        });

        // Sample data
        this.sampleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadSampleData(e.target.dataset.sample);
            });
        });

        // Paste area input
        this.pasteArea.addEventListener('input', () => this.showPreview());

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closePasteModal();
            }
        });

        // Handle back button
        window.addEventListener('popstate', () => this.handleBack());

        // Handle online/offline
        window.addEventListener('online', () => this.showToast('Back online!', 'success'));
        window.addEventListener('offline', () => this.showToast('You are offline', 'warning'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (!this.pasteModal.classList.contains('hidden')) {
                    return;
                }
                e.preventDefault();
                this.openPasteModal();
            }
            
            if (e.key === 'Escape' && !this.pasteModal.classList.contains('hidden')) {
                this.closePasteModal();
            }
        });
    }

    /**
     * Check device type and capabilities
     */
    checkDevice() {
        const ua = navigator.userAgent;
        const isAndroid = /Android/i.test(ua);
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        const isMobile = isAndroid || isIOS;

        this.deviceInfo = {
            isAndroid,
            isIOS,
            isMobile,
            isDesktop: !isMobile,
            hasTouch: 'ontouchstart' in window,
            hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
        };

        if (isAndroid) {
            this.showToast('📱 Android detected - Google Lens ready!', 'info', 3000);
        } else if (isIOS) {
            this.showToast('📱 iOS detected - Using web version', 'info', 3000);
        } else {
            this.showToast('💻 Desktop mode - Google Lens will open in browser', 'info', 3000);
        }
    }

    /**
     * Setup service worker for PWA
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(reg => {
                    console.log('Service Worker registered:', reg);
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        }
    }

    /**
     * Animate welcome section
     */
    animateWelcome() {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.style.animation = 'slideDown 0.5s ease';
        }
    }

    /**
     * Switch between views
     */
    switchView(view) {
        this.currentView = view;
        
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.tableSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
        this.historySection.classList.add('hidden');

        switch(view) {
            case 'scan':
                break;
            case 'table':
                if (this.tableData.length > 0) {
                    this.tableSection.classList.remove('hidden');
                } else {
                    this.showToast('No table data yet. Scan or paste first!', 'warning');
                    this.switchView('scan');
                }
                break;
            case 'history':
                this.showHistory();
                break;
            case 'help':
                this.showHelp();
                break;
        }
    }

    /**
     * Open Google Lens
     */
    openGoogleLens() {
        this.showLoading('Opening Google Lens...');

        if (this.deviceInfo.isAndroid) {
            this.openGoogleLensAndroid();
        } else if (this.deviceInfo.isIOS) {
            this.openGoogleLensIOS();
        } else {
            this.openGoogleLensDesktop();
        }
        
        // Emergency fallback - shows after 3 seconds if nothing else worked
        setTimeout(() => {
            // Only show emergency fallback if no other dialog is open and app is still in loading state
            if (this.isLoading) {
                this.hideLoading();
                this.emergencyLensOpen();
            }
        }, 3000);
    }

    /**
     * Open Google Lens on Android
     */
    openGoogleLensAndroid() {
        this.hideLoading();
        
        // Method 1: Try to open Google Lens app directly using intent
        const openApp = () => {
            return new Promise((resolve) => {
                // Create an invisible iframe to trigger the intent
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                
                // Try different intent formats
                const intents = [
                    'intent://lens/#Intent;package=com.google.android.apps.lens;scheme=google;end;',
                    'intent://scan/#Intent;package=com.google.android.apps.lens;scheme=google;end;',
                    'google://lens',
                    'https://lens.google.com/'
                ];
                
                let opened = false;
                
                const tryIntent = (index) => {
                    if (index >= intents.length) {
                        resolve(false);
                        return;
                    }
                    
                    // Set up a timeout to detect if app opened
                    const timeout = setTimeout(() => {
                        document.body.removeChild(iframe);
                        tryIntent(index + 1);
                    }, 500);
                    
                    iframe.onload = () => {
                        clearTimeout(timeout);
                        opened = true;
                        setTimeout(() => {
                            document.body.removeChild(iframe);
                            resolve(true);
                        }, 100);
                    };
                    
                    iframe.src = intents[index];
                    document.body.appendChild(iframe);
                };
                
                tryIntent(0);
            });
        };
        
        // Method 2: Fallback to web version
        const openWebVersion = () => {
            window.open('https://lens.google.com', '_blank');
            this.showToast('Opening Google Lens in browser...', 'info', 3000);
        };
        
        // Method 3: Show user manual instructions with buttons
        const showManualInstructions = () => {
            // Create a custom dialog
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            `;
            
            dialog.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 350px;
                    text-align: center;
                    animation: slideUp 0.3s ease;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h2 style="color: #333; margin-bottom: 15px;">Open Google Lens</h2>
                    <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                        Choose how you want to open Google Lens:
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button id="lensAppBtn" style="
                            background: #4285F4;
                            color: white;
                            border: none;
                            padding: 15px 20px;
                            border-radius: 12px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        ">
                            <span>📱</span> Open Lens App
                        </button>
                        
                        <button id="lensWebBtn" style="
                            background: #34A853;
                            color: white;
                            border: none;
                            padding: 15px 20px;
                            border-radius: 12px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        ">
                            <span>🌐</span> Open Web Version
                        </button>
                        
                        <button id="lensManualBtn" style="
                            background: #EA4335;
                            color: white;
                            border: none;
                            padding: 15px 20px;
                            border-radius: 12px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        ">
                            <span>📝</span> Show Instructions
                        </button>
                        
                        <button id="lensCloseBtn" style="
                            background: #f0f0f0;
                            color: #666;
                            border: none;
                            padding: 12px;
                            border-radius: 12px;
                            font-size: 14px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">
                            Cancel
                        </button>
                    </div>
                    
                    <div id="manualInstructions" style="
                        margin-top: 20px;
                        padding: 20px;
                        background: #f5f5f5;
                        border-radius: 12px;
                        text-align: left;
                        display: none;
                    ">
                        <h3 style="color: #333; margin-bottom: 10px;">Manual Steps:</h3>
                        <ol style="color: #666; margin-left: 20px; line-height: 1.8;">
                            <li>Open Google Lens app manually</li>
                            <li>Scan your table</li>
                            <li>Tap the "Select text" icon (T)</li>
                            <li>Select all text and copy</li>
                            <li>Come back here and paste</li>
                        </ol>
                    </div>
                </div>
            `;
            
            document.body.appendChild(dialog);
            
            // Add event listeners
            document.getElementById('lensAppBtn').addEventListener('click', () => {
                document.body.removeChild(dialog);
                this.showLoading('Opening Google Lens...');
                
                // Try to open app
                openApp().then((opened) => {
                    this.hideLoading();
                    if (!opened) {
                        this.showToast('Could not open app. Try web version.', 'warning');
                    } else {
                        this.showToast('Google Lens opened! Copy text and paste back', 'success', 4000);
                    }
                });
            });
            
            document.getElementById('lensWebBtn').addEventListener('click', () => {
                document.body.removeChild(dialog);
                openWebVersion();
            });
            
            document.getElementById('lensManualBtn').addEventListener('click', () => {
                const instructions = document.getElementById('manualInstructions');
                instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
            });
            
            document.getElementById('lensCloseBtn').addEventListener('click', () => {
                document.body.removeChild(dialog);
            });
        };
        
        // Try to open app first, if fails show manual options
        openApp().then((opened) => {
            this.hideLoading();
            if (!opened) {
                showManualInstructions();
            } else {
                this.showToast('Google Lens opened! Copy text and paste back', 'success', 4000);
            }
        });
    }

    /**
     * Open Google Lens on iOS
     */
    openGoogleLensIOS() {
        this.hideLoading();
        
        // iOS doesn't support direct app intents, so we'll show options
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
        `;
        
        dialog.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 350px;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
                <h2 style="color: #333; margin-bottom: 15px;">Google Lens on iOS</h2>
                <p style="color: #666; margin-bottom: 25px;">
                    Google Lens is built into the iOS Camera app. Here's how to use it:
                </p>
                
                <div style="text-align: left; margin-bottom: 25px;">
                    <div style="margin: 15px 0; padding: 10px; background: #f0f7ff; border-radius: 10px;">
                        <strong style="color: #4285F4; display: block; margin-bottom: 5px;">📸 Step 1:</strong>
                        <p style="color: #666;">Open Camera app → Point at table</p>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #f0f7ff; border-radius: 10px;">
                        <strong style="color: #34A853; display: block; margin-bottom: 5px;">🔍 Step 2:</strong>
                        <p style="color: #666;">Tap the "Scan Text" icon (📄) that appears</p>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #f0f7ff; border-radius: 10px;">
                        <strong style="color: #FBBC05; display: block; margin-bottom: 5px;">📋 Step 3:</strong>
                        <p style="color: #666;">Select all text → Tap "Copy"</p>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #f0f7ff; border-radius: 10px;">
                        <strong style="color: #EA4335; display: block; margin-bottom: 5px;">⬇️ Step 4:</strong>
                        <p style="color: #666;">Come back here and paste</p>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="lensOpenCamera" style="
                        background: #4285F4;
                        color: white;
                        border: none;
                        padding: 15px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        📷 Open Camera
                    </button>
                    
                    <button id="lensCloseBtn" style="
                        background: #f0f0f0;
                        color: #666;
                        border: none;
                        padding: 12px;
                        border-radius: 12px;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        document.getElementById('lensOpenCamera').addEventListener('click', () => {
            // Open camera (this will just open the default camera app)
            window.location.href = 'camera://';
            setTimeout(() => {
                // If camera app doesn't open, show message
                this.showToast('Open your camera app manually', 'info', 3000);
            }, 500);
        });
        
        document.getElementById('lensCloseBtn').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }

    /**
     * Open Google Lens on Desktop
     */
    openGoogleLensDesktop() {
        window.open('https://lens.google.com', '_blank');
        this.hideLoading();
        this.showToast('📸 Google Lens opened in new tab', 'success', 3000);
        
        // Show instructions after a delay
        setTimeout(() => {
            this.showToast('Scan → Copy text → Paste back here', 'info', 5000);
        }, 1000);
    }

    /**
     * Emergency fallback - direct links to Google Lens
     */
    emergencyLensOpen() {
        const emergencyDialog = document.createElement('div');
        emergencyDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            padding: 20px;
        `;
        
        emergencyDialog.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 350px;
                text-align: center;
            ">
                <h2 style="color: #333; margin-bottom: 20px;">🔍 Google Lens Links</h2>
                
                <p style="color: #666; margin-bottom: 20px;">
                    Tap any link below to open Google Lens:
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <a href="https://lens.google.com" target="_blank" style="
                        background: #4285F4;
                        color: white;
                        text-decoration: none;
                        padding: 15px;
                        border-radius: 12px;
                        font-weight: 600;
                    ">
                        🌐 Open in Browser
                    </a>
                    
                    <a href="google://lens" style="
                        background: #34A853;
                        color: white;
                        text-decoration: none;
                        padding: 15px;
                        border-radius: 12px;
                        font-weight: 600;
                    ">
                        📱 Open in App (Android)
                    </a>
                    
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                        background: #f0f0f0;
                        color: #666;
                        border: none;
                        padding: 12px;
                        border-radius: 12px;
                        margin-top: 10px;
                        cursor: pointer;
                    ">
                        Close
                    </button>
                </div>
                
                <p style="color: #999; margin-top: 20px; font-size: 12px;">
                    After scanning, copy the text and paste back here
                </p>
            </div>
        `;
        
        document.body.appendChild(emergencyDialog);
    }

    /**
     * Open paste modal
     */
    openPasteModal() {
        this.pasteModal.classList.remove('hidden');
        this.pasteArea.value = '';
        this.previewSection.classList.add('hidden');
        
        setTimeout(() => {
            this.pasteArea.focus();
        }, 300);

        this.readFromClipboard();
    }

    /**
     * Read from clipboard if available
     */
    async readFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim()) {
                this.pasteArea.value = text;
                this.showPreview();
                this.showToast('📋 Clipboard content loaded!', 'success');
            }
        } catch (err) {
            console.log('Clipboard read failed:', err);
        }
    }

    /**
     * Close paste modal
     */
    closePasteModal() {
        this.pasteModal.classList.add('hidden');
        this.pasteArea.value = '';
        this.previewSection.classList.add('hidden');
    }

    /**
     * Set data format
     */
    setFormat(btn) {
        this.formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFormat = btn.dataset.format;
        this.showPreview();
    }

    /**
     * Show preview of parsed data
     */
    showPreview() {
        const text = this.pasteArea.value.trim();
        
        if (text) {
            const parsed = this.parseText(text, true);
            if (parsed) {
                this.previewContent.textContent = parsed;
                this.previewSection.classList.remove('hidden');
            } else {
                this.previewSection.classList.add('hidden');
            }
        } else {
            this.previewSection.classList.add('hidden');
        }
    }

    /**
     * Load sample data for testing
     */
    loadSampleData(type) {
        let sample = '';
        
        switch(type) {
            case 'numbers':
                sample = '123 456 789\n234 567 890\n345 678 901\n456 789 012';
                break;
            case 'products':
                sample = 'Product\tPrice\tQuantity\nApple\t2.50\t10\nBanana\t1.20\t15\nOrange\t3.00\t8';
                break;
            case 'grades':
                sample = 'Student\tMath\tScience\tEnglish\nJohn\t85\t92\t78\nJane\t95\t88\t91\nBob\t76\t84\t89';
                break;
        }
        
        this.pasteArea.value = sample;
        this.showPreview();
        this.showToast(`Sample data loaded: ${type}`, 'success');
    }

    /**
     * Parse pasted text and format as Column 1, Column 2, etc.
     */
    parseText(text, previewOnly = false) {
        if (!text) return null;

        // Detect delimiter
        let delimiter = this.detectDelimiter(text);
        
        // Override if specific format selected
        if (this.currentFormat === 'tabs') delimiter = '\t';
        if (this.currentFormat === 'spaces') delimiter = /\s+/;
        if (this.currentFormat === 'commas') delimiter = ',';

        // Split into lines
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) return null;

        // Parse each line into cells
        const parsedData = [];
        lines.forEach(line => {
            let cells;
            if (delimiter instanceof RegExp) {
                cells = line.split(delimiter).filter(cell => cell.trim() !== '');
            } else {
                cells = line.split(delimiter).map(cell => cell.trim());
            }
            parsedData.push(cells);
        });

        // Auto-detect table structure
        const tableStructure = this.detectTableStructure(parsedData);
        
        if (previewOnly) {
            return this.formatPreview(tableStructure);
        }

        return tableStructure;
    }

    /**
     * Detect table structure from parsed data
     * This is the key function that formats data as Column 1, Column 2, etc.
     */
    detectTableStructure(parsedData) {
        if (!parsedData || parsedData.length === 0) return [];

        // Find maximum number of columns in any row
        let maxCols = 0;
        parsedData.forEach(row => {
            maxCols = Math.max(maxCols, row.length);
        });

        // Limit to reasonable size (max 26 columns for A-Z)
        maxCols = Math.min(maxCols, 26);

        // If we have headers (first row might be text), detect them
        const hasHeaders = this.detectHeaders(parsedData[0]);
        
        // Create column names: "Column 1", "Column 2", etc. or use detected headers
        const columnNames = [];
        for (let i = 0; i < maxCols; i++) {
            if (hasHeaders && parsedData[0] && parsedData[0][i]) {
                // Use first row as headers if they look like headers
                columnNames.push(parsedData[0][i]);
            } else {
                columnNames.push(`Column ${i + 1}`);
            }
        }

        // Build table data with proper column structure
        const tableData = [];
        const startRow = hasHeaders ? 1 : 0;

        for (let i = startRow; i < parsedData.length; i++) {
            const row = parsedData[i];
            const tableRow = {};
            
            for (let j = 0; j < maxCols; j++) {
                const colName = columnNames[j];
                tableRow[colName] = row[j] || '';
            }
            
            tableData.push(tableRow);
        }

        return tableData;
    }

    /**
     * Detect if first row contains headers
     */
    detectHeaders(firstRow) {
        if (!firstRow || firstRow.length === 0) return false;
        
        // Check if any cell contains text that looks like a header
        const headerPatterns = ['name', 'id', 'date', 'total', 'price', 'quantity', 'product', 'student', 'grade', 'score', 'column'];
        
        for (const cell of firstRow) {
            const lowerCell = cell.toLowerCase();
            for (const pattern of headerPatterns) {
                if (lowerCell.includes(pattern)) {
                    return true;
                }
            }
        }
        
        // If first row has mixed text and numbers, it's probably headers
        const hasText = firstRow.some(cell => isNaN(cell));
        const hasNumbers = firstRow.some(cell => !isNaN(cell) && cell !== '');
        
        return hasText && hasNumbers;
    }

    /**
     * Format preview with column names
     */
    formatPreview(tableData) {
        if (!tableData || tableData.length === 0) return '';
        
        const columns = Object.keys(tableData[0]);
        const headerRow = columns.join(' | ');
        const dataRows = tableData.map(row => 
            columns.map(col => row[col] || '').join(' | ')
        );
        
        return [headerRow, ...dataRows].join('\n');
    }

    /**
     * Detect delimiter in text
     */
    detectDelimiter(text) {
        const firstLine = text.split('\n')[0];
        
        if (firstLine.includes('\t')) return '\t';
        if (firstLine.includes(',')) return ',';
        if (firstLine.includes(';')) return ';';
        if (/\s{2,}/.test(firstLine)) return /\s+/;
        
        return /\s+/;
    }

    /**
     * Handle paste confirmation
     */
    handlePaste() {
        const text = this.pasteArea.value.trim();
        
        if (!text) {
            this.showToast('Please paste some data first', 'error');
            return;
        }

        this.showLoading('Processing pasted data...');

        setTimeout(() => {
            const tableData = this.parseText(text);
            
            if (!tableData || tableData.length === 0) {
                this.hideLoading();
                this.showToast('Could not parse the data. Try different format.', 'error');
                return;
            }

            this.tableData = tableData;
            
            this.closePasteModal();
            this.renderTable();
            this.tableSection.classList.remove('hidden');
            this.updateStats();
            this.saveToHistory('paste', this.tableData);
            
            this.hideLoading();
            this.showToast('✅ Table created successfully with automatic formatting!', 'success');
        }, 500);
    }

    /**
     * Render table in UI with Column 1, Column 2 headers
     */
    renderTable() {
        if (!this.tableData || this.tableData.length === 0) {
            this.tableView.innerHTML = '<div class="empty-state">📭 No table data. Paste something first!</div>';
            return;
        }

        const columns = this.getColumns();
        
        let html = '<table class="data-table">';
        
        // Header with Column 1, Column 2, etc.
        html += '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead>';

        // Body
        html += '<tbody>';
        this.tableData.forEach((row, rowIndex) => {
            html += '<tr>';
            columns.forEach(col => {
                const value = row[col] || '';
                html += `<td class="editable" data-row="${rowIndex}" data-col="${col}" contenteditable="true">${this.escapeHtml(value)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        this.tableView.innerHTML = html;
        this.attachCellEvents();

        this.tableRows.value = this.tableData.length;
        this.tableCols.value = columns.length;
    }

    /**
     * Attach events to table cells
     */
    attachCellEvents() {
        const cells = document.querySelectorAll('.data-table td.editable');
        
        cells.forEach(cell => {
            cell.addEventListener('blur', (e) => {
                const row = parseInt(e.target.dataset.row);
                const col = e.target.dataset.col;
                const value = e.target.textContent.trim();
                
                if (this.tableData[row]) {
                    this.tableData[row][col] = value;
                    this.saveToStorage();
                    this.updateStats();
                }
            });

            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cell.blur();
                    
                    const nextCell = this.getNextCell(cell);
                    if (nextCell) {
                        nextCell.focus();
                    }
                }
            });

            cell.addEventListener('keydown', (e) => {
                if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    const direction = e.key.replace('Arrow', '').toLowerCase();
                    const nextCell = this.getAdjacentCell(cell, direction);
                    if (nextCell) {
                        nextCell.focus();
                    }
                }
            });
        });
    }

    /**
     * Get next cell in table
     */
    getNextCell(currentCell) {
        const cells = Array.from(document.querySelectorAll('.data-table td.editable'));
        const index = cells.indexOf(currentCell);
        return cells[index + 1] || cells[0];
    }

    /**
     * Get adjacent cell
     */
    getAdjacentCell(cell, direction) {
        const row = parseInt(cell.dataset.row);
        const col = cell.dataset.col;
        const columns = this.getColumns();
        const colIndex = columns.indexOf(col);
        
        let targetRow = row;
        let targetCol = colIndex;
        
        switch(direction) {
            case 'up':
                targetRow = Math.max(0, row - 1);
                break;
            case 'down':
                targetRow = Math.min(this.tableData.length - 1, row + 1);
                break;
            case 'left':
                targetCol = Math.max(0, colIndex - 1);
                break;
            case 'right':
                targetCol = Math.min(columns.length - 1, colIndex + 1);
                break;
        }
        
        if (targetRow === row && targetCol === colIndex) return null;
        
        const targetColName = columns[targetCol];
        return document.querySelector(`td[data-row="${targetRow}"][data-col="${targetColName}"]`);
    }

    /**
     * Get column headers (always returns "Column 1", "Column 2", etc. in order)
     */
    getColumns() {
        if (!this.tableData || this.tableData.length === 0) {
            return ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'];
        }
        
        // Get all column names and sort them naturally (Column 1, Column 2, etc.)
        const columns = Object.keys(this.tableData[0]);
        
        // Sort columns to ensure "Column 1" comes before "Column 2"
        return columns.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/) || 0);
            const numB = parseInt(b.match(/\d+/) || 0);
            return numA - numB;
        });
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Resize table
     */
    resizeTable() {
        const newRows = parseInt(this.tableRows.value);
        const newCols = parseInt(this.tableCols.value);
        
        if (isNaN(newRows) || isNaN(newCols) || newRows < 1 || newCols < 1 || newCols > 26) {
            this.showToast('Invalid dimensions', 'error');
            return;
        }

        this.showLoading('Resizing table...');

        setTimeout(() => {
            const currentCols = this.getColumns();
            
            // Create new column names (Column 1, Column 2, etc.)
            const newColumns = [];
            for (let i = 0; i < newCols; i++) {
                newColumns.push(`Column ${i + 1}`);
            }

            // Adjust rows
            const newTableData = [];
            for (let i = 0; i < newRows; i++) {
                const row = {};
                newColumns.forEach((col, index) => {
                    // Try to preserve existing data if available
                    if (i < this.tableData.length) {
                        const oldCol = currentCols[index];
                        if (oldCol && this.tableData[i][oldCol] !== undefined) {
                            row[col] = this.tableData[i][oldCol];
                        } else {
                            row[col] = '';
                        }
                    } else {
                        row[col] = '';
                    }
                });
                newTableData.push(row);
            }

            this.tableData = newTableData;
            this.renderTable();
            this.updateStats();
            this.saveToStorage();
            
            this.hideLoading();
            this.showToast(`Table resized to ${newRows}x${newCols}`, 'success');
        }, 300);
    }

    /**
     * Toggle edit mode
     */
    toggleEditMode() {
        this.showToast('Edit mode toggled', 'info');
    }

    /**
     * Refresh table
     */
    refreshTable() {
        this.renderTable();
        this.updateStats();
        this.showToast('Table refreshed', 'success');
    }

    /**
     * Clear table
     */
    clearTable() {
        if (this.tableData.length === 0) {
            return;
        }

        if (confirm('Clear all table data?')) {
            this.tableData = [];
            this.processedData = [];
            this.tableView.innerHTML = '<div class="empty-state">📭 Table cleared</div>';
            this.resultsGrid.innerHTML = '';
            this.resultsSection.classList.add('hidden');
            this.statsCard.classList.add('hidden');
            this.updateStats();
            this.saveToStorage();
            this.showToast('Table cleared', 'success');
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        if (this.tableData.length === 0) {
            this.statsCard.classList.add('hidden');
            return;
        }

        const columns = this.getColumns();
        const total = this.tableData.length * columns.length;
        
        let filled = 0;
        this.tableData.forEach(row => {
            columns.forEach(col => {
                if (row[col] && row[col].trim() !== '') {
                    filled++;
                }
            });
        });

        this.tableSize.textContent = `${this.tableData.length}x${columns.length}`;
        this.totalCells.textContent = total;
        this.filledCells.textContent = filled;

        this.statsCard.classList.remove('hidden');
    }

    /**
     * Process table data to extract cell values
     */
    processTableData() {
        if (!this.tableData || this.tableData.length === 0) {
            this.showToast('No table data to process', 'error');
            return;
        }

        this.showLoading('Extracting values...');

        setTimeout(() => {
            this.processedData = [];
            const columns = this.getColumns();

            this.tableData.forEach((row, rowIndex) => {
                columns.forEach((col, colIndex) => {
                    const value = row[col];
                    if (value && value.trim() !== '') {
                        const rowNumber = rowIndex + 1;
                        this.processedData.push({
                            coordinate: `${col} Row ${rowNumber}`,
                            value: value.trim()
                        });
                    }
                });
            });

            this.renderResults();
            this.resultsSection.classList.remove('hidden');
            
            this.hideLoading();
            this.showToast(`✅ Found ${this.processedData.length} values`, 'success');
        }, 500);
    }

    /**
     * Render results grid
     */
    renderResults() {
        if (!this.processedData || this.processedData.length === 0) {
            this.resultsGrid.innerHTML = '<div class="empty-state">No values found</div>';
            this.resultsCount.textContent = '0 values found';
            return;
        }

        let html = '';
        this.processedData.forEach(item => {
            html += `
                <div class="result-card">
                    <div class="result-coord">${item.coordinate}</div>
                    <div class="result-value">${this.escapeHtml(item.value)}</div>
                </div>
            `;
        });

        this.resultsGrid.innerHTML = html;
        this.resultsCount.textContent = `${this.processedData.length} values found`;
    }

    /**
     * Export to Excel (CSV)
     */
    exportToExcel() {
        if (!this.tableData || this.tableData.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        const columns = this.getColumns();
        
        let csv = columns.join(',') + '\n';
        
        this.tableData.forEach(row => {
            const rowData = columns.map(col => {
                const value = row[col] || '';
                return `"${value.replace(/"/g, '""')}"`;
            });
            csv += rowData.join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table_export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showToast('📥 File downloaded', 'success');
    }

    /**
     * Copy results to clipboard
     */
    async copyResults() {
        if (!this.processedData || this.processedData.length === 0) {
            this.showToast('No results to copy', 'error');
            return;
        }

        const text = this.processedData
            .map(item => `${item.coordinate}: ${item.value}`)
            .join('\n');

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('📋 Results copied!', 'success');
        } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('📋 Results copied!', 'success');
        }
    }

    /**
     * Download results as text file
     */
    downloadResults() {
        if (!this.processedData || this.processedData.length === 0) {
            this.showToast('No results to download', 'error');
            return;
        }

        const text = this.processedData
            .map(item => `${item.coordinate}: ${item.value}`)
            .join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('📥 Results downloaded', 'success');
    }

    /**
     * Show history
     */
    showHistory() {
        this.historySection.classList.remove('hidden');
        this.renderHistory();
    }

    /**
     * Render history list
     */
    renderHistory() {
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<div class="empty-state">No history yet</div>';
            return;
        }

        let html = '';
        history.reverse().forEach((item, index) => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-time">${formattedDate}</span>
                        <div class="history-details">
                            <span class="history-size">${item.rows || 0}x${item.cols || 0}</span>
                            <span class="history-cells">${item.cells || 0} cells</span>
                        </div>
                    </div>
                    <button class="history-load" data-index="${history.length - 1 - index}">Load</button>
                </div>
            `;
        });

        this.historyList.innerHTML = html;

        document.querySelectorAll('.history-load').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.loadHistoryItem(index);
            });
        });
    }

    /**
     * Load history item
     */
    loadHistoryItem(index) {
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        const item = history[index];
        
        if (item && item.data) {
            this.tableData = item.data;
            this.renderTable();
            this.tableSection.classList.remove('hidden');
            this.updateStats();
            this.switchView('table');
            this.showToast('History loaded', 'success');
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        if (confirm('Clear all history?')) {
            localStorage.removeItem('scanHistory');
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    }

    /**
     * Save to history
     */
    saveToHistory(type, data) {
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        
        const columns = this.getColumns();
        let cells = 0;
        data.forEach(row => {
            columns.forEach(col => {
                if (row[col] && row[col].trim() !== '') {
                    cells++;
                }
            });
        });

        history.push({
            type: type,
            data: data,
            rows: data.length,
            cols: columns.length,
            cells: cells,
            timestamp: new Date().toISOString()
        });

        if (history.length > 20) {
            history.shift();
        }

        localStorage.setItem('scanHistory', JSON.stringify(history));
    }

    /**
     * Save to local storage
     */
    saveToStorage() {
        localStorage.setItem('tableData', JSON.stringify(this.tableData));
    }

    /**
     * Load from local storage
     */
    loadFromStorage() {
        const saved = localStorage.getItem('tableData');
        if (saved) {
            this.tableData = JSON.parse(saved);
            if (this.tableData && this.tableData.length > 0) {
                this.renderTable();
                this.updateStats();
            }
        }

        this.scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    }

    /**
     * Show help
     */
    showHelp() {
        const helpHTML = `
            <div class="help-content">
                <h3>📖 How to Use</h3>
                
                <h4>Step 1: Scan with Google Lens</h4>
                <p>Tap the "Scan with Google Lens" button. This will open Google Lens on your device.</p>
                
                <h4>Step 2: Capture Table</h4>
                <p>Point your camera at the handwritten table. Make sure it's well-lit and clearly visible.</p>
                
                <h4>Step 3: Select Text</h4>
                <p>In Google Lens, tap the "Select text" icon (T) and select all the text in the table.</p>
                
                <h4>Step 4: Copy</h4>
                <p>Copy the selected text to your clipboard.</p>
                
                <h4>Step 5: Paste Here</h4>
                <p>Come back to this app and tap "Paste Results". Paste your copied text.</p>
                
                <h4>Step 6: Auto-Formatting</h4>
                <p>The app will automatically detect your table structure and format it as:</p>
                <pre>
Column 1  Column 2  Column 3
1         8         13
2         9         14
3         10        15
4         11        16
5         12        17
6         13        18
7         14        19
                </pre>
                
                <h4>Tips:</h4>
                <ul>
                    <li>Write numbers clearly and separately</li>
                    <li>Use grid paper for better results</li>
                    <li>Ensure good lighting</li>
                    <li>Hold camera steady</li>
                </ul>
            </div>
        `;

        this.pasteArea.value = helpHTML;
        this.openPasteModal();
    }

    /**
     * Toggle menu
     */
    toggleMenu() {
        this.showToast('Menu', 'info');
    }

    /**
     * Handle back button
     */
    handleBack() {
        if (!this.pasteModal.classList.contains('hidden')) {
            this.closePasteModal();
            return true;
        }
        return false;
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Processing...') {
        this.isLoading = true;
        this.loadingText.textContent = message;
        this.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.isLoading = false;
        this.loadingOverlay.classList.add('hidden');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        this.toastIcon.textContent = icons[type] || 'ℹ️';
        this.toastMessage.textContent = message;
        
        this.toast.classList.remove('toast-success', 'toast-error', 'toast-warning', 'toast-info');
        this.toast.classList.add(`toast-${type}`);
        
        this.toast.classList.remove('hidden');

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.add('hidden');
        }, duration);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GoogleLensTableScanner();
});