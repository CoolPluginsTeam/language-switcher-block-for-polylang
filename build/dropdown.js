/**
 * Custom Dropdown functionality for Language Switcher Block
 * Handles dropdown interactions and accessibility
 */
(function() {
    'use strict';
    
    /**
     * Detect if we are in the editor context
     *
     * @return {boolean} True if in editor context
     */
    function isInEditor() {
        try {
            if (window.self !== window.top) {
                return true;
            }
            if (document.body.classList.contains('block-editor-page') ||
                document.body.classList.contains('wp-admin')) {
                return true;
            }
            if (document.querySelector('.block-editor') || 
                document.querySelector('.edit-post-visual-editor')) {
                return true;
            }
        } catch (e) {
            return true;
        }
        return false;
    }
    
    /**
     * Initialize dropdown functionality
     *
     * @param {HTMLElement} container - Dropdown container element
     */
    function initDropdown(container) {
        var button = container.querySelector('.lsep-lang-item');
        var menu = container.querySelector('.lsbg-dropdown-menu');
        
        if (!button || !menu) {
            return;
        }
        
        var inEditor = isInEditor();
        
        function closeDropdown() {
            button.setAttribute('aria-expanded', 'false');
            menu.style.display = 'none';
        }
        
        function openDropdown() {
            button.setAttribute('aria-expanded', 'true');
            menu.style.display = 'block';
        }
        
        function toggleDropdown() {
            var isExpanded = button.getAttribute('aria-expanded') === 'true';
            isExpanded ? closeDropdown() : openDropdown();
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
            menu.querySelectorAll('a').forEach(function(link) {
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
        document.querySelectorAll('.lsbg-dropdown-container').forEach(function(dropdown) {
            if (!dropdown.hasAttribute('data-lsbg-initialized')) {
                dropdown.setAttribute('data-lsbg-initialized', 'true');
                initDropdown(dropdown);
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllDropdowns);
    } else {
        initAllDropdowns();
    }
    
    // Re-initialize for editor (ServerSideRender updates)
    if (document.body.classList.contains('block-editor-page') || 
        document.body.classList.contains('wp-admin')) {
        
        var observer = new MutationObserver(function(mutations) {
            var shouldInit = false;
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && 
                        (node.classList.contains('lsbg-dropdown-container') || 
                         node.querySelector('.lsbg-dropdown-container'))) {
                        shouldInit = true;
                    }
                });
            });
            if (shouldInit) {
                setTimeout(initAllDropdowns, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
})();

