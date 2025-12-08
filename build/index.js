(function (blocks, element, blockEditor, components, i18n, serverSideRender) {
    'use strict';

    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
    var SelectControl = components.SelectControl;
    var ServerSideRender = serverSideRender;
    var __ = i18n.__;

    // Get settings from localized script
    var settings = window.lsbgBlockSettings || { options: {} };

    registerBlockType('lsbg/language-switcher', {
        title: __('Language Switcher', 'language-switcher-block-for-polylang'),
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
                        PanelBody,
                        {
                            title: __('Language Switcher Settings', 'language-switcher-block-for-polylang'),
                            initialOpen: true
                        },
                        controls
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

