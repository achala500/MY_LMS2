/**
 * StudySync â€” Custom Focus & Productivity Gradient Slider Component (1â€“10)
 * Pure pointer/touch drag interactions, dynamic color shifting, floating tooltips, zero default range inputs.
 */

export class CustomSlider {
  /**
   * @param {HTMLElement|string} container - Container element or selector
   * @param {Object} options
   * @param {number} [options.min=1]
   * @param {number} [options.max=10]
   * @param {number} [options.step=1]
   * @param {number} [options.value=7]
   * @param {'focus'|'productivity'|'generic'} [options.type='focus']
   * @param {string} [options.label='Focus Level']
   * @param {Function} [options.onChange]
   * @param {Function} [options.onInput]
   * @param {boolean} [options.disabled=false]
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) {
      throw new Error(`[CustomSlider] Container element not found: ${container}`);
    }

    this.min = options.min ?? 1;
    this.max = options.max ?? 10;
    this.step = options.step ?? 1;
    this.value = Math.min(this.max, Math.max(this.min, options.value ?? 7));
    this.type = options.type || 'focus';
    this.label = options.label || (this.type === 'focus' ? 'Focus Level' : 'Productivity Level');
    this.onChange = options.onChange || null;
    this.onInput = options.onInput || null;
    this.disabled = !!options.disabled;

    this.isDragging = false;
    this._render();
    this._bindEvents();
    this._updateVisuals(false);
  }

  /**
   * Get qualitative description and color styling for a 1-10 score
   * @param {number} val 
   * @returns {Object} { status, tone, primaryColor, gradient, textColor, badgeBg }
   */
  static getScoreTier(val) {
    const v = Math.round(val);
    if (v <= 3) {
      return {
        status: 'Distracted / Low',
        emoji: '',
        tone: 'danger',
        primaryColor: '#ef4444',
        secondaryColor: '#f97316',
        gradient: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
        textColor: '#fca5a5',
        badgeBg: 'rgba(239, 68, 68, 0.15)',
        badgeBorder: 'rgba(239, 68, 68, 0.3)'
      };
    } else if (v <= 6) {
      return {
        status: 'Moderate / Steady',
        emoji: '',
        tone: 'warning',
        primaryColor: '#eab308',
        secondaryColor: '#10b981',
        gradient: 'linear-gradient(90deg, #eab308 0%, #10b981 100%)',
        textColor: '#fde047',
        badgeBg: 'rgba(234, 179, 8, 0.15)',
        badgeBorder: 'rgba(234, 179, 8, 0.3)'
      };
    } else if (v <= 8) {
      return {
        status: 'High / Productive',
        emoji: '',
        tone: 'success',
        primaryColor: '#10b981',
        secondaryColor: '#06b6d4',
        gradient: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
        textColor: '#6ee7b7',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeBorder: 'rgba(16, 185, 129, 0.3)'
      };
    } else {
      return {
        status: 'Deep Flow State ðŸ”¥',
        emoji: 'ðŸ”¥',
        tone: 'purple',
        primaryColor: '#06b6d4',
        secondaryColor: '#8b5cf6',
        gradient: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%)',
        textColor: '#c4b5fd',
        badgeBg: 'rgba(139, 92, 246, 0.18)',
        badgeBorder: 'rgba(139, 92, 246, 0.4)'
      };
    }
  }

  /**
   * Render HTML structure into container
   */
  _render() {
    this.container.innerHTML = `
      <div class="slider-wrapper flex flex-col gap-1.5 ${this.disabled ? 'opacity-50 pointer-events-none' : ''}">
        <!-- Slider Header: Label + Qualitative Pill + Numeric Score -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="font-medium text-slate-300">${this.label}</span>
            <span class="slider-tier-badge text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200"></span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="slider-val-display font-mono text-sm font-bold text-white"></span>
            <span class="text-[10px] text-slate-500 font-mono">/ 10</span>
          </div>
        </div>

        <!-- Interactive Slider Container -->
        <div class="custom-slider-container" role="slider" tabindex="${this.disabled ? -1 : 0}"
             aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-valuenow="${this.value}"
             aria-label="${this.label}">
          <div class="custom-slider-track">
            <div class="custom-slider-fill"></div>
            <div class="custom-slider-thumb">
              <div class="custom-slider-thumb-dot"></div>
              <div class="custom-slider-badge"></div>
            </div>
          </div>
          <!-- Ticks 1 to 10 -->
          <div class="custom-slider-ticks">
            ${Array.from({ length: 10 }, (_, i) => `<span>${i + 1}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    this.wrapperEl = this.container.querySelector('.slider-wrapper');
    this.sliderContainerEl = this.container.querySelector('.custom-slider-container');
    this.trackEl = this.container.querySelector('.custom-slider-track');
    this.fillEl = this.container.querySelector('.custom-slider-fill');
    this.thumbEl = this.container.querySelector('.custom-slider-thumb');
    this.thumbDotEl = this.container.querySelector('.custom-slider-thumb-dot');
    this.badgeEl = this.container.querySelector('.custom-slider-badge');
    this.tierBadgeEl = this.container.querySelector('.slider-tier-badge');
    this.valDisplayEl = this.container.querySelector('.slider-val-display');
  }

  /**
   * Bind mouse, touch, and keyboard interaction events
   */
  _bindEvents() {
    if (this.disabled) return;

    // Pointer events on track
    const handlePointerDown = (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.thumbEl.classList.add('is-dragging');
      this.sliderContainerEl.setPointerCapture(e.pointerId);
      this._updateFromPointer(e);
    };

    const handlePointerMove = (e) => {
      if (!this.isDragging) return;
      this._updateFromPointer(e);
    };

    const handlePointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.thumbEl.classList.remove('is-dragging');
      try {
        this.sliderContainerEl.releasePointerCapture(e.pointerId);
      } catch (_) {}
      this._notifyChange();
    };

    this.sliderContainerEl.addEventListener('pointerdown', handlePointerDown);
    this.sliderContainerEl.addEventListener('pointermove', handlePointerMove);
    this.sliderContainerEl.addEventListener('pointerup', handlePointerUp);
    this.sliderContainerEl.addEventListener('pointercancel', handlePointerUp);

    // Keyboard accessibility
    this.sliderContainerEl.addEventListener('keydown', (e) => {
      let delta = 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = this.step;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -this.step;
      else if (e.key === 'Home') this.setValue(this.min);
      else if (e.key === 'End') this.setValue(this.max);

      if (delta !== 0) {
        e.preventDefault();
        this.setValue(this.value + delta);
      }
    });
  }

  /**
   * Calculate value from pointer X coordinate
   */
  _updateFromPointer(e) {
    const rect = this.trackEl.getBoundingClientRect();
    const width = rect.width;
    if (width <= 0) return;

    const offsetX = Math.max(0, Math.min(width, e.clientX - rect.left));
    const ratio = offsetX / width;
    const rawVal = this.min + ratio * (this.max - this.min);
    
    // Snap to step
    const steppedVal = Math.round((rawVal - this.min) / this.step) * this.step + this.min;
    const clampedVal = Math.min(this.max, Math.max(this.min, steppedVal));

    if (clampedVal !== this.value) {
      this.value = clampedVal;
      this._updateVisuals(true);
      if (this.onInput) {
        this.onInput(this.value, CustomSlider.getScoreTier(this.value));
      }
    }
  }

  /**
   * Update visual elements (track fill, thumb position, colors, badges)
   */
  _updateVisuals(triggerHaptic = false) {
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    const tier = CustomSlider.getScoreTier(this.value);

    // Update dimensions and positions
    this.fillEl.style.width = `${percent}%`;
    this.fillEl.style.background = tier.gradient;
    this.fillEl.style.color = tier.primaryColor;

    this.thumbEl.style.left = `${percent}%`;
    this.thumbEl.style.color = tier.primaryColor;
    this.thumbEl.style.boxShadow = `0 0 16px ${tier.primaryColor}aa, 0 2px 6px rgba(0, 0, 0, 0.5)`;
    this.thumbDotEl.style.background = tier.primaryColor;

    // Update badges and labels
    this.badgeEl.textContent = `${this.value} â€” ${tier.status}`;
    this.badgeEl.style.borderColor = tier.badgeBorder;
    this.badgeEl.style.color = tier.textColor;

    this.valDisplayEl.textContent = this.value;
    this.valDisplayEl.style.color = tier.textColor;

    this.tierBadgeEl.textContent = `${tier.emoji} ${tier.status}`;
    this.tierBadgeEl.style.backgroundColor = tier.badgeBg;
    this.tierBadgeEl.style.borderColor = tier.badgeBorder;
    this.tierBadgeEl.style.color = tier.textColor;

    this.sliderContainerEl.setAttribute('aria-valuenow', this.value);
    this.sliderContainerEl.setAttribute('aria-valuetext', `${this.value} - ${tier.status}`);

    // Haptic feedback (on supported mobile devices)
    if (triggerHaptic && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(6);
    }
  }

  /**
   * Notify change listeners
   */
  _notifyChange() {
    const tier = CustomSlider.getScoreTier(this.value);
    if (this.onChange) {
      this.onChange(this.value, tier);
    }
    // Dispatch native custom event
    const event = new CustomEvent('sliderchange', {
      detail: { value: this.value, tier }
    });
    this.container.dispatchEvent(event);
  }

  /**
   * Set slider value programmatically
   * @param {number} val 
   */
  setValue(val) {
    const clamped = Math.min(this.max, Math.max(this.min, Math.round(val)));
    if (clamped !== this.value) {
      this.value = clamped;
      this._updateVisuals(false);
      this._notifyChange();
    }
  }

  /**
   * Get current value
   * @returns {number}
   */
  getValue() {
    return this.value;
  }

  /**
   * Set disabled state
   * @param {boolean} isDisabled 
   */
  setDisabled(isDisabled) {
    this.disabled = !!isDisabled;
    if (this.disabled) {
      this.wrapperEl.classList.add('opacity-50', 'pointer-events-none');
      this.sliderContainerEl.setAttribute('tabindex', -1);
    } else {
      this.wrapperEl.classList.remove('opacity-50', 'pointer-events-none');
      this.sliderContainerEl.setAttribute('tabindex', 0);
    }
  }
}

/**
 * Helper to create a paired Dual Slider (Focus + Productivity) for a subject
 * @param {HTMLElement|string} container 
 * @param {Object} options
 * @param {string} options.subjectName
 * @param {number} [options.initialFocus=7]
 * @param {number} [options.initialProductivity=7]
 * @param {Function} [options.onFocusChange]
 * @param {Function} [options.onProductivityChange]
 * @param {boolean} [options.disabled=false]
 * @returns {{ focusSlider: CustomSlider, prodSlider: CustomSlider }}
 */
export function createDualSlider(container, options = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) throw new Error(`[createDualSlider] Target container not found: ${container}`);

  el.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="focus-slider-mount"></div>
      <div class="prod-slider-mount"></div>
    </div>
  `;

  const focusMount = el.querySelector('.focus-slider-mount');
  const prodMount = el.querySelector('.prod-slider-mount');

  const focusSlider = new CustomSlider(focusMount, {
    label: `${options.subjectName || 'Subject'} Focus`,
    type: 'focus',
    value: options.initialFocus ?? 7,
    disabled: options.disabled,
    onChange: options.onFocusChange
  });

  const prodSlider = new CustomSlider(prodMount, {
    label: `${options.subjectName || 'Subject'} Productivity`,
    type: 'productivity',
    value: options.initialProductivity ?? 7,
    disabled: options.disabled,
    onChange: options.onProductivityChange
  });

  return { focusSlider, prodSlider };
}

export default CustomSlider;
