(function (blocks, element, blockEditor, components, i18n, serverSideRender) {
    'use strict';

    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var BlockControls = blockEditor.BlockControls;
    var AlignmentToolbar = blockEditor.AlignmentToolbar;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    var TextControl = components.TextControl;
    var Button = components.Button;
    var TabPanel = components.TabPanel;
    var BoxControl = components.__experimentalBoxControl || components.BoxControl;
    var RangeControl = components.RangeControl;
    var ColorPalette = components.ColorPalette;
    var Notice = components.Notice;
    var ServerSideRender = serverSideRender;
    var __ = i18n.__;
    var useState = element.useState;
    var useEffect = element.useEffect;

    // Get settings from localized script
    var settings = window.lsbgBlockSettings || { options: {}, languages: [], polylangActive: false };

    registerBlockType('lsbg/language-switcher', {
        title: __('Language Switcher block for Polylang', 'language-switcher-block-for-polylang'),
        description: __('Display a language switcher for Polylang', 'language-switcher-block-for-polylang'),
        category: 'widgets',
        icon: 'translation',
        keywords: [
            __('language', 'language-switcher-block-for-polylang'),
            __('polylang', 'language-switcher-block-for-polylang'),
            __('switcher', 'language-switcher-block-for-polylang')
        ],
        attributes: {
            show_names: {
                type: 'boolean',
                default: true
            },
            show_flags: {
                type: 'boolean',
                default: false
            },
            show_language_codes: {
                type: 'boolean',
                default: false
            },
            hide_current: {
                type: 'boolean',
                default: false
            },
            hide_if_no_translation: {
                type: 'boolean',
                default: false
            },
            dropdown: {
                type: 'string',
                default: 'vertical'
            },
            marginTop: {
                type: 'number',
                default: 0
            },
            marginRight: {
                type: 'number',
                default: 0
            },
            marginBottom: {
                type: 'number',
                default: 0
            },
            marginLeft: {
                type: 'number',
                default: 0
            },
            paddingTop: {
                type: 'number',
                default: 0
            },
            paddingRight: {
                type: 'number',
                default: 0
            },
            paddingBottom: {
                type: 'number',
                default: 0
            },
            paddingLeft: {
                type: 'number',
                default: 0
            },
            borderColor: {
                type: 'string',
                default: ''
            },
            borderStyle: {
                type: 'string',
                default: 'solid'
            },
            borderWidth: {
                type: 'string',
                default: '0px'
            },
            borderWidthTop: {
                type: 'number',
                default: 0
            },
            borderWidthRight: {
                type: 'number',
                default: 0
            },
            borderWidthBottom: {
                type: 'number',
                default: 0
            },
            borderWidthLeft: {
                type: 'number',
                default: 0
            },
            borderRadiusTopLeft: {
                type: 'number',
                default: 0
            },
            borderRadiusTopRight: {
                type: 'number',
                default: 0
            },
            borderRadiusBottomRight: {
                type: 'number',
                default: 0
            },
            borderRadiusBottomLeft: {
                type: 'number',
                default: 0
            },
            flagRatio: {
                type: 'string',
                default: '4/3'
            },
            flagWidth: {
                type: 'number',
                default: 24
            },
            flagRadius: {
                type: 'number',
                default: 0
            },
            fontSize: {
                type: 'string',
                default: ''
            },
            fontFamily: {
                type: 'string',
                default: ''
            },
            textColor: {
                type: 'string',
                default: ''
            },
            backgroundColor: {
                type: 'string',
                default: ''
            },
            textTransform: {
                type: 'string',
                default: 'none'
            },
            alignment: {
                type: 'string',
                default: 'left'
            },
            customLanguages: {
                type: 'array',
                default: []
            },
            languageSource: {
                type: 'string',
                default: 'polylang'
            }
        },
        supports: {
            html: false,
            customClassName: true,
            className: true
        },

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            // Notice for invalid custom language selections (e.g. duplicates)
            var duplicateLanguageNoticeState = useState(null);
            var duplicateLanguageNotice = duplicateLanguageNoticeState[0];
            var setDuplicateLanguageNotice = duplicateLanguageNoticeState[1];
            
            // State to track language source changes
            var languageSourceState = useState(attributes.languageSource || 'polylang');
            var previousLanguageSource = languageSourceState[0];
            var setPreviousLanguageSource = languageSourceState[1];
            
            var showNoticeState = useState(false);
            var showNotice = showNoticeState[0];
            var setShowNotice = showNoticeState[1];
            
            // Helper function to validate URL
            var isValidUrl = function(url) {
                if (!url || url.trim() === '') {
                    return false; // Empty URLs are not valid
                }
                // Check if it's a valid absolute URL (http:// or https://)
                var absoluteUrlPattern = /^https?:\/\/.+/i;
                // Check if it's a valid relative URL (starts with /)
                var relativeUrlPattern = /^\/[^\s]*/;
                
                return absoluteUrlPattern.test(url) || relativeUrlPattern.test(url);
            };

            // Set languageSource to 'default' when Polylang is not active
            if (!settings.polylangActive && attributes.languageSource === 'polylang') {
                setAttributes({ 
                    languageSource: 'default'
                });
            }

            // Auto-populate English when using custom languages (either Polylang is not active OR languageSource is 'default')
            var useCustomLanguages = !settings.polylangActive || attributes.languageSource === 'default';
            if (useCustomLanguages && (!attributes.customLanguages || attributes.customLanguages.length === 0)) {
                setAttributes({ 
                    customLanguages: [
                        { 
                            language: 'en_US',
                            url: ''
                        }
                    ] 
                });
            }

            // Helper function to create spacing control using BoxControl
            var createSpacingControl = function(label, type) {
                if (!BoxControl) {
                    return null;
                }

                var topAttr = type + 'Top';
                var rightAttr = type + 'Right';
                var bottomAttr = type + 'Bottom';
                var leftAttr = type + 'Left';

                // Create value object from individual attributes
                var values = {
                    top: (attributes[topAttr] || 0) + 'px',
                    right: (attributes[rightAttr] || 0) + 'px',
                    bottom: (attributes[bottomAttr] || 0) + 'px',
                    left: (attributes[leftAttr] || 0) + 'px'
                };

                return el(BoxControl, {
                    key: type,
                    label: label,
                    values: values,
                    onChange: function(newValues) {
                        var newAttrs = {};
                        if (newValues) {
                            newAttrs[topAttr] = parseInt(newValues.top) || 0;
                            newAttrs[rightAttr] = parseInt(newValues.right) || 0;
                            newAttrs[bottomAttr] = parseInt(newValues.bottom) || 0;
                            newAttrs[leftAttr] = parseInt(newValues.left) || 0;
                        }
                        setAttributes(newAttrs);
                    }
                });
            };

            // Helper function to create typography controls
            var createTypographyControls = function() {
                var controls = [];

                // Font Size Control
                controls.push(
                    el(RangeControl, {
                        key: 'fontSize',
                        label: __('Font Size', 'language-switcher-block-for-polylang'),
                        value: parseInt(attributes.fontSize) || 16,
                        onChange: function(value) {
                            setAttributes({ fontSize: value + 'px' });
                        },
                        min: 10,
                        max: 72,
                        step: 1,
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                );

                // Font Family Control
                controls.push(
                    el(SelectControl, {
                        key: 'fontFamily',
                        label: __('Font Family', 'language-switcher-block-for-polylang'),
                        value: attributes.fontFamily || '',
                        options: [
                            { label: __('Default', 'language-switcher-block-for-polylang'), value: '' },
                            { label: 'Arial', value: 'Arial, sans-serif' },
                            { label: 'Helvetica', value: 'Helvetica, sans-serif' },
                            { label: 'Times New Roman', value: '"Times New Roman", serif' },
                            { label: 'Georgia', value: 'Georgia, serif' },
                            { label: 'Courier New', value: '"Courier New", monospace' },
                            { label: 'Verdana', value: 'Verdana, sans-serif' },
                            { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
                            { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
                            { label: 'Impact', value: 'Impact, sans-serif' }
                        ],
                        onChange: function(value) {
                            setAttributes({ fontFamily: value });
                        },
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                );

                // Text Transform Control
                controls.push(
                    el(SelectControl, {
                        key: 'textTransform',
                        label: __('Text Transform', 'language-switcher-block-for-polylang'),
                        value: attributes.textTransform || 'none',
                        options: [
                            { label: __('None', 'language-switcher-block-for-polylang'), value: 'none' },
                            { label: __('Uppercase', 'language-switcher-block-for-polylang'), value: 'uppercase' },
                            { label: __('Lowercase', 'language-switcher-block-for-polylang'), value: 'lowercase' },
                            { label: __('Capitalize', 'language-switcher-block-for-polylang'), value: 'capitalize' }
                        ],
                        onChange: function(value) {
                            setAttributes({ textTransform: value });
                        },
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                );

                // Alignment Control (Left / Center / Right)
                controls.push(
                    el(SelectControl, {
                        key: 'alignment',
                        label: __('Alignment', 'language-switcher-block-for-polylang'),
                        value: attributes.alignment || 'left',
                        options: [
                            { label: __('Left', 'language-switcher-block-for-polylang'), value: 'left' },
                            { label: __('Center', 'language-switcher-block-for-polylang'), value: 'center' },
                            { label: __('Right', 'language-switcher-block-for-polylang'), value: 'right' }
                        ],
                        onChange: function(value) {
                            setAttributes({ alignment: value });
                        },
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                );

                // Text Color Control
                controls.push(
                    el('div', {
                        key: 'textColorWrapper',
                        style: { marginBottom: '16px' }
                    },
                        el('label', {
                            style: {
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textTransform: 'uppercase'
                            }
                        }, __('Text Color', 'language-switcher-block-for-polylang')),
                        el(ColorPalette, {
                            value: attributes.textColor,
                            onChange: function(color) {
                                setAttributes({ textColor: color });
                            },
                            clearable: true
                        })
                    )
                );

                // Background Color Control
                controls.push(
                    el('div', {
                        key: 'backgroundColorWrapper',
                        style: { marginBottom: '16px' }
                    },
                        el('label', {
                            style: {
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textTransform: 'uppercase'
                            }
                        }, __('Background Color', 'language-switcher-block-for-polylang')),
                        el(ColorPalette, {
                            value: attributes.backgroundColor,
                            onChange: function(color) {
                                setAttributes({ backgroundColor: color });
                            },
                            clearable: true
                        })
                    )
                );

                return controls;
            };

            // Helper function to create border controls
            var createBorderControls = function() {
                var controls = [];

                // Border Color Control
                controls.push(
                    el('div', {
                        key: 'borderColorWrapper',
                        style: { marginBottom: '16px' }
                    },
                        el('label', {
                            style: {
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '11px',
                                fontWeight: '500',
                                textTransform: 'uppercase'
                            }
                        }, __('Border Color', 'language-switcher-block-for-polylang')),
                        el(ColorPalette, {
                            value: attributes.borderColor,
                            onChange: function(color) {
                                setAttributes({ borderColor: color });
                            },
                            clearable: true
                        })
                    )
                );

                // Border Style Control
                controls.push(
                    el(SelectControl, {
                        key: 'borderStyle',
                        label: __('Border Style', 'language-switcher-block-for-polylang'),
                        value: attributes.borderStyle || 'solid',
                        options: [
                            { label: __('Solid', 'language-switcher-block-for-polylang'), value: 'solid' },
                            { label: __('Dashed', 'language-switcher-block-for-polylang'), value: 'dashed' },
                            { label: __('Dotted', 'language-switcher-block-for-polylang'), value: 'dotted' },
                            { label: __('Double', 'language-switcher-block-for-polylang'), value: 'double' },
                            { label: __('None', 'language-switcher-block-for-polylang'), value: 'none' }
                        ],
                        onChange: function(value) {
                            setAttributes({ borderStyle: value });
                        },
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                );

                // Border Width Control using BoxControl
                if (BoxControl) {
                    var borderWidthValues = {
                        top: (attributes.borderWidthTop || 0) + 'px',
                        right: (attributes.borderWidthRight || 0) + 'px',
                        bottom: (attributes.borderWidthBottom || 0) + 'px',
                        left: (attributes.borderWidthLeft || 0) + 'px'
                    };

                    controls.push(
                        el(BoxControl, {
                            key: 'borderWidth',
                            label: __('Border Width', 'language-switcher-block-for-polylang'),
                            values: borderWidthValues,
                            onChange: function(newValues) {
                                var newAttrs = {};
                                if (newValues) {
                                    newAttrs.borderWidthTop = parseInt(newValues.top) || 0;
                                    newAttrs.borderWidthRight = parseInt(newValues.right) || 0;
                                    newAttrs.borderWidthBottom = parseInt(newValues.bottom) || 0;
                                    newAttrs.borderWidthLeft = parseInt(newValues.left) || 0;
                                }
                                setAttributes(newAttrs);
                            }
                        })
                    );
                }

                // Border Radius Control using BoxControl
                if (BoxControl) {
                    var borderRadiusValues = {
                        top: (attributes.borderRadiusTopLeft || 0) + 'px',
                        right: (attributes.borderRadiusTopRight || 0) + 'px',
                        bottom: (attributes.borderRadiusBottomRight || 0) + 'px',
                        left: (attributes.borderRadiusBottomLeft || 0) + 'px'
                    };

                    controls.push(
                        el(BoxControl, {
                            key: 'borderRadius',
                            label: __('Border Radius', 'language-switcher-block-for-polylang'),
                            values: borderRadiusValues,
                            onChange: function(newValues) {
                                var newAttrs = {};
                                if (newValues) {
                                    newAttrs.borderRadiusTopLeft = parseInt(newValues.top) || 0;
                                    newAttrs.borderRadiusTopRight = parseInt(newValues.right) || 0;
                                    newAttrs.borderRadiusBottomRight = parseInt(newValues.bottom) || 0;
                                    newAttrs.borderRadiusBottomLeft = parseInt(newValues.left) || 0;
                                }
                                setAttributes(newAttrs);
                            }
                        })
                    );
                }

                return controls;
            };

            // Helper function to create flag controls
            var createFlagControls = function() {
                return [
                    el(SelectControl, {
                        key: 'flagRatio',
                        label: __('Flag Ratio', 'language-switcher-block-for-polylang'),
                        value: attributes.flagRatio || '4/3',
                        options: [
                            { label: '4:3', value: '4/3' },
                            { label: '1:1', value: '1/1' }
                        ],
                        onChange: function(value) {
                            setAttributes({ flagRatio: value });
                        },
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        key: 'flagWidth',
                        label: __('Flag Width', 'language-switcher-block-for-polylang'),
                        value: attributes.flagWidth || 24,
                        onChange: function(value) {
                            setAttributes({ flagWidth: value });
                        },
                        min: 0,
                        max: 100,
                        step: 1,
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        key: 'flagRadius',
                        label: __('Flag Radius', 'language-switcher-block-for-polylang'),
                        value: attributes.flagRadius || 0,
                        onChange: function(value) {
                            setAttributes({ flagRadius: value });
                        },
                        min: 0,
                        max: 100,
                        step: 1,
                        __next40pxDefaultSize: true,
                        __nextHasNoMarginBottom: true
                    })
                ];
            };

            // Create controls for each option
            var controls = [];
            var defaultTabControls = []; // Controls for Default tab (excludes hide_current and hide_if_no_translation)
            
            for (var option in settings.options) {
                if (settings.options.hasOwnProperty(option)) {
                    (function (opt) {
                        var optionData = settings.options[opt];
                        
                        // Skip these options for default tab controls
                        var excludeFromDefault = opt === 'hide_current' || opt === 'hide_if_no_translation';
                        
                        // Check if this is a select control
                        if (optionData.type === 'select' && optionData.options) {
                            // Convert options object to array for SelectControl
                            var selectOptions = [];
                            for (var key in optionData.options) {
                                if (optionData.options.hasOwnProperty(key)) {
                                    selectOptions.push({
                                        label: optionData.options[key],
                                        value: key
                                    });
                                }
                            }
                            
                            var selectControl = el(SelectControl, {
                                key: opt,
                                label: optionData.label,
                                value: attributes[opt],
                                options: selectOptions,
                                onChange: function (value) {
                                    var newAttrs = {};
                                    newAttrs[opt] = value;
                                    setAttributes(newAttrs);
                                },
                                __next40pxDefaultSize: true,
                                __nextHasNoMarginBottom: true
                            });
                            
                            controls.push(selectControl);
                            if (!excludeFromDefault) {
                                defaultTabControls.push(selectControl);
                            }
                        } else {
                            // Default to ToggleControl for boolean options
                            var toggleControl = el(ToggleControl, {
                                key: opt,
                                label: optionData.label,
                                checked: attributes[opt],
                                onChange: function (value) {
                                    var newAttrs = {};
                                    newAttrs[opt] = value;
                                    setAttributes(newAttrs);
                                },
                                __nextHasNoMarginBottom: true
                            });
                            
                            controls.push(toggleControl);
                            if (!excludeFromDefault) {
                                defaultTabControls.push(toggleControl);
                            }
                        }
                    })(option);
                }
            }

            // Build tabs array
            var tabsArray = [];

            // If Polylang is active, show "Language Source" tab with dropdown
            // If not active, show "Default" tab
            if (settings.polylangActive) {
                tabsArray.push({
                    name: 'language-source',
                    title: __('Language Source', 'language-switcher-block-for-polylang'),
                    className: 'lsbg-language-source-tab'
                });
            } else {
                tabsArray.push({
                    name: 'default',
                    title: __('Default', 'language-switcher-block-for-polylang'),
                    className: 'lsbg-default-tab'
                });
            }

            // Always add Styles tab
            tabsArray.push({
                name: 'styles',
                title: __('Styles', 'language-switcher-block-for-polylang'),
                className: 'lsbg-styles-tab'
            });

            // Set initial tab
            var initialTab = settings.polylangActive ? 'language-source' : 'default';

            return el(
                'div',
                {},
                el(
                    BlockControls,
                    {},
                    AlignmentToolbar ? el(AlignmentToolbar, {
                        value: attributes.alignment || 'left',
                        onChange: function (nextAlign) {
                            // AlignmentToolbar can return undefined when cleared.
                            var value = nextAlign || 'left';
                            // Allow only left/center/right for this block.
                            if (value !== 'left' && value !== 'center' && value !== 'right') {
                                value = 'left';
                            }
                            setAttributes({ alignment: value });
                        }
                    }) : null
                ),
                el(
                    InspectorControls,
                    {},
                    el(
                        TabPanel,
                        {
                            className: 'lsbg-inspector-tabs',
                            activeClass: 'active-tab',
                            initialTabName: initialTab,
                            tabs: tabsArray
                        },
                        function (tab) {
                            // Helper function to render default language settings
                            var renderDefaultSettings = function() {
                                var customLanguages = attributes.customLanguages || [];
                                var selectedLanguages = customLanguages
                                    .map(function (l) { return l && l.language ? l.language : ''; })
                                    .filter(function (v) { return !!v; });
                                
                                var hasValidationErrors = false;
                                var repeaterItems = customLanguages.map(function(item, index) {
                                    var currentValue = item.language || '';
                                    var currentUrl = item.url || '';
                                    var isUrlValid = isValidUrl(currentUrl);
                                    
                                    if (!isUrlValid) {
                                        hasValidationErrors = true;
                                    }
                                    
                                    var availableLanguageOptions = (settings.languages || []).filter(function (opt) {
                                        // Keep the currently selected option visible, but prevent selecting a language twice.
                                        if (!opt || !opt.value) return true;
                                        return opt.value === currentValue || selectedLanguages.indexOf(opt.value) === -1;
                                    });
                                    return el(
                                        'div',
                                        {
                                            key: index,
                                            style: {
                                                border: '1px solid #ddd',
                                                padding: '12px',
                                                marginBottom: '12px',
                                                borderRadius: '4px',
                                                backgroundColor: '#f9f9f9'
                                            }
                                        },
                                        el(SelectControl, {
                                            label: __('Language', 'language-switcher-block-for-polylang'),
                                            value: item.language || '',
                                            options: [
                                                { label: __('Select Language', 'language-switcher-block-for-polylang'), value: '' }
                                            ].concat(availableLanguageOptions),
                                            onChange: function(value) {
                                                // Prevent selecting the same language twice.
                                                var isDuplicate = value && customLanguages.some(function (l, idx) {
                                                    return idx !== index && l && l.language === value;
                                                });
                                                if (isDuplicate) {
                                                    setDuplicateLanguageNotice(__('This language is already added. Please choose another one.', 'language-switcher-block-for-polylang'));
                                                    return;
                                                }
                                                setDuplicateLanguageNotice(null);
                                                var newLanguages = customLanguages.slice();
                                                newLanguages[index].language = value;
                                                setAttributes({ customLanguages: newLanguages });
                                            },
                                            __next40pxDefaultSize: true,
                                            __nextHasNoMarginBottom: true
                                        }),
                                        el(TextControl, {
                                            label: __('Page URL', 'language-switcher-block-for-polylang'),
                                            value: item.url || '',
                                            onChange: function(value) {
                                                var newLanguages = customLanguages.slice();
                                                newLanguages[index].url = value;
                                                setAttributes({ customLanguages: newLanguages });
                                            },
                                            placeholder: 'https://example.com/page',
                                            help: !isUrlValid ? __('Please enter a valid URL', 'language-switcher-block-for-polylang') : '',
                                            className: !isUrlValid ? 'lsbg-url-error' : '',
                                            __next40pxDefaultSize: true,
                                            __nextHasNoMarginBottom: false
                                        }),
                                        el(Button, {
                                            isDestructive: true,
                                            isSmall: true,
                                            onClick: function() {
                                                var newLanguages = customLanguages.slice();
                                                newLanguages.splice(index, 1);
                                                setAttributes({ customLanguages: newLanguages });
                                            },
                                            style: { marginTop: '8px' }
                                        }, __('Remove', 'language-switcher-block-for-polylang'))
                                    );
                                });

                                return [
                                    el(
                                        PanelBody,
                                        {
                                            key: 'custom-languages',
                                            title: __('Custom Language Links', 'language-switcher-block-for-polylang'),
                                            initialOpen: true
                                        },
                                        duplicateLanguageNotice && el(Notice, {
                                            status: 'error',
                                            isDismissible: true,
                                            onRemove: function () {
                                                setDuplicateLanguageNotice(null);
                                            },
                                            style: { marginBottom: '12px' }
                                        }, duplicateLanguageNotice),
                                        el('div', {}, repeaterItems),
                                        el(Button, {
                                            isPrimary: true,
                                            disabled: hasValidationErrors,
                                            onClick: function() {
                                                setDuplicateLanguageNotice(null);
                                                var newLanguages = customLanguages.slice();
                                                newLanguages.push({ language: '', url: '' });
                                                setAttributes({ customLanguages: newLanguages });
                                            }
                                        }, __('Add Language', 'language-switcher-block-for-polylang'))
                                    ),
                                    el(
                                        PanelBody,
                                        {
                                            key: 'display-settings',
                                            title: __('Display Settings', 'language-switcher-block-for-polylang'),
                                            initialOpen: true
                                        },
                                        defaultTabControls
                                    )
                                ];
                            };

                            // Helper function to render Polylang settings
                            var renderPolylangSettings = function() {
                                return el(
                                    PanelBody,
                                    {
                                        title: __('Language Switcher Settings', 'language-switcher-block-for-polylang'),
                                        initialOpen: true
                                    },
                                    controls
                                );
                            };

                            if (tab.name === 'default') {
                                // When Polylang is not active, show default settings directly
                                return renderDefaultSettings();
                            }
                            
                            if (tab.name === 'language-source') {
                                // When Polylang is active, show dropdown and content based on selection
                                var sourceContent = [];
                                
                                // Add dropdown to select between Default and Polylang
                                sourceContent.push(
                                    el(
                                        PanelBody,
                                        {
                                            key: 'language-source-selector',
                                            title: __('Select Language Source', 'language-switcher-block-for-polylang'),
                                            initialOpen: true
                                        },
                                        el(SelectControl, {
                                            label: __('Language Source', 'language-switcher-block-for-polylang'),
                                            value: attributes.languageSource || 'polylang',
                                            options: [
                                                { label: __('Polylang', 'language-switcher-block-for-polylang'), value: 'polylang' },
                                                { label: __('Default (Custom Languages)', 'language-switcher-block-for-polylang'), value: 'default' }
                                            ],
                                            onChange: function(value) {
                                                // Check if the value has actually changed
                                                if (value !== previousLanguageSource) {
                                                    setPreviousLanguageSource(value);
                                                    setShowNotice(true);
                                                }
                                                setAttributes({ languageSource: value });
                                            },
                                            help: __('Choose whether to use Polylang languages or custom language links', 'language-switcher-block-for-polylang'),
                                            __next40pxDefaultSize: true,
                                            __nextHasNoMarginBottom: true
                                        }),
                                        showNotice && el(Notice, {
                                            status: 'warning',
                                            isDismissible: true,
                                            onRemove: function() {
                                                setShowNotice(false);
                                            },
                                            style: { marginTop: '12px' }
                                        }, 
                                        'You have switched the custom language source to ' + 
                                        (attributes.languageSource === 'polylang' ? 'Polylang' : 'Default (Custom Languages)') + 
                                        '. Kindly verify all changes before updating the page.'
                                        )
                                    )
                                );
                                
                                // Render content based on selected source
                                if (attributes.languageSource === 'default') {
                                    sourceContent = sourceContent.concat(renderDefaultSettings());
                                } else {
                                    sourceContent.push(renderPolylangSettings());
                                }
                                
                                return sourceContent;
                            }
                            
                            if (tab.name === 'styles') {
                                var stylePanels = [
                                    el(
                                        PanelBody,
                                        {
                                            key: 'typography',
                                            title: __('Typography', 'language-switcher-block-for-polylang'),
                                            initialOpen: true
                                        },
                                        createTypographyControls()
                                    ),
                                    el(
                                        PanelBody,
                                        {
                                            key: 'spacing',
                                            title: __('Spacing', 'language-switcher-block-for-polylang'),
                                            initialOpen: false
                                        },
                                        createSpacingControl(__('Margin', 'language-switcher-block-for-polylang'), 'margin'),
                                        createSpacingControl(__('Padding', 'language-switcher-block-for-polylang'), 'padding')
                                    ),
                                    el(
                                        PanelBody,
                                        {
                                            key: 'border',
                                            title: __('Border', 'language-switcher-block-for-polylang'),
                                            initialOpen: false
                                        },
                                        createBorderControls()
                                    )
                                ];

                                // Add Flag panel only if show_flags is enabled
                                if (attributes.show_flags) {
                                    stylePanels.push(
                                        el(
                                            PanelBody,
                                            {
                                                key: 'flag',
                                                title: __('Flag', 'language-switcher-block-for-polylang'),
                                                initialOpen: false
                                            },
                                            createFlagControls()
                                        )
                                    );
                                }

                                return stylePanels;
                            }
                        }
                    )
                ),
                el(ServerSideRender, {
                    block: 'lsbg/language-switcher',
                    attributes: attributes
                })
            );
        },

        save: function () {
            // Server-side rendering, so return null
            return null;
        }
    });

})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n,
    window.wp.serverSideRender
);

// Prevent link clicks in the editor
(function() {
    'use strict';
    
    // Use event delegation to handle clicks on links within the language switcher block
    document.addEventListener('click', function(e) {
        // Check if we're in the block editor
        var isEditor = document.body.classList.contains('block-editor-page') || 
                       document.body.classList.contains('wp-admin');
        
        if (!isEditor) {
            return;
        }
        
        // Check if the clicked element is a link within the language switcher block
        var target = e.target;
        var link = target.closest('a');
        
        if (link) {
            var languageSwitcher = link.closest('.wp-block-lsbg-language-switcher');
            if (languageSwitcher) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }, true);
})();

