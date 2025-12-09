// ============================================
// PHOTOPACKAGER - MAIN JAVASCRIPT
// Modern drag-and-drop file upload with glassmorphism UI
// ============================================

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        selectedFiles: new Map(), // Map<fileId, File>
        isProcessing: false,
        currentJobId: null,
        pollingInterval: null
    };

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
        ALLOWED_TYPES: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/heic',
            'image/heif', 'image/webp', 'image/tiff', 'image/x-canon-cr2',
            'image/x-canon-cr3', 'image/x-nikon-nef', 'image/x-sony-arw',
            'image/x-adobe-dng', 'image/x-fuji-raf', 'image/x-olympus-orf',
            'image/x-panasonic-rw2', 'image/x-pentax-pef', 'image/x-samsung-srw'
        ],
        ALLOWED_EXTENSIONS: [
            '.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp',
            '.tiff', '.tif', '.cr2', '.cr3', '.nef', '.arw',
            '.dng', '.raf', '.orf', '.rw2', '.pef', '.srw'
        ],
        POLL_INTERVAL: 1000, // Poll every 1 second
        API_BASE: '/api'
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        // Drop zone
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        browseBtn: document.getElementById('browse-btn'),

        // File preview
        filePreviewContainer: document.getElementById('file-preview-container'),
        filePreviewList: document.getElementById('file-preview-list'),
        fileCount: document.getElementById('file-count'),
        clearFilesBtn: document.getElementById('clear-files-btn'),

        // Options
        optionsSection: document.getElementById('options-section'),

        // Buttons
        startBtn: document.getElementById('start-btn'),
        cancelBtn: document.getElementById('cancel-btn'),

        // Progress
        progressSection: document.getElementById('progress-section'),
        progressPercent: document.getElementById('progress-percent'),
        progressBarFill: document.getElementById('progress-bar-fill'),
        progressStatus: document.getElementById('progress-status'),
        progressFiles: document.getElementById('progress-files'),

        // Results
        resultsSection: document.getElementById('results-section'),
        resultsSummary: document.getElementById('results-summary'),
        downloadAllBtn: document.getElementById('download-all-btn'),
        processMoreBtn: document.getElementById('process-more-btn'),

        // Status & Logs
        statusBadge: document.getElementById('status-badge'),
        logContainer: document.getElementById('log-container'),

        // Modal
        errorModal: document.getElementById('error-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalCloseBtn: document.getElementById('modal-close-btn'),

        // Settings buttons
        settingsBtn: document.getElementById('settings-btn'),
        helpBtn: document.getElementById('help-btn'),

        // Settings modal
        settingsModal: document.getElementById('settings-modal'),
        settingQualityOptimized: document.getElementById('setting-quality-optimized'),
        settingQualityOptimizedValue: document.getElementById('setting-quality-optimized-value'),
        settingQualityCompressed: document.getElementById('setting-quality-compressed'),
        settingQualityCompressedValue: document.getElementById('setting-quality-compressed-value'),
        settingDefaultOptimizedJpg: document.getElementById('setting-default-optimized-jpg'),
        settingDefaultOptimizedWebp: document.getElementById('setting-default-optimized-webp'),
        settingDefaultCompressedJpg: document.getElementById('setting-default-compressed-jpg'),
        settingDefaultCompressedWebp: document.getElementById('setting-default-compressed-webp'),
        settingDefaultCreateZip: document.getElementById('setting-default-create-zip'),
        settingDefaultExif: document.getElementById('setting-default-exif'),
        settingRememberLastSettings: document.getElementById('setting-remember-last-settings'),
        settingsResetBtn: document.getElementById('settings-reset-btn'),
        settingsCancelBtn: document.getElementById('settings-cancel-btn'),
        settingsSaveBtn: document.getElementById('settings-save-btn')
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        setupEventListeners();
        loadSettings();
        updateStatusBadge('Ready');
        addLog('Ready to process photos', 'info');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Prevent default drag behaviors globally
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Drop zone events
        elements.dropZone.addEventListener('dragenter', handleDragEnter, false);
        elements.dropZone.addEventListener('dragover', handleDragOver, false);
        elements.dropZone.addEventListener('dragleave', handleDragLeave, false);
        elements.dropZone.addEventListener('drop', handleDrop, false);

        // Click to browse
        elements.browseBtn.addEventListener('click', () => elements.fileInput.click());
        elements.dropZone.addEventListener('click', (e) => {
            if (e.target === elements.dropZone || e.target.closest('.drop-zone-content')) {
                elements.fileInput.click();
            }
        });

        // File input change
        elements.fileInput.addEventListener('change', (e) => {
            handleFiles(Array.from(e.target.files));
            e.target.value = ''; // Reset input
        });

        // Clear files
        elements.clearFilesBtn.addEventListener('click', clearAllFiles);

        // Action buttons
        elements.startBtn.addEventListener('click', startProcessing);
        elements.cancelBtn.addEventListener('click', cancelProcessing);

        // Results buttons
        elements.processMoreBtn.addEventListener('click', resetToUploadState);

        // Modal
        elements.modalCloseBtn.addEventListener('click', hideModal);
        elements.errorModal.addEventListener('click', (e) => {
            if (e.target === elements.errorModal) hideModal();
        });

        // Settings & Help
        elements.settingsBtn.addEventListener('click', openSettingsModal);

        elements.helpBtn.addEventListener('click', () => {
            showModal('Help',
                'PhotoPackager helps you process photos in multiple formats and quality levels.\\n\\n' +
                '1. Upload images by dragging them or clicking "browse files"\\n' +
                '2. Choose your quality settings and options\\n' +
                '3. Click "Start Processing"\\n' +
                '4. Download your processed files when complete'
            );
        });

        // Settings modal events
        elements.settingsCancelBtn.addEventListener('click', closeSettingsModal);
        elements.settingsSaveBtn.addEventListener('click', saveSettings);
        elements.settingsResetBtn.addEventListener('click', resetSettings);
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) closeSettingsModal();
        });

        // Range slider updates
        elements.settingQualityOptimized.addEventListener('input', (e) => {
            elements.settingQualityOptimizedValue.textContent = e.target.value;
        });
        elements.settingQualityCompressed.addEventListener('input', (e) => {
            elements.settingQualityCompressedValue.textContent = e.target.value;
        });
    }

    // ============================================
    // DRAG & DROP HANDLERS
    // ============================================
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDragEnter(e) {
        const hasFiles = Array.from(e.dataTransfer.items).some(
            item => item.kind === 'file'
        );
        if (hasFiles) {
            elements.dropZone.classList.add('drag-over');
        }
    }

    function handleDragOver(e) {
        const imageFiles = Array.from(e.dataTransfer.items).filter(
            item => item.kind === 'file' && (item.type.startsWith('image/') || item.type === '')
        );
        if (imageFiles.length > 0) {
            e.dataTransfer.dropEffect = 'copy';
            elements.dropZone.classList.add('drag-over');
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    }

    function handleDragLeave(e) {
        if (e.target === elements.dropZone) {
            elements.dropZone.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        elements.dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }

    // ============================================
    // FILE HANDLING
    // ============================================
    function handleFiles(files) {
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            const validation = validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push({ file: file.name, error: validation.error });
            }
        });

        // Show errors if any
        if (errors.length > 0) {
            const errorMsg = errors.map(e => `${e.file}: ${e.error}`).join('\\n');
            showModal('File Validation Errors', errorMsg);
            addLog(`${errors.length} files failed validation`, 'error');
        }

        // Add valid files
        if (validFiles.length > 0) {
            validFiles.forEach(file => {
                const fileId = generateFileId(file);
                if (!state.selectedFiles.has(fileId)) {
                    state.selectedFiles.set(fileId, file);
                    addFilePreview(fileId, file);
                }
            });

            updateFileCount();
            showPreviewContainer();
            showOptionsSection();
            updateStartButton();
            addLog(`Added ${validFiles.length} file(s)`, 'success');
        }
    }

    function validateFile(file) {
        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}`
            };
        }

        // Check file type by MIME type first
        if (file.type && CONFIG.ALLOWED_TYPES.includes(file.type)) {
            return { valid: true };
        }

        // Fallback: check by extension for RAW files
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
            return { valid: true };
        }

        return {
            valid: false,
            error: 'Invalid file type. Only image files are supported.'
        };
    }

    function generateFileId(file) {
        return `${file.name}-${file.size}-${file.lastModified}`;
    }

    // ============================================
    // FILE PREVIEW UI
    // ============================================
    function addFilePreview(fileId, file) {
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        previewItem.dataset.fileId = fileId;

        // Thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'file-thumbnail';

        if (file.type.startsWith('image/') && !file.type.includes('raw')) {
            const img = document.createElement('img');
            img.className = 'file-thumbnail-img';
            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
            img.onload = () => URL.revokeObjectURL(objectUrl);
            thumbnail.appendChild(img);
        } else {
            thumbnail.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                </svg>
            `;
        }

        // File info
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <div class="file-name" title="${file.name}">${truncateFileName(file.name, 40)}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
        `;

        // Status
        const status = document.createElement('div');
        status.className = 'file-status';
        status.innerHTML = `<span class="status-badge status-pending">Pending</span>`;

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'file-remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Remove file';
        removeBtn.addEventListener('click', () => removeFile(fileId));

        // Assemble
        previewItem.appendChild(thumbnail);
        previewItem.appendChild(fileInfo);
        previewItem.appendChild(status);
        previewItem.appendChild(removeBtn);

        elements.filePreviewList.appendChild(previewItem);
    }

    function removeFile(fileId) {
        state.selectedFiles.delete(fileId);

        const previewItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (previewItem) {
            previewItem.remove();
        }

        updateFileCount();
        updateStartButton();

        if (state.selectedFiles.size === 0) {
            hidePreviewContainer();
            hideOptionsSection();
        }

        addLog('File removed', 'info');
    }

    function clearAllFiles() {
        state.selectedFiles.clear();
        elements.filePreviewList.innerHTML = '';
        updateFileCount();
        hidePreviewContainer();
        hideOptionsSection();
        updateStartButton();
        addLog('All files cleared', 'info');
    }

    function updateFileCount() {
        elements.fileCount.textContent = state.selectedFiles.size;
    }

    function showPreviewContainer() {
        elements.filePreviewContainer.style.display = 'block';
    }

    function hidePreviewContainer() {
        elements.filePreviewContainer.style.display = 'none';
    }

    function showOptionsSection() {
        elements.optionsSection.style.display = 'block';
    }

    function hideOptionsSection() {
        elements.optionsSection.style.display = 'none';
    }

    function updateStartButton() {
        elements.startBtn.disabled = state.selectedFiles.size === 0 || state.isProcessing;
    }

    // ============================================
    // PROCESSING
    // ============================================
    async function startProcessing() {
        if (state.isProcessing || state.selectedFiles.size === 0) return;

        state.isProcessing = true;
        updateStartButton();
        updateStatusBadge('Processing');

        // Hide options, show progress
        elements.optionsSection.style.display = 'none';
        elements.progressSection.style.display = 'block';
        elements.startBtn.style.display = 'none';
        elements.cancelBtn.style.display = 'inline-flex';

        addLog(`Starting processing of ${state.selectedFiles.size} files...`, 'info');

        try {
            // Prepare form data
            const formData = new FormData();

            // Add all files
            for (const [fileId, file] of state.selectedFiles) {
                formData.append('files', file);
            }

            // Collect settings
            const settings = collectSettings();
            formData.append('settings', JSON.stringify(settings));

            // Update progress
            updateProgress(0, 'Uploading files...', 0, state.selectedFiles.size);

            // Make API request
            const response = await fetch(`${CONFIG.API_BASE}/jobs`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            state.currentJobId = result.job_id;

            addLog(`Job started: ${state.currentJobId}`, 'success');

            // Start polling for status
            startPolling();

        } catch (error) {
            console.error('Processing error:', error);
            addLog(`Error: ${error.message}`, 'error');
            showModal('Processing Failed', error.message);
            resetProcessingState();
        }
    }

    function collectSettings() {
        // Get saved quality settings
        const savedSettings = localStorage.getItem('photopackager_settings');
        const userSettings = savedSettings ? JSON.parse(savedSettings) : getDefaultSettings();

        return {
            shoot_name: document.getElementById('shoot-name').value || 'PhotoPackager_Export',
            base_name: document.getElementById('shoot-name').value || 'photo',
            generate_optimized_jpg: document.querySelector('[name="generate_optimized_jpg"]').checked,
            generate_optimized_webp: document.querySelector('[name="generate_optimized_webp"]').checked,
            generate_compressed_jpg: document.querySelector('[name="generate_compressed_jpg"]').checked,
            generate_compressed_webp: document.querySelector('[name="generate_compressed_webp"]').checked,
            include_raw_files: document.querySelector('[name="include_raw_files"]').checked,
            create_zip_packages: document.querySelector('[name="create_zip_packages"]').checked,
            exif_option: document.querySelector('[name="exif_option"]').value,
            quality_optimized: userSettings.qualityOptimized,
            quality_compressed: userSettings.qualityCompressed
        };
    }

    function startPolling() {
        if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
        }

        state.pollingInterval = setInterval(async () => {
            if (!state.currentJobId) {
                stopPolling();
                return;
            }

            try {
                const response = await fetch(`${CONFIG.API_BASE}/jobs/${state.currentJobId}/status`);
                if (!response.ok) throw new Error('Failed to fetch job status');

                const data = await response.json();
                handleJobStatus(data);

            } catch (error) {
                console.error('Polling error:', error);
                addLog(`Polling error: ${error.message}`, 'error');
            }
        }, CONFIG.POLL_INTERVAL);
    }

    function stopPolling() {
        if (state.pollingInterval) {
            clearInterval(state.pollingInterval);
            state.pollingInterval = null;
        }
    }

    function handleJobStatus(data) {
        const status = data.status.toLowerCase();

        switch (status) {
            case 'pending':
            case 'queued':
                updateProgress(5, 'Job queued...', 0, state.selectedFiles.size);
                break;

            case 'started':
            case 'processing':
                // Extract progress from result if available
                const progress = data.result?.progress || 10;
                const current = data.result?.current || 0;
                const total = data.result?.total || state.selectedFiles.size;
                updateProgress(progress, 'Processing images...', current, total);
                break;

            case 'success':
            case 'complete':
                stopPolling();
                handleJobComplete(data);
                break;

            case 'failure':
            case 'failed':
                stopPolling();
                handleJobFailure(data);
                break;

            default:
                console.log('Unknown status:', status);
        }
    }

    function handleJobComplete(data) {
        updateProgress(100, 'Complete!', state.selectedFiles.size, state.selectedFiles.size);

        setTimeout(() => {
            elements.progressSection.style.display = 'none';
            elements.resultsSection.style.display = 'block';

            // Update results summary
            const result = data.result || {};
            const processed = result.total_files_processed || state.selectedFiles.size;
            elements.resultsSummary.textContent = `${processed} files processed successfully`;

            // Setup download button with job ID
            const jobId = state.currentJobId;
            const zipFilename = result.zip_packages?.[0] || `${jobId}.zip`;

            // Remove old event listener and add new one
            const newDownloadBtn = elements.downloadAllBtn.cloneNode(true);
            elements.downloadAllBtn.parentNode.replaceChild(newDownloadBtn, elements.downloadAllBtn);
            elements.downloadAllBtn = newDownloadBtn;

            elements.downloadAllBtn.addEventListener('click', () => {
                downloadJobResults(jobId, zipFilename);
            });

            updateStatusBadge('Complete');
            addLog(`Processing complete: ${processed} files`, 'success');

            state.isProcessing = false;
            // Keep currentJobId for download
        }, 500);
    }

    function downloadJobResults(jobId, zipFilename) {
        const downloadUrl = `${CONFIG.API_BASE}/jobs/${jobId}/download/${zipFilename}`;

        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = zipFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addLog(`Downloading: ${zipFilename}`, 'info');
    }

    function handleJobFailure(data) {
        const errorMsg = data.error || data.message || 'Processing failed';
        addLog(`Job failed: ${errorMsg}`, 'error');
        showModal('Processing Failed', errorMsg);
        resetProcessingState();
    }

    function cancelProcessing() {
        stopPolling();
        addLog('Processing cancelled by user', 'warning');
        resetProcessingState();
    }

    function resetProcessingState() {
        state.isProcessing = false;
        state.currentJobId = null;
        stopPolling();

        elements.progressSection.style.display = 'none';
        elements.optionsSection.style.display = 'block';
        elements.startBtn.style.display = 'inline-flex';
        elements.cancelBtn.style.display = 'none';

        updateStartButton();
        updateStatusBadge('Ready');
    }

    function resetToUploadState() {
        clearAllFiles();
        elements.resultsSection.style.display = 'none';
        state.currentJobId = null;  // Clear job ID when starting over
        updateStatusBadge('Ready');
        addLog('Ready for new upload', 'info');
    }

    // ============================================
    // PROGRESS UPDATES
    // ============================================
    function updateProgress(percent, statusText, current, total) {
        elements.progressPercent.textContent = `${Math.round(percent)}%`;
        elements.progressBarFill.style.width = `${percent}%`;
        elements.progressStatus.textContent = statusText;
        elements.progressFiles.textContent = `${current} / ${total} files`;
    }

    // ============================================
    // UI UPDATES
    // ============================================
    function updateStatusBadge(status) {
        elements.statusBadge.textContent = status;
    }

    function addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

        entry.innerHTML = `
            <span class="log-time">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;

        elements.logContainer.appendChild(entry);

        // Auto-scroll to bottom
        elements.logContainer.scrollTop = elements.logContainer.scrollHeight;

        // Keep only last 50 entries
        while (elements.logContainer.children.length > 50) {
            elements.logContainer.removeChild(elements.logContainer.firstChild);
        }
    }

    // ============================================
    // MODAL
    // ============================================
    async function showModal(title, message) {
        try {
            elements.modalTitle.textContent = title;
            elements.modalMessage.textContent = message;
            elements.errorModal.style.display = 'flex';

            // Allow for potential async modal actions in future
            await Promise.resolve();
        } catch (error) {
            console.error('Error displaying modal:', error);
        }
    }

    function hideModal() {
        elements.errorModal.style.display = 'none';
    }

    // ============================================
    // SETTINGS MANAGEMENT
    // ============================================
    function getDefaultSettings() {
        return {
            qualityOptimized: 95,
            qualityCompressed: 80,
            defaultOptimizedJpg: true,
            defaultOptimizedWebp: true,
            defaultCompressedJpg: true,
            defaultCompressedWebp: true,
            defaultCreateZip: true,
            defaultExif: 'keep',
            rememberLastSettings: true
        };
    }

    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('photopackager_settings');
            const settings = savedSettings ? JSON.parse(savedSettings) : getDefaultSettings();
            applySettingsToModal(settings);
            applySettingsToForm(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            applySettingsToModal(getDefaultSettings());
            applySettingsToForm(getDefaultSettings());
        }
    }

    function applySettingsToModal(settings) {
        elements.settingQualityOptimized.value = settings.qualityOptimized;
        elements.settingQualityOptimizedValue.textContent = settings.qualityOptimized;
        elements.settingQualityCompressed.value = settings.qualityCompressed;
        elements.settingQualityCompressedValue.textContent = settings.qualityCompressed;
        elements.settingDefaultOptimizedJpg.checked = settings.defaultOptimizedJpg;
        elements.settingDefaultOptimizedWebp.checked = settings.defaultOptimizedWebp;
        elements.settingDefaultCompressedJpg.checked = settings.defaultCompressedJpg;
        elements.settingDefaultCompressedWebp.checked = settings.defaultCompressedWebp;
        elements.settingDefaultCreateZip.checked = settings.defaultCreateZip;
        elements.settingDefaultExif.value = settings.defaultExif;
        elements.settingRememberLastSettings.checked = settings.rememberLastSettings;
    }

    function applySettingsToForm(settings) {
        // Apply to main form controls
        if (document.querySelector('[name="generate_optimized_jpg"]')) {
            document.querySelector('[name="generate_optimized_jpg"]').checked = settings.defaultOptimizedJpg;
        }
        if (document.querySelector('[name="generate_optimized_webp"]')) {
            document.querySelector('[name="generate_optimized_webp"]').checked = settings.defaultOptimizedWebp;
        }
        if (document.querySelector('[name="generate_compressed_jpg"]')) {
            document.querySelector('[name="generate_compressed_jpg"]').checked = settings.defaultCompressedJpg;
        }
        if (document.querySelector('[name="generate_compressed_webp"]')) {
            document.querySelector('[name="generate_compressed_webp"]').checked = settings.defaultCompressedWebp;
        }
        if (document.querySelector('[name="create_zip_packages"]')) {
            document.querySelector('[name="create_zip_packages"]').checked = settings.defaultCreateZip;
        }
        if (document.querySelector('[name="exif_option"]')) {
            document.querySelector('[name="exif_option"]').value = settings.defaultExif;
        }
    }

    function saveSettings() {
        const settings = {
            qualityOptimized: parseInt(elements.settingQualityOptimized.value),
            qualityCompressed: parseInt(elements.settingQualityCompressed.value),
            defaultOptimizedJpg: elements.settingDefaultOptimizedJpg.checked,
            defaultOptimizedWebp: elements.settingDefaultOptimizedWebp.checked,
            defaultCompressedJpg: elements.settingDefaultCompressedJpg.checked,
            defaultCompressedWebp: elements.settingDefaultCompressedWebp.checked,
            defaultCreateZip: elements.settingDefaultCreateZip.checked,
            defaultExif: elements.settingDefaultExif.value,
            rememberLastSettings: elements.settingRememberLastSettings.checked
        };

        try {
            localStorage.setItem('photopackager_settings', JSON.stringify(settings));
            applySettingsToForm(settings);
            closeSettingsModal();
            addLog('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showModal('Error', 'Failed to save settings: ' + error.message);
        }
    }

    function resetSettings() {
        const defaults = getDefaultSettings();
        applySettingsToModal(defaults);
        addLog('Settings reset to defaults', 'info');
    }

    function openSettingsModal() {
        elements.settingsModal.style.display = 'flex';
    }

    function closeSettingsModal() {
        elements.settingsModal.style.display = 'none';
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function truncateFileName(name, maxLength) {
        if (name.length <= maxLength) return name;

        const extension = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
        const truncated = nameWithoutExt.substring(0, maxLength - extension.length - 4);

        return `${truncated}...${extension}`;
    }

    // ============================================
    // START APPLICATION
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
