=== Language Switcher Block for Polylang ===
Contributors: coolplugins
Tags: gutenberg, block, polylang, language switcher, multilingual
Requires at least: 5.0
Tested up to: 6.9
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add a language switcher block for Gutenberg. Works with Polylang or manual custom language links.

== Description ==

**Language Switcher Block for Polylang** adds a powerful Language Switcher block to the WordPress Block Editor.

If Polylang is active, the block automatically displays your site languages and links to the correct translated pages.
If Polylang is not active (or you prefer manual control), you can switch to **Default (Custom Languages)** and add your own language + URL pairs.

### Key Features

* **Gutenberg Block:** Add the Language Switcher using the block editor.
* **Polylang Integration:** Pull languages directly from Polylang (works with Polylang Free/Pro).
* **Custom Language Links Mode:** Add your own language list and URLs (useful when Polylang is disabled or for custom setups).
* **Three Layouts:** Dropdown, Horizontal, and Vertical.
* **Display Controls:**

  * Show/Hide Language Names
  * Show/Hide Flags (SVG flags included)
  * Show/Hide Language Codes
  * Hide Current Language
  * Hide Untranslated Languages

* **Style Controls:** Typography, alignment (left/center/right), spacing (margin/padding), borders, and flag sizing.
* **Server-side Rendering + Editor Preview:** See the switcher preview in the editor.

== Installation ==

1. Upload the plugin folder to the `/wp-content/plugins/language-switcher-block-for-polylang/` directory, or install it via the WordPress Plugins screen.
2. Activate the plugin through the ‘Plugins’ screen.
3. (Optional) Install and activate **Polylang** if you want the switcher to auto-detect languages and link translations automatically.
4. Edit any page/post/template in the Block Editor and insert the **Language Switcher** block.

== How to Use ==

1. Open a page/post in the WordPress Block Editor.
2. Click **Add block (+)** and search for **Language Switcher**.
3. Insert the block.
4. In the block sidebar settings:

   * Choose a **Layout** (Dropdown / Horizontal / Vertical).
   * Choose what to show: **Names**, **Flags**, and/or **Language Codes**.
   * Optional: Enable **Hide Current Language** and/or **Hide Untranslated Languages**.

### Using Custom Languages (Default Mode)

If Polylang is not active, the block will automatically use **Default (Custom Languages)**.

If Polylang is active, you can still switch to **Default (Custom Languages)** from the block settings:

1. Go to **Language Source**.
2. Select **Default (Custom Languages)**.
3. Add one or more language rows (Language + URL).

== Screenshots ==

1. Language Switcher block in the editor.
2. Language Source settings (Polylang vs Default custom languages).
3. Layout options: Dropdown, Horizontal, Vertical.
4. Style controls: typography, spacing, border, and flags.

== Frequently Asked Questions ==

= Do I need Polylang for this plugin to work? =
No. Polylang is only needed if you want the switcher to pull languages automatically and link to translated pages. Without Polylang, you can use **Default (Custom Languages)** and manually add language URLs.

= Can I use this block in Full Site Editing (FSE) templates? =
Yes. You can add the block to posts/pages and also into Site Editor templates/parts.

= What layouts are supported? =
Dropdown, Horizontal, and Vertical.

= Can I hide the current language or untranslated languages? =
Yes. When using Polylang source, you can enable **Hide Current Language** and **Hide Untranslated Languages**.

= Can I style the switcher without writing CSS? =
Yes. The block includes controls for typography, spacing, borders, and flag size.

= How can I report security bugs? =
Please report security issues responsibly via the Patchstack Vulnerability Disclosure Program:
[Report a security vulnerability](https://patchstack.com/database/wordpress/plugin/language-switcher-block-for-polylang/vdp)

== Changelog ==

= 1.0.0 =
* Initial release.

== Upgrade Notice ==
Initial release.
