document.addEventListener("DOMContentLoaded", () => {
  window.portfolioProjects = window.portfolioProjects || {};

  const homeView = document.getElementById("home-view");
  const aboutView = document.getElementById("about-view");
  const contactView = document.getElementById("contact-view");
  const detailView = document.getElementById("detail-view");
  const gridContainer = document.getElementById("grid-container");

  function loadProjectsData() {
    return new Promise((resolve) => {
      const registry = window.portfolioProjectsRegistry || [];
      if (registry.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      registry.forEach((slug) => {
        const script = document.createElement("script");
        script.src = `projects/${slug}/project-data.js?v=${Date.now()}`;
        script.async = true;
        
        script.onload = () => {
          loadedCount++;
          if (loadedCount === registry.length) resolve();
        };
        script.onerror = () => {
          console.error(`Failed loading registry: ${slug}`);
          loadedCount++;
          if (loadedCount === registry.length) resolve();
        };
        document.body.appendChild(script);
      });
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderProjectsGrid() {
    gridContainer.innerHTML = "";
    const registry = window.portfolioProjectsRegistry || [];
    let renderedCount = 0;

    registry.forEach((slug) => {
      const project = window.portfolioProjects[slug];
      if (!project) return;
      renderedCount++;

      const titleKey = `project.${slug}.title`;
      const currentTranslation = window.translations && window.translations[window.currentLang || 'en'];
      const translatedTitle = (currentTranslation && currentTranslation[titleKey]) || project.title;

      const isPlaceholder = !!(currentTranslation && currentTranslation[titleKey]);

      const card = document.createElement("a");
      if (isPlaceholder) {
        card.href = "javascript:void(0)";
        card.style.cursor = "default";
      } else {
        card.href = `#project/${slug}`;
      }
      card.className = "project-card";
      const imgPath = `projects/${slug}/${project.images[0] || 'image1.webp'}`;
      
      card.innerHTML = `
        <div class="project-card-image-wrap">
          <img src="${escapeHtml(imgPath)}" alt="${escapeHtml(translatedTitle)}" class="project-card-image" loading="lazy">
        </div>
        <div class="project-card-caption">
          ${escapeHtml(project.year)} | ${escapeHtml(translatedTitle.toLowerCase())}
        </div>
      `;
      gridContainer.appendChild(card);
    });

    if (renderedCount === 0) {
      gridContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 5rem 0; font-size: 11px; color: #777;">no projects found in registry.</div>`;
    }
  }

  function updateActiveFilterUI() {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    const hash = window.location.hash || "#home";

    if (hash === "#home" || hash === "" || hash.startsWith("#project/")) {
      document.getElementById("nav-home")?.classList.add("active");
    } else if (hash === "#about") {
      document.getElementById("nav-about")?.classList.add("active");
    } else if (hash === "#contact") {
      document.getElementById("nav-contact")?.classList.add("active");
    }
  }

  function router() {
    const hash = window.location.hash || "#home";
    const views = [homeView, aboutView, contactView, detailView];

    // Always clean up project detail when navigating away
    if (!hash.startsWith("#project/")) {
      cleanupProjectDetail();
    }

    views.forEach(v => { if (v) { v.style.display = "none"; v.classList.remove("active"); } });

    if (hash === "#home" || hash === "") {
      homeView.style.display = "block";
      setTimeout(() => homeView.classList.add("active"), 10);
      renderProjectsGrid();
    } else if (hash === "#about") {
      aboutView.style.display = "block";
      setTimeout(() => aboutView.classList.add("active"), 10);
    } else if (hash === "#contact") {
      contactView.style.display = "block";
      setTimeout(() => contactView.classList.add("active"), 10);
    } else if (hash.startsWith("#project/")) {
      const slug = hash.replace("#project/", "");
      if (renderProjectDetail(slug)) {
        detailView.style.display = "flex";
        setTimeout(() => detailView.classList.add("active"), 10);
      } else {
        window.location.hash = "home";
      }
    }
    updateActiveFilterUI();
  }

  let scrollAnimFrame = null;
  let detailAbortController = null;
  let detailObserver = null;

  function cleanupProjectDetail() {
    // Cancel any running scroll animation
    if (scrollAnimFrame) {
      cancelAnimationFrame(scrollAnimFrame);
      scrollAnimFrame = null;
    }
    // Abort all event listeners from previous project
    if (detailAbortController) {
      try { detailAbortController.abort(); } catch (e) { /* Safari <15 fallback */ }
      detailAbortController = null;
    }
    // Disconnect IntersectionObserver
    if (detailObserver) {
      detailObserver.disconnect();
      detailObserver = null;
    }
    // Clear scroller DOM and release image memory
    const scroller = document.getElementById("project-scroller");
    if (scroller) {
      // Explicitly clear image src to help mobile browsers release memory
      const imgs = scroller.querySelectorAll('img');
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].removeAttribute('src');
        imgs[i].removeAttribute('srcset');
      }
      scroller.innerHTML = "";
      // Reset the scroll position for Safari (Safari caches scroll position)
      scroller.scrollTop = 0;
      scroller.scrollLeft = 0;
    }
  }

  function renderProjectDetail(slug) {
    const project = window.portfolioProjects[slug];
    if (!project) return false;

    // Clean up any previous project detail state
    cleanupProjectDetail();

    const scroller = document.getElementById("project-scroller");
    const isMobile = window.innerWidth <= 900;

    // Create a new AbortController for this project's listeners
    detailAbortController = new AbortController();
    const signal = detailAbortController.signal;

    // Use DocumentFragment for batch DOM insertion (reduces reflows)
    const fragment = document.createDocumentFragment();

    project.images.forEach((imgName) => {
      const wrapper = document.createElement("div");
      wrapper.className = "project-image-wrapper";
      
      // Default placeholder aspect ratio to reserve layout space and prevent collapsing
      wrapper.style.aspectRatio = "16/9";
      
      const skeleton = document.createElement("div");
      skeleton.className = "skeleton-loader";
      wrapper.appendChild(skeleton);

      const img = document.createElement("img");
      img.className = "project-detail-image";
      img.setAttribute('decoding', 'async');
      img.setAttribute('data-src', `projects/${slug}/${imgName}`);
      
      // Lock aspect ratio on both wrapper and image once the image loads for the first time
      img.addEventListener('load', () => {
        if (img.src.startsWith('data:')) return; // ignore blank data URLs
        
        if (img.naturalWidth && img.naturalHeight && wrapper.dataset.ratioSet !== "true") {
          const ratio = `${img.naturalWidth} / ${img.naturalHeight}`;
          wrapper.style.aspectRatio = ratio;
          img.style.aspectRatio = ratio;
          wrapper.dataset.ratioSet = "true";
        }
        skeleton.style.display = "none";
      });

      wrapper.appendChild(img);
      fragment.appendChild(wrapper);
    });

    // Single DOM insertion for all wrappers
    scroller.appendChild(fragment);

    scroller.scrollLeft = 0;
    scroller.scrollTop = 0;

    // Viewport image virtualization: load src only when entry is near, unload when far
    const observerOptions = {
      root: isMobile ? null : scroller,
      rootMargin: isMobile ? '120% 0px 120% 0px' : '0px 120% 0px 120%',
      threshold: 0.01
    };

    detailObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wrapper = entry.target;
        const img = wrapper.querySelector('.project-detail-image');
        if (!img) return;

        if (entry.isIntersecting) {
          const targetSrc = img.getAttribute('data-src');
          if (targetSrc && img.src !== targetSrc) {
            img.src = targetSrc;
          }
        } else {
          // Unload only if ratio is locked on wrapper (prevents content shifting/collapsing)
          // Set to a 1x1 transparent blank gif instead of removing src to preserve layout sizing
          if (wrapper.dataset.ratioSet === "true" && img.src && !img.src.startsWith('data:')) {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          }
        }
      });
    }, observerOptions);

    scroller.querySelectorAll('.project-image-wrapper').forEach(wrapper => {
      detailObserver.observe(wrapper);
    });

    let targetScroll = 0;
    
    const stopAnim = () => {
      if (scrollAnimFrame) {
        cancelAnimationFrame(scrollAnimFrame);
        scrollAnimFrame = null;
      }
    };

    stopAnim();

    // Only attach scroll physics on desktop (not needed on mobile vertical layout)
    if (!isMobile) {
      scroller.addEventListener('mousedown', stopAnim, { signal });
      scroller.addEventListener('pointerdown', stopAnim, { signal });

      // Sync targetScroll when user scrolls natively (trackpad, drag, etc.)
      scroller.addEventListener('scroll', function() {
        if (!scrollAnimFrame) {
          targetScroll = scroller.scrollLeft;
        }
      }, { signal, passive: true });
      
      // Smooth inertial scroll translation for standard mouse wheels
      scroller.addEventListener('wheel', function(e) {
        // Bypass completely if scrolling horizontally natively (trackpads/swipes)
        if (Math.abs(e.deltaX) > 0.5) {
          stopAnim();
          return;
        }

        // Only intercept vertical scroll wheel events to translate them to horizontal
        if (Math.abs(e.deltaY) > 0.5) {
          const getLiveMaxScroll = () => scroller.scrollWidth - scroller.clientWidth;
          const maxScroll = getLiveMaxScroll();
          if (maxScroll <= 0) return;

          e.preventDefault();
          
          if (!scrollAnimFrame) {
            targetScroll = scroller.scrollLeft;
          }
          
          targetScroll += e.deltaY * 0.8;
          targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
          
          const animate = () => {
            const current = scroller.scrollLeft;
            const liveMax = getLiveMaxScroll();
            // Re-clamp target scroll against live width (prevents locking as images load)
            targetScroll = Math.max(0, Math.min(targetScroll, liveMax));
            const diff = targetScroll - current;
            
            if (Math.abs(diff) > 0.5) {
              scroller.scrollLeft = current + diff * 0.12;
              scrollAnimFrame = requestAnimationFrame(animate);
            } else {
              scroller.scrollLeft = targetScroll;
              scrollAnimFrame = null;
            }
          };
          
          if (!scrollAnimFrame) {
            scrollAnimFrame = requestAnimationFrame(animate);
          }
        }
      }, { signal, passive: false });
    }

    return true;
  }

  gridContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 5rem 0; font-size: 11px; color: #777;">loading portfolio...</div>`;
  loadProjectsData().then(() => {
    router();
    window.addEventListener("hashchange", router);
  });

  // ==========================================================================
  // SAFE STORAGE WORKAROUND FOR CORS / FILE:// PROTOCOLS
  // ==========================================================================
  const safeStorage = {
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn("Antigravity SafeStorage: Access to localStorage denied in this environment.", e);
        return null;
      }
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn("Antigravity SafeStorage: Access to localStorage denied in this environment.", e);
      }
    }
  };

  // ==========================================================================
  // MULTI-LANGUAGE (i18n) LOGIC
  // ==========================================================================
  
  function applyLanguage(lang) {
    const strings = window.translations && window.translations[lang];
    if (!strings) return;
    
    // Apply all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key] !== undefined) {
        el.textContent = strings[key];
      }
    });

    // Special: split comma-separated skills into dynamic pills
    document.querySelectorAll('[data-skills-pills]').forEach(el => {
      const key = el.getAttribute('data-skills-pills');
      if (strings[key] !== undefined) {
        el.innerHTML = '';
        strings[key].split(',').forEach(skill => {
          const pill = document.createElement('span');
          pill.className = 'skill-pill';
          pill.textContent = skill.trim();
          el.appendChild(pill);
        });
      }
    });
    
    // Special: theme toggle depends on current dark mode state
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const isDark = document.body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? strings['theme.light'] : strings['theme.dark'];
    }
    
    // Update active lang indicator
    document.querySelectorAll('.lang-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-lang') === lang);
    });
    
    // Persist language safely
    safeStorage.setItem('lang', lang);
    window.currentLang = lang;

    // Re-render project grid to update localized project titles
    const homeView = document.getElementById("home-view");
    if (homeView && homeView.style.display !== "none") {
      renderProjectsGrid();
    }
  }

  // Language selector event listeners
  document.querySelectorAll('.lang-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      applyLanguage(link.getAttribute('data-lang'));
    });
  });

  // ==========================================================================
  // DARK MODE LOGIC - DEFAULT IS DARK
  // ==========================================================================
  
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const savedTheme = safeStorage.getItem("theme");
    
    // Default to dark mode; only go light if explicitly saved as "light"
    if (savedTheme === "light") {
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
    }
    
    themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      if (isDark) {
        safeStorage.setItem("theme", "dark");
        themeToggle.textContent = window.translations 
          ? window.translations[window.currentLang || 'en']['theme.light'] 
          : "light mode";
      } else {
        safeStorage.setItem("theme", "light");
        themeToggle.textContent = window.translations 
          ? window.translations[window.currentLang || 'en']['theme.dark'] 
          : "dark mode";
      }
    });
  }

  // Initialize language (depends on dark-mode class being set first)
  const savedLang = safeStorage.getItem('lang') || 'en';
  applyLanguage(savedLang);
});
