/**
 * Voice Search Feature (2026)
 * Web Speech API for hands-free product search
 * @module VoiceSearch
 */

export class VoiceSearch {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.supportsSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    // Supported languages
    this.languages = {
      vi: 'vi-VN',  // Vietnamese
      en: 'en-US'   // English
    };
    
    this.currentLang = 'vi';
    
    // Product keywords for better recognition
    this.productKeywords = [
      'lạp xưởng', 'lap xuong', 'lap xương',
      'gạo lứt', 'gao lut',
      'organic', 'hữu cơ',
      'cay', 'ngọt', 'vừa',
      'đặc biệt', 'cao cấp', 'premium'
    ];
  }

  /**
   * Initialize voice search
   */
  init() {
    if (!this.supportsSpeech) {
      console.warn('[VoiceSearch] Speech recognition not supported');
      return;
    }

    // Initialize Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configuration
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = this.languages[this.currentLang];

    // Event handlers
    this.recognition.onstart = () => this.onStart();
    this.recognition.onresult = (event) => this.onResult(event);
    this.recognition.onerror = (event) => this.onError(event);
    this.recognition.onend = () => this.onEnd();

    console.log('[VoiceSearch] Initialized successfully');
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.recognition) {
      console.error('[VoiceSearch] Recognition not initialized');
      return;
    }

    if (this.isListening) {
      console.warn('[VoiceSearch] Already listening');
      return;
    }

    try {
      this.recognition.start();
      console.log('[VoiceSearch] Started listening...');
      
      // Analytics
      if (window.gtag) {
        gtag('event', 'voice_search_started', {
          language: this.currentLang
        });
      }
    } catch (error) {
      console.error('[VoiceSearch] Start failed:', error);
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      console.log('[VoiceSearch] Stopped listening');
    }
  }

  /**
   * Change language
   */
  setLanguage(lang) {
    if (!this.languages[lang]) {
      console.warn(`[VoiceSearch] Language ${lang} not supported`);
      return;
    }

    this.currentLang = lang;
    if (this.recognition) {
      this.recognition.lang = this.languages[lang];
      console.log(`[VoiceSearch] Language changed to ${lang}`);
    }
  }

  /**
   * Handle recognition start
   */
  onStart() {
    this.isListening = true;
    
    // Update UI
    const button = document.getElementById('voiceSearchBtn');
    if (button) {
      button.classList.add('listening');
      button.innerHTML = `
        <svg class="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/>
        </svg>
      `;
    }

    // Show listening indicator
    this.showListeningIndicator();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('voiceSearchStart'));
  }

  /**
   * Handle recognition result
   */
  onResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';

    // Process results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Update UI with interim results
    if (interimTranscript) {
      this.updateTranscript(interimTranscript, false);
    }

    // Process final transcript
    if (finalTranscript) {
      console.log('[VoiceSearch] Final transcript:', finalTranscript);
      this.updateTranscript(finalTranscript, true);
      this.processSearchQuery(finalTranscript);
      
      // Analytics
      if (window.gtag) {
        gtag('event', 'voice_search_query', {
          search_term: finalTranscript,
          language: this.currentLang
        });
      }
    }
  }

  /**
   * Handle recognition error
   */
  onError(event) {
    console.error('[VoiceSearch] Error:', event.error);
    
    const errorMessages = {
      'no-speech': 'Không nghe thấy giọng nói. Vui lòng thử lại.',
      'audio-capture': 'Không thể truy cập microphone.',
      'not-allowed': 'Vui lòng cấp quyền sử dụng microphone.',
      'network': 'Lỗi mạng. Vui lòng kiểm tra kết nối.',
      'aborted': 'Tìm kiếm bị hủy.'
    };

    const message = errorMessages[event.error] || 'Lỗi không xác định';
    this.showNotification('error', message);

    // Analytics
    if (window.gtag) {
      gtag('event', 'voice_search_error', {
        error_type: event.error
      });
    }
  }

  /**
   * Handle recognition end
   */
  onEnd() {
    this.isListening = false;
    
    // Update UI
    const button = document.getElementById('voiceSearchBtn');
    if (button) {
      button.classList.remove('listening');
      button.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/>
        </svg>
      `;
    }

    // Hide listening indicator
    this.hideListeningIndicator();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('voiceSearchEnd'));
  }

  /**
   * Process search query
   */
  processSearchQuery(query) {
    const normalizedQuery = this.normalizeQuery(query);
    console.log('[VoiceSearch] Normalized query:', normalizedQuery);

    // Fill search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = normalizedQuery;
      
      // Trigger search
      const searchEvent = new Event('input', { bubbles: true });
      searchInput.dispatchEvent(searchEvent);
    }

    // Dispatch custom event with query
    document.dispatchEvent(new CustomEvent('voiceSearchQuery', {
      detail: { query: normalizedQuery, originalQuery: query }
    }));
  }

  /**
   * Normalize query (fix common transcription errors)
   */
  normalizeQuery(query) {
    let normalized = query.toLowerCase().trim();

    // Vietnamese common fixes
    const replacements = {
      'lập xương': 'lạp xưởng',
      'lập xướng': 'lạp xưởng',
      'gao lut': 'gạo lứt',
      'huu co': 'hữu cơ',
      'organic': 'organic'
    };

    Object.entries(replacements).forEach(([wrong, correct]) => {
      normalized = normalized.replace(new RegExp(wrong, 'gi'), correct);
    });

    return normalized;
  }

  /**
   * Update transcript display
   */
  updateTranscript(text, isFinal) {
    const transcriptEl = document.getElementById('voiceTranscript');
    if (transcriptEl) {
      transcriptEl.textContent = text;
      transcriptEl.classList.toggle('final', isFinal);
      transcriptEl.classList.toggle('interim', !isFinal);
    }
  }

  /**
   * Show listening indicator
   */
  showListeningIndicator() {
    let indicator = document.getElementById('voiceListeningIndicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'voiceListeningIndicator';
      indicator.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3';
      indicator.innerHTML = `
        <div class="flex gap-1">
          <span class="w-1 h-4 bg-white rounded animate-pulse" style="animation-delay: 0s"></span>
          <span class="w-1 h-4 bg-white rounded animate-pulse" style="animation-delay: 0.1s"></span>
          <span class="w-1 h-4 bg-white rounded animate-pulse" style="animation-delay: 0.2s"></span>
        </div>
        <span data-vi="Đang nghe..." data-en="Listening...">Đang nghe...</span>
        <div id="voiceTranscript" class="font-semibold"></div>
      `;
      document.body.appendChild(indicator);
    }

    indicator.style.display = 'flex';
  }

  /**
   * Hide listening indicator
   */
  hideListeningIndicator() {
    const indicator = document.getElementById('voiceListeningIndicator');
    if (indicator) {
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 1000);
    }
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  /**
   * Check if voice search is supported
   */
  static isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Create voice search button
   */
  static createButton(containerId = 'searchContainer') {
    if (!VoiceSearch.isSupported()) {
      console.warn('[VoiceSearch] Not supported in this browser');
      return null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[VoiceSearch] Container #${containerId} not found`);
      return null;
    }

    const button = document.createElement('button');
    button.id = 'voiceSearchBtn';
    button.className = 'voice-search-btn p-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition';
    button.title = 'Tìm kiếm bằng giọng nói';
    button.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/>
      </svg>
    `;

    container.appendChild(button);
    return button;
  }
}

// Export singleton instance
export default new VoiceSearch();
