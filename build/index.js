(function (blocks, element, blockEditor, components, i18n, serverSideRender) {
    'use strict';

    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var ToggleControl = components.ToggleControl;
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
            force_home: {
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
                type: 'boolean',
                default: false
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

            // Create toggle controls for each option
            var controls = [];
            for (var option in settings.options) {
                if (settings.options.hasOwnProperty(option)) {
                    // Hide show_flags, show_names, and hide_current options when dropdown is selected
                    if ((option === 'hide_current' || option === 'show_flags' || option === 'show_names') && attributes.dropdown) {
                        continue;
                    }
                    (function (opt) {
                        controls.push(
                            el(ToggleControl, {
                                key: opt,
                                label: settings.options[opt].label,
                                checked: attributes[opt],
                                onChange: function (value) {
                                    var newAttrs = {};
                                    newAttrs[opt] = value;
                                    setAttributes(newAttrs);
                                },
                                __nextHasNoMarginBottom: true
                            })
                        );
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

