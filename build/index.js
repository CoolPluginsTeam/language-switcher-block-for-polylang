(function (blocks, element, blockEditor, components, i18n, serverSideRender) {
    'use strict';

    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    var TabPanel = components.TabPanel;
    var BoxControl = components.__experimentalBoxControl || components.BoxControl;
    var RangeControl = components.RangeControl;
    var ColorPalette = components.ColorPalette;
    var ServerSideRender = serverSideRender;
    var __ = i18n.__;

    // Get settings from localized script
    var settings = window.lsbgBlockSettings || { options: {} };

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
            for (var option in settings.options) {
                if (settings.options.hasOwnProperty(option)) {
                    (function (opt) {
                        var optionData = settings.options[opt];
                        
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
                            
                            controls.push(
                                el(SelectControl, {
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
                                })
                            );
                        } else {
                            // Default to ToggleControl for boolean options
                            controls.push(
                                el(ToggleControl, {
                                    key: opt,
                                    label: optionData.label,
                                    checked: attributes[opt],
                                    onChange: function (value) {
                                        var newAttrs = {};
                                        newAttrs[opt] = value;
                                        setAttributes(newAttrs);
                                    },
                                    __nextHasNoMarginBottom: true
                                })
                            );
                        }
                    })(option);
                }
            }

            return el(
                'div',
                {},
                el(
                    InspectorControls,
                    {},
                    el(
                        TabPanel,
                        {
                            className: 'lsbg-inspector-tabs',
                            activeClass: 'active-tab',
                            tabs: [
                                {
                                    name: 'settings',
                                    title: __('Settings', 'language-switcher-block-for-polylang'),
                                    className: 'lsbg-settings-tab'
                                },
                                {
                                    name: 'styles',
                                    title: __('Styles', 'language-switcher-block-for-polylang'),
                                    className: 'lsbg-styles-tab'
                                }
                            ]
                        },
                        function (tab) {
                            if (tab.name === 'settings') {
                                return el(
                                    PanelBody,
                                    {
                                        title: __('Language Switcher Settings', 'language-switcher-block-for-polylang'),
                                        initialOpen: true
                                    },
                                    controls
                                );
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

