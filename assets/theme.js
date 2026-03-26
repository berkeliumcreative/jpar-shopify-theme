/* ============================================================
   JPAR Cosmetics — Shopify 2.0 Theme JavaScript
   All effects ported from React/Framer Motion to vanilla JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Utilities ────────────────────────────────────────────── */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts); }
  function off(el, evt, fn) { if (el) el.removeEventListener(evt, fn); }

  /* ── Typewriter Effect ────────────────────────────────────── */
  function initTypewriter() {
    qsa('[data-typewriter]').forEach(function (el) {
      var words;
      try { words = JSON.parse(el.getAttribute('data-typewriter')); } catch (e) { return; }
      if (!words || !words.length) return;

      var typingSpeed = parseInt(el.getAttribute('data-typing-speed')) || 80;
      var deletingSpeed = parseInt(el.getAttribute('data-deleting-speed')) || 40;
      var pauseDuration = parseInt(el.getAttribute('data-pause')) || 2500;
      var textEl = el.querySelector('[data-typewriter-text]') || el;
      var cursorEl = el.querySelector('.typewriter-cursor');

      var wordIndex = 0;
      var charIndex = 0;
      var isDeleting = false;
      var timeout;

      function tick() {
        var currentWord = words[wordIndex];

        if (!isDeleting) {
          if (charIndex < currentWord.length) {
            charIndex++;
            textEl.textContent = currentWord.slice(0, charIndex);
            timeout = setTimeout(tick, typingSpeed);
          } else {
            timeout = setTimeout(function () {
              isDeleting = true;
              tick();
            }, pauseDuration);
          }
        } else {
          if (charIndex > 0) {
            charIndex--;
            textEl.textContent = currentWord.slice(0, charIndex);
            timeout = setTimeout(tick, deletingSpeed);
          } else {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            timeout = setTimeout(tick, typingSpeed);
          }
        }
      }

      tick();
    });
  }

  /* ── Magnetic Button Effect ───────────────────────────────── */
  function initMagneticButtons() {
    qsa('[data-magnetic]').forEach(function (wrap) {
      var strength = parseFloat(wrap.getAttribute('data-magnetic-strength')) || 0.3;
      var btn = wrap.firstElementChild || wrap;
      var animFrame;

      on(wrap, 'mousemove', function (e) {
        var rect = wrap.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * strength;
        var dy = (e.clientY - cy) * strength;

        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(function () {
          wrap.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.05)';
        });
      });

      on(wrap, 'mouseleave', function () {
        cancelAnimationFrame(animFrame);
        wrap.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  /* ── Spotlight Card Effect ────────────────────────────────── */
  function initSpotlightCards() {
    qsa('[data-spotlight]').forEach(function (card) {
      on(card, 'mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--spotlight-x', x + 'px');
        card.style.setProperty('--spotlight-y', y + 'px');
        card.style.background = 'radial-gradient(400px circle at ' + x + 'px ' + y + 'px, rgba(224,32,32,0.06), transparent 40%)';
      });

      on(card, 'mouseleave', function () {
        card.style.background = 'transparent';
      });
    });
  }

  /* ── Parallax Sections ────────────────────────────────────── */
  function initParallax() {
    if (window.matchMedia('(max-width: 767px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    qsa('[data-parallax]').forEach(function (section) {
      var speed = parseFloat(section.getAttribute('data-parallax-speed')) || 0.15;
      var inner = section.firstElementChild;
      if (!inner) return;

      function onScroll() {
        var rect = section.getBoundingClientRect();
        var vh = window.innerHeight;
        var progress = (vh - rect.top) / (vh + rect.height);
        progress = Math.max(0, Math.min(1, progress));
        var offset = (progress - 0.5) * speed * 200;
        inner.style.transform = 'translateY(' + offset + 'px)';
      }

      var ticking = false;
      on(window, 'scroll', function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      onScroll();
    });
  }

  /* ── Scroll Reveal Animations ─────────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    qsa('[data-reveal]').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      var delay = el.getAttribute('data-reveal-delay');
      if (delay) el.style.transitionDelay = delay + 'ms';
      observer.observe(el);
    });

    // Add the is-visible style
    var style = document.createElement('style');
    style.textContent = '[data-reveal].is-visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

  /* ── FAQ Accordion ────────────────────────────────────────── */
  function initAccordions() {
    qsa('.accordion-item').forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      if (!trigger || !content) return;

      on(trigger, 'click', function () {
        var isOpen = item.classList.contains('open');

        // Close siblings
        var parent = item.parentElement;
        if (parent) {
          qsa('.accordion-item.open', parent).forEach(function (sibling) {
            if (sibling !== item) {
              sibling.classList.remove('open');
              var sc = sibling.querySelector('.accordion-content');
              if (sc) sc.style.maxHeight = '0';
            }
          });
        }

        if (isOpen) {
          item.classList.remove('open');
          content.style.maxHeight = '0';
        } else {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  /* ── Header Scroll Detection ──────────────────────────────── */
  function initHeaderScroll() {
    var header = qs('.site-header');
    if (!header) return;
    if (header.classList.contains('header-light')) return; // Already styled for light pages

    var lastScroll = 0;
    on(window, 'scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    }, { passive: true });
  }

  /* ── Header Mega Menu Overlay ─────────────────────────────── */
  function initHeaderOverlay() {
    var overlay = qs('[data-menu-overlay]');
    var mobileOverlay = qs('[data-mobile-overlay]');
    if (!overlay && !mobileOverlay) return;

    var desktopNav = qs('[data-desktop-nav]');
    var navContent = overlay ? qs('[data-overlay-content]', overlay) : null;
    var hamburgerBtn = qs('[data-hamburger]');
    var closeBtn = qs('[data-menu-close]');
    var activeMenu = null;

    function getOrigin(el) {
      if (!el) return { x: 50, y: 50 };
      var rect = el.getBoundingClientRect();
      return {
        x: ((rect.left + rect.width / 2) / window.innerWidth * 100),
        y: ((rect.top + rect.height / 2) / window.innerHeight * 100)
      };
    }

    function openOverlay(target, origin) {
      target.style.setProperty('--origin-x', origin.x + '%');
      target.style.setProperty('--origin-y', origin.y + '%');
      target.classList.add('open');
      document.body.classList.add('menu-open');
    }

    function closeAll() {
      if (overlay) overlay.classList.remove('open');
      if (mobileOverlay) mobileOverlay.classList.remove('open');
      document.body.classList.remove('menu-open');
      activeMenu = null;

      // Reset active states
      qsa('.header-link.active').forEach(function (l) { l.classList.remove('active'); });
    }

    // Desktop nav dropdown clicks
    if (desktopNav) {
      qsa('[data-submenu]', desktopNav).forEach(function (btn) {
        on(btn, 'click', function () {
          var menuName = btn.getAttribute('data-submenu');

          if (activeMenu === menuName) {
            closeAll();
            return;
          }

          var origin = getOrigin(btn);
          var isAlreadyOpen = overlay.classList.contains('open');

          // Update content
          if (navContent) {
            qsa('[data-submenu-content]', navContent).forEach(function (c) {
              c.style.display = c.getAttribute('data-submenu-content') === menuName ? '' : 'none';
            });
          }

          // Mark active
          qsa('.header-link', desktopNav).forEach(function (l) { l.classList.remove('active'); });
          btn.classList.add('active');

          if (!isAlreadyOpen) {
            openOverlay(overlay, origin);
          }

          activeMenu = menuName;
        });
      });
    }

    // Mobile hamburger
    if (hamburgerBtn && mobileOverlay) {
      on(hamburgerBtn, 'click', function () {
        if (mobileOverlay.classList.contains('open')) {
          closeAll();
        } else {
          var origin = getOrigin(hamburgerBtn);
          openOverlay(mobileOverlay, origin);
        }
      });

      // Mobile submenu navigation
      qsa('[data-mobile-submenu]', mobileOverlay).forEach(function (btn) {
        on(btn, 'click', function () {
          var target = btn.getAttribute('data-mobile-submenu');
          var mainNav = qs('[data-mobile-main]', mobileOverlay);
          var subNav = qs('[data-mobile-sub="' + target + '"]', mobileOverlay);
          if (mainNav) mainNav.style.display = 'none';
          if (subNav) subNav.style.display = '';
        });
      });

      qsa('[data-mobile-back]', mobileOverlay).forEach(function (btn) {
        on(btn, 'click', function () {
          var mainNav = qs('[data-mobile-main]', mobileOverlay);
          qsa('[data-mobile-sub]', mobileOverlay).forEach(function (s) { s.style.display = 'none'; });
          if (mainNav) mainNav.style.display = '';
        });
      });
    }

    // Close button
    if (closeBtn) {
      on(closeBtn, 'click', closeAll);
    }

    // Close overlay links
    qsa('[data-overlay-link]').forEach(function (link) {
      on(link, 'click', closeAll);
    });

    // ESC key
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  /* ── Cart Drawer ──────────────────────────────────────────── */
  function initCartDrawer() {
    var drawerOverlay = qs('[data-cart-overlay]');
    var drawer = qs('[data-cart-drawer]');
    if (!drawerOverlay || !drawer) return;

    var body = qs('[data-cart-body]', drawer);
    var countEl = qs('[data-cart-count]', drawer);
    var subtotalEl = qs('[data-cart-subtotal]', drawer);
    var footerEl = qs('[data-cart-footer]', drawer);
    var emptyEl = qs('[data-cart-empty]', drawer);
    var headerBadges = qsa('[data-cart-badge]');

    function openDrawer() {
      drawerOverlay.classList.add('open');
      drawer.classList.add('open');
      document.body.classList.add('cart-open');
      refreshCart();
    }

    function closeDrawer() {
      drawerOverlay.classList.remove('open');
      drawer.classList.remove('open');
      document.body.classList.remove('cart-open');
    }

    function updateBadge(count) {
      headerBadges.forEach(function (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      });
    }

    function formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }

    function refreshCart() {
      fetch('/cart.js', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (cart) { renderCart(cart); })
        .catch(function (err) { console.error('Cart fetch error:', err); });
    }

    function renderCart(cart) {
      updateBadge(cart.item_count);

      if (!body) return;

      if (cart.item_count === 0) {
        if (emptyEl) emptyEl.style.display = '';
        body.innerHTML = '';
        if (footerEl) footerEl.style.display = 'none';
        if (countEl) countEl.textContent = 'Your cart is empty';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';
      if (footerEl) footerEl.style.display = '';
      if (countEl) {
        countEl.textContent = cart.item_count + ' item' + (cart.item_count !== 1 ? 's' : '') + ' in your cart';
      }
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

      var html = '';
      cart.items.forEach(function (item) {
        html += '<div class="cart-item" data-line-key="' + item.key + '">';
        html += '<div class="cart-item-image">';
        if (item.image) {
          html += '<img src="' + item.image.replace(/(\.\w+)$/, '_200x$1') + '" alt="' + item.title + '" loading="lazy">';
        }
        html += '</div>';
        html += '<div class="cart-item-info">';
        html += '<div class="cart-item-title">' + item.product_title + '</div>';
        if (item.variant_title) {
          html += '<div class="cart-item-variant">' + item.variant_title + '</div>';
        }
        html += '<div class="cart-item-price">' + formatMoney(item.final_line_price) + '</div>';
        html += '</div>';
        html += '<div class="cart-item-actions">';
        html += '<button class="btn-icon" data-cart-remove="' + item.key + '" aria-label="Remove">';
        html += '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';
        html += '</button>';
        html += '<div class="qty-control">';
        html += '<button class="qty-btn" data-cart-qty="' + item.key + '" data-qty="' + (item.quantity - 1) + '">-</button>';
        html += '<span class="qty-value">' + item.quantity + '</span>';
        html += '<button class="qty-btn" data-cart-qty="' + item.key + '" data-qty="' + (item.quantity + 1) + '">+</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      });

      body.innerHTML = html;

      // Bind quantity change
      qsa('[data-cart-qty]', body).forEach(function (btn) {
        on(btn, 'click', function () {
          var key = btn.getAttribute('data-cart-qty');
          var qty = parseInt(btn.getAttribute('data-qty'));
          changeCartItem(key, qty);
        });
      });

      // Bind remove
      qsa('[data-cart-remove]', body).forEach(function (btn) {
        on(btn, 'click', function () {
          var key = btn.getAttribute('data-cart-remove');
          changeCartItem(key, 0);
        });
      });
    }

    function changeCartItem(key, quantity) {
      fetch('/cart/change.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) { renderCart(cart); })
        .catch(function (err) { console.error('Cart change error:', err); });
    }

    // Open triggers
    qsa('[data-cart-open]').forEach(function (btn) {
      on(btn, 'click', function (e) {
        e.preventDefault();
        openDrawer();
      });
    });

    // Close triggers
    on(drawerOverlay, 'click', closeDrawer);
    qsa('[data-cart-close]').forEach(function (btn) {
      on(btn, 'click', closeDrawer);
    });

    // Listen for cart updates from product forms
    on(document, 'cart:updated', refreshCart);
    on(document, 'cart:open', openDrawer);

    // Initial badge update
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) { updateBadge(cart.item_count); })
      .catch(function () {});
  }

  /* ── Product Card Ajax Add to Cart ────────────────────────── */
  function initProductCardForms() {
    on(document, 'submit', function (e) {
      var form = e.target.closest('[data-product-card-form]');
      if (!form) return;

      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;

      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) { data[key] = value; });

      fetch('/cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: parseInt(data.id), quantity: parseInt(data.quantity) || 1 }] })
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Add to cart failed');
          return r.json();
        })
        .then(function () {
          document.dispatchEvent(new CustomEvent('cart:updated'));
          document.dispatchEvent(new CustomEvent('cart:open'));
        })
        .catch(function (err) {
          console.error('Add to cart error:', err);
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  /* ── Product Detail: Variant Switching ────────────────────── */
  function initProductVariants() {
    var container = qs('[data-product-form]');
    if (!container) return;

    var variantJsonEl = qs('[data-product-variants]');
    if (!variantJsonEl) return;

    var variants;
    try { variants = JSON.parse(variantJsonEl.textContent); } catch (e) { return; }

    var selectedOptions = {};
    var variantInput = qs('input[name="id"]', container);
    var priceEl = qs('[data-product-price]');
    var comparePriceEl = qs('[data-product-compare-price]');
    var addBtn = qs('[data-add-to-cart]', container);
    var addBtnText = qs('[data-add-to-cart-text]', container);
    var mainImage = qs('[data-product-main-image] img');
    var qtyDisplay = qs('[data-quantity-display]');
    var quantity = 1;

    // Initialize selected options from first variant
    qsa('.variant-btn.selected', container).forEach(function (btn) {
      var idx = btn.getAttribute('data-option-index');
      selectedOptions['option' + idx] = btn.getAttribute('data-option-value');
    });

    // Variant option clicks
    qsa('.variant-btn', container).forEach(function (btn) {
      on(btn, 'click', function () {
        var idx = btn.getAttribute('data-option-index');
        var value = btn.getAttribute('data-option-value');
        selectedOptions['option' + idx] = value;

        // Update active state
        var group = btn.closest('.variant-group');
        if (group) {
          qsa('.variant-btn', group).forEach(function (b) { b.classList.remove('selected'); });
        }
        btn.classList.add('selected');

        // Find matching variant
        var match = variants.find(function (v) {
          return Object.keys(selectedOptions).every(function (key) {
            return v[key] === selectedOptions[key];
          });
        });

        if (match) {
          if (variantInput) variantInput.value = match.id;
          if (priceEl) priceEl.textContent = '$' + (match.price / 100).toFixed(2);
          if (comparePriceEl) {
            if (match.compare_at_price && match.compare_at_price > match.price) {
              comparePriceEl.textContent = '$' + (match.compare_at_price / 100).toFixed(2);
              comparePriceEl.style.display = '';
            } else {
              comparePriceEl.style.display = 'none';
            }
          }
          if (addBtn) addBtn.disabled = !match.available;
          if (addBtnText) addBtnText.textContent = match.available ? 'Add to Cart' : 'Sold Out';
          if (match.featured_image && mainImage) {
            mainImage.src = match.featured_image.src;
            mainImage.alt = match.featured_image.alt || '';
          }
        }
      });
    });

    // Thumbnail clicks
    qsa('[data-product-thumbnail]').forEach(function (thumb) {
      on(thumb, 'click', function () {
        var src = thumb.getAttribute('data-src');
        var alt = thumb.getAttribute('data-alt') || '';
        if (mainImage && src) {
          mainImage.src = src;
          mainImage.alt = alt;
        }
        qsa('[data-product-thumbnail]').forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });

    // Quantity controls
    var qtyMinus = qs('[data-qty-minus]', container);
    var qtyPlus = qs('[data-qty-plus]', container);
    var qtyInput = qs('input[name="quantity"]', container);

    if (qtyMinus) {
      on(qtyMinus, 'click', function () {
        quantity = Math.max(1, quantity - 1);
        if (qtyDisplay) qtyDisplay.textContent = quantity;
        if (qtyInput) qtyInput.value = quantity;
      });
    }
    if (qtyPlus) {
      on(qtyPlus, 'click', function () {
        quantity++;
        if (qtyDisplay) qtyDisplay.textContent = quantity;
        if (qtyInput) qtyInput.value = quantity;
      });
    }

    // Add to cart form
    var productForm = qs('form[data-product-add-form]', container);
    if (productForm) {
      on(productForm, 'submit', function (e) {
        e.preventDefault();
        if (addBtn) addBtn.disabled = true;

        var id = variantInput ? variantInput.value : null;
        var qty = qtyInput ? parseInt(qtyInput.value) : 1;

        fetch('/cart/add.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ id: parseInt(id), quantity: qty }] })
        })
          .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            return r.json();
          })
          .then(function () {
            document.dispatchEvent(new CustomEvent('cart:updated'));
            document.dispatchEvent(new CustomEvent('cart:open'));
          })
          .catch(function (err) {
            console.error('Add to cart error:', err);
          })
          .finally(function () {
            if (addBtn) addBtn.disabled = false;
          });
      });
    }
  }

  /* ── Email Popup ──────────────────────────────────────────── */
  function initEmailPopup() {
    var popup = qs('[data-email-popup]');
    if (!popup) return;

    var delay = (parseInt(popup.getAttribute('data-popup-delay')) || 10) * 1000;
    var STORAGE_KEY = 'jpar_popup_dismissed';

    if (localStorage.getItem(STORAGE_KEY)) return;

    setTimeout(function () {
      popup.classList.add('open');
    }, delay);

    function closePopup() {
      popup.classList.remove('open');
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    // Close button
    qsa('[data-popup-close]', popup).forEach(function (btn) {
      on(btn, 'click', closePopup);
    });

    // Backdrop click
    on(popup, 'click', function (e) {
      if (e.target === popup) closePopup();
    });

    // ESC key
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('open')) closePopup();
    });
  }

  /* ── Cart Page (non-drawer) ───────────────────────────────── */
  function initCartPage() {
    qsa('[data-cart-page-qty]').forEach(function (btn) {
      on(btn, 'click', function () {
        var key = btn.getAttribute('data-cart-page-qty');
        var qty = parseInt(btn.getAttribute('data-qty'));
        fetch('/cart/change.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: qty })
        }).then(function () { window.location.reload(); });
      });
    });

    qsa('[data-cart-page-remove]').forEach(function (btn) {
      on(btn, 'click', function () {
        var key = btn.getAttribute('data-cart-page-remove');
        fetch('/cart/change.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: 0 })
        }).then(function () { window.location.reload(); });
      });
    });
  }

  /* ── Initialize Everything on DOMContentLoaded ────────────── */
  function init() {
    initTypewriter();
    initMagneticButtons();
    initSpotlightCards();
    initParallax();
    initScrollReveal();
    initAccordions();
    initHeaderScroll();
    initHeaderOverlay();
    initCartDrawer();
    initProductCardForms();
    initProductVariants();
    initEmailPopup();
    initCartPage();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }

})();
