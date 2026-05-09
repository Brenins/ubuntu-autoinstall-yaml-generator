# Ubuntu Autoinstall YAML Generator

Visual generator for Ubuntu automated installation YAML files (Autoinstall / cloud-init). Complete web interface to build configurations without editing YAML manually.

## 🎯 Purpose

Enable system administrators to build Ubuntu automated installation configurations through a visual interface, with real-time YAML generation compatible with **Ubuntu Autoinstall** (Subiquity).

## ✅ Implemented Features

### Visual Interface
- **Navigable sidebar** with 12 configuration categories
- **Dynamic forms** for each autoinstall block
- **Real-time YAML preview** with syntax highlighting
- **Responsive design** — works on desktop, tablet, and mobile
- **Dark theme** inspired by Ubuntu with orange accents

### Supported YAML Blocks
| Block | Description |
|-------|-----------|
| `identity` | Hostname, primary user, password (SHA-512 hash) |
| `locale` | System language (11 available locales) |
| `timezone` | Timezone (18 predefined options) |
| `keyboard` | Keyboard layout and variant (10 layouts) |
| `network` | Netplan — DHCP, static IP, Wi-Fi |
| `storage` | Disk layout — LVM, Direct, ZFS, Custom + LUKS |
| `ssh` | OpenSSH server, authorized keys, GitHub/Launchpad import |
| `user-data.users` | Additional users (cloud-init) |
| `packages` | 24 popular packages + custom input |
| `snaps` | 8 popular snaps + manual add with channel/classic |
| `updates` | Update policy (security / all) |
| `late-commands` | Post-installation commands with ready suggestions |
| `drivers` | Third-party drivers installation |
| `codecs` | Restricted codecs |
| `oem` | OEM mode |
| `proxy` | HTTP proxy for installation |
| `shutdown` | Power off instead of reboot |

### Advanced Features
- **Predefined profiles**: Server, Desktop, Minimal, Kiosk
- **YAML import** — loads .yaml/.yml file and populates forms
- **Export/Download** — downloads generated YAML as file
- **Integrated YAML editor** — manual editing with re-import to form
- **Validation** — checks errors before download (structure, required fields)
- **Copy to clipboard** — button to copy YAML
- **Fullscreen** — expandable YAML panel
- **Syntax highlighting** — colors for keys, values, booleans, comments
- **Sidebar badges** — visual counters (packages, snaps, commands)
- **Auto suggestions** — late-commands and popular snaps with 1-click
- **Keyboard shortcuts** — Ctrl+S (download), Ctrl+O (import), Esc (close)

## 📁 Project Structure

```
├── index.html              # Main page — complete layout
├── css/
│   └── style.css           # Styles — dark theme, responsive, components
├── js/
│   ├── yamlGenerator.js    # Generator: form → YAML string
│   ├── yamlParser.js       # Parser: YAML string → form
│   ├── validator.js        # YAML and form validation
│   ├── profiles.js        # Predefined profiles (Server, Desktop, etc.)
│   ├── ui.js               # UI control, dynamic lists, toasts, modals
│   └── app.js              # Main orchestrator, global events
└── README.md               # This documentation
```

## 🛣️ URIs and Entry Points

| Path | Description |
|------|-------------|
| `index.html` | Main application (SPA) |

## 🧩 Modular Architecture

### `yamlGenerator.js`
- Collects data from all forms
- Generates formatted YAML compatible with Ubuntu Autoinstall
- SHA-512 hash generation for passwords
- Custom JS → YAML serialization (no dependencies)

### `yamlParser.js`
- Basic YAML parser (subset used by autoinstall)
- Imports parsed data to forms
- Supports: scalars, mappings, sequences, quoted strings, comments

### `validator.js`
- YAML validation (`autoinstall` key, `version`, indentation, tabs)
- Form validation (hostname, username, CIDR IP, SSH keys)

### `profiles.js`
- 4 predefined profiles with complete configurations
- Reset all forms
- Automatic profile application

### `ui.js`
- Sidebar navigation with active section highlight
- Toggle groups (DHCP/Static, LVM/Direct/ZFS)
- Dynamic lists: Users, Partitions, Snaps (add/remove)
- YAML syntax highlighting
- Toasts, modals, badges
- Manual YAML edit mode

### `app.js`
- Initialization and bootstrap
- Global event binding with debounce (150ms)
- File import/export
- Profile management
- Keyboard shortcuts

## 🔧 Technologies

- **HTML5** — Semantic (header, nav, main, aside, section)
- **CSS3** — Custom Properties, Flexbox, Grid, animations, responsive
- **JavaScript ES6+** — IIFE modules, const/let, arrow functions, template literals
- **Font Awesome 6.4** — Icons (via CDN)
- **Google Fonts** — Ubuntu + Ubuntu Mono (via CDN)
- **Zero dependencies** — No frameworks, no external JS libraries

## 📚 Technical Reference

Based on official Canonical documentation:
- [Autoinstall Reference](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html)
- [cloud-init Documentation](https://cloudinit.readthedocs.io/)
- [Netplan Documentation](https://netplan.io/)
