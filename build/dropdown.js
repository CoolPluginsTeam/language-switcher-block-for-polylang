/**
 * Custom Dropdown functionality for Language Switcher Block
 * Handles dropdown interactions and accessibility
 */
(function() {
    'use strict';
    
    /**
     * Detect if we are in the editor context
     */
    function isInEditor() {
        try {
            // Check if in iframe (ServerSideRender)
            if (window.self !== window.top) {
                return true;
            }
            // Check for editor-specific classes
            if (document.body.classList.contains('block-editor-page') ||
                document.body.classList.contains('wp-admin')) {
                return true;
            }
            // Check for editor elements
            if (document.querySelector('.block-editor') || 
                document.querySelector('.edit-post-visual-editor')) {
                return true;
            }
        } catch (e) {
            // If we cannot access top window, assume we are in iframe/editor
            return true;
        }
        return false;
    }
    
    /**
     * Initialize dropdown functionality
     */
    function initDropdown(container) {
        var button = container.querySelector('.lsbg-dropdown-button');
        var menu = container.querySelector('.lsbg-dropdown-menu');
        
        if (!button || !menu) {
            return;
        }
        
        var inEditor = isInEditor();
        
        /**
         * Toggle dropdown menu
         */
        function toggleDropdown() {
            var isExpanded = button.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }
        
        /**
         * Open dropdown menu
         */
        function openDropdown() {
            button.setAttribute('aria-expanded', 'true');
            menu.style.display = 'block';
            
            // Focus first item
            var firstItem = menu.querySelector('a');
            if (firstItem) {
                firstItem.focus();
            }
        }
        
        /**
         * Close dropdown menu
         */
        function closeDropdown() {
            button.setAttribute('aria-expanded', 'false');
            menu.style.display = 'none';
        }
        
        // Button click handler
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });
        
        // Keyboard navigation
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                openDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });
        
        // Menu keyboard navigation
        menu.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDropdown();
                button.focus();
            } else if (e.key === 'Tab') {
                closeDropdown();
            }
        });
        
        // Prevent link navigation in editor
        if (inEditor) {
            var links = menu.querySelectorAll('a');
            links.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeDropdown();
                });
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Prevent menu from closing when clicking inside
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    /**
     * Initialize all dropdowns on the page
     */
    function initAllDropdowns() {
        var dropdowns = document.querySelectorAll('.lsbg-dropdown-container');
        dropdowns.forEach(function(dropdown) {
            // Check if already initialized
            if (dropdown.hasAttribute('data-lsbg-initialized')) {
                return;
            }
            dropdown.setAttribute('data-lsbg-initialized', 'true');
            initDropdown(dropdown);
        });
    }
    
    /**
     * Initialize dropdowns in all contexts (main window and iframes)
     */
    function initAllContexts() {
        // Initialize in main window
        initAllDropdowns();
        
        // Initialize in iframes (for Gutenberg editor ServerSideRender)
        var iframes = document.querySelectorAll('iframe');
        iframes.forEach(function(iframe) {
            try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    var iframeDropdowns = iframeDoc.querySelectorAll('.lsbg-dropdown-container');
                    iframeDropdowns.forEach(function(dropdown) {
                        // Check if already initialized
                        if (dropdown.hasAttribute('data-lsbg-initialized')) {
                            return;
                        }
                        dropdown.setAttribute('data-lsbg-initialized', 'true');
                        initDropdown(dropdown);
                    });
                }
            } catch (e) {
                // Cross-origin iframe, skip
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllContexts);
    } else {
        initAllContexts();
    }
    
    // Re-initialize periodically for editor (ServerSideRender updates)
    var isEditor = document.body.classList.contains('block-editor-page') || 
                   document.body.classList.contains('wp-admin');
    
    if (isEditor) {
        // Use MutationObserver to detect when new dropdowns are added
        var observer = new MutationObserver(function(mutations) {
            var shouldInit = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && node.classList.contains('lsbg-dropdown-container')) {
                                shouldInit = true;
                            } else if (node.querySelector && node.querySelector('.lsbg-dropdown-container')) {
                                shouldInit = true;
                            }
                        }
                    });
                }
            });
            if (shouldInit) {
                setTimeout(initAllContexts, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Also check periodically in editor
    if (isEditor) {
        setInterval(initAllContexts, 1000);
    }
    
    // Re-initialize on dynamic content changes
    if (typeof window.wp !== 'undefined' && window.wp.hooks) {
        window.wp.hooks.addAction('lsbg_dropdown_init', 'lsbg', initAllContexts);
    }
    
})();

