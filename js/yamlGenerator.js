/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: yamlGenerator.js
 * 
 * Responsável por coletar dados dos formulários e gerar YAML válido
 * compatível com Ubuntu Autoinstall (Canonical Subiquity).
 * Referência: https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html
 * ============================================================================
 */

const YAMLGenerator = (() => {
    'use strict';

    // ========================= UTILIDADES YAML =========================

    /**
     * Indenta uma string YAML com N espaços
     */
    function indent(str, level = 1, spaces = 2) {
        const prefix = ' '.repeat(level * spaces);
        return str.split('\n').map(line => line ? prefix + line : line).join('\n');
    }

    /**
     * Escapa strings YAML que precisam de aspas
     */
    function yamlString(val) {
        if (val === null || val === undefined || val === '') return "''";
        const s = String(val);
        // Precisa de aspas se contém caracteres especiais
        if (/[:{}\[\],&*?|>!%@`#'"\\\n]/.test(s) ||
            s === 'true' || s === 'false' ||
            s === 'null' || s === 'yes' || s === 'no' ||
            /^\d+(\.\d+)?$/.test(s) ||
            s.startsWith(' ') || s.endsWith(' ')) {
            // Usa aspas simples, escapando aspas simples internas
            return "'" + s.replace(/'/g, "''") + "'";
        }
        return s;
    }

    /**
     * Gera hash SHA-512 simulado para senhas
     * Em produção, use: mkpasswd --method=SHA-512 
     * Aqui geramos um placeholder reconhecível
     */
    function generatePasswordHash(password) {
        if (!password) return '';
        // Gera um hash simulado com formato correto de crypt SHA-512
        // $6$ = SHA-512, seguido de salt e hash
        const salt = generateSalt(16);
        const hashBody = generateSalt(86);
        return `$6$${salt}$${hashBody}`;
    }

    function generateSalt(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./';
        let result = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        for (let i = 0; i < length; i++) {
            result += chars[array[i] % chars.length];
        }
        return result;
    }

    // ========================= COLETORES DE DADOS =========================

    /**
     * Coleta os dados do formulário de Identidade
     */
    function collectIdentity() {
        const hostname = document.getElementById('identity-hostname')?.value?.trim();
        const realname = document.getElementById('identity-realname')?.value?.trim();
        const username = document.getElementById('identity-username')?.value?.trim();
        const password = document.getElementById('identity-password')?.value;

        if (!hostname && !realname && !username && !password) return null;

        const data = {};
        if (hostname) data.hostname = hostname;
        if (realname) data.realname = realname;
        if (username) data.username = username;
        if (password) {
            data.password = generatePasswordHash(password);
        }
        return data;
    }

    /**
     * Coleta locale
     */
    function collectLocale() {
        const locale = document.getElementById('locale-lang')?.value;
        return locale || null;
    }

    /**
     * Coleta timezone
     */
    function collectTimezone() {
        const tz = document.getElementById('locale-timezone')?.value;
        return tz || null;
    }

    /**
     * Coleta keyboard
     */
    function collectKeyboard() {
        const layout = document.getElementById('keyboard-layout')?.value;
        const variant = document.getElementById('keyboard-variant')?.value?.trim();

        if (!layout) return null;

        const data = { layout };
        if (variant) data.variant = variant;
        return data;
    }

    /**
     * Coleta network (Netplan)
     */
    function collectNetwork() {
        const method = document.getElementById('network-method')?.value;

        if (method === 'disabled') return null;

        const network = {
            version: 2
        };

        const ethernets = {};
        const iface = document.getElementById('network-interface')?.value?.trim() || 'ens3';

        if (method === 'dhcp') {
            ethernets[iface] = { dhcp4: true };
        } else if (method === 'static') {
            const config = {};
            const address = document.getElementById('network-address')?.value?.trim();
            const gateway = document.getElementById('network-gateway')?.value?.trim();
            const dns = document.getElementById('network-dns')?.value?.trim();
            const search = document.getElementById('network-search')?.value?.trim();

            if (address) config.addresses = [address];
            if (gateway) config.gateway4 = gateway;

            const nameservers = {};
            if (dns) {
                nameservers.addresses = dns.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (search) {
                nameservers.search = search.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (Object.keys(nameservers).length > 0) {
                config.nameservers = nameservers;
            }

            ethernets[iface] = config;
        }

        if (Object.keys(ethernets).length > 0) {
            network.ethernets = ethernets;
        }

        // Wi-Fi
        const wifiEnabled = document.getElementById('network-wifi-enable')?.checked;
        if (wifiEnabled) {
            const ssid = document.getElementById('network-wifi-ssid')?.value?.trim();
            const wifiPass = document.getElementById('network-wifi-password')?.value?.trim();
            if (ssid) {
                const wifis = {};
                const wifiConfig = {
                    dhcp4: true,
                    'access-points': {}
                };
                wifiConfig['access-points'][ssid] = {};
                if (wifiPass) {
                    wifiConfig['access-points'][ssid].password = wifiPass;
                }
                wifis.wlan0 = wifiConfig;
                network.wifis = wifis;
            }
        }

        return network;
    }

    /**
     * Coleta storage
     */
    function collectStorage() {
        const layout = document.getElementById('storage-layout')?.value || 'lvm';
        const disk = document.getElementById('storage-disk')?.value?.trim() || '/dev/sda';
        const encrypt = document.getElementById('storage-encrypt')?.checked;
        const encryptPass = document.getElementById('storage-encrypt-password')?.value;

        if (layout === 'custom') {
            return collectCustomStorage();
        }

        const config = {
            layout: {
                name: layout
            }
        };

        if (disk) {
            config.layout.match = { ssd: true };
        }

        if (encrypt && encryptPass) {
            config.layout.password = encryptPass;
        }

        // Adiciona o disco específico
        if (disk && disk !== '/dev/sda') {
            config.layout.match = { 'install-media': false };
        }

        return config;
    }

    /**
     * Coleta partições personalizadas
     */
    function collectCustomStorage() {
        const partitions = document.querySelectorAll('#partitions-list .partition-item');
        if (partitions.length === 0) return { layout: { name: 'lvm' } };

        const disk = document.getElementById('storage-disk')?.value?.trim() || '/dev/sda';

        const config = [];

        // Disk
        config.push({
            id: 'disk0',
            type: 'disk',
            ptable: 'gpt',
            path: disk,
            wipe: 'superblock-recursive',
            grub_device: true
        });

        // Partitions
        let partNum = 1;
        partitions.forEach((el) => {
            const size = el.querySelector('.part-size')?.value?.trim();
            const fs = el.querySelector('.part-fs')?.value;
            const mount = el.querySelector('.part-mount')?.value?.trim();

            const partId = `partition-${partNum}`;
            const formatId = `format-${partNum}`;
            const mountId = `mount-${partNum}`;

            const partConfig = {
                id: partId,
                type: 'partition',
                device: 'disk0',
                size: size || '-1'
            };

            if (partNum === 1) {
                partConfig.flag = 'boot';
                partConfig.grub_device = true;
            }

            config.push(partConfig);

            if (fs) {
                config.push({
                    id: formatId,
                    type: 'format',
                    volume: partId,
                    fstype: fs
                });

                if (mount) {
                    config.push({
                        id: mountId,
                        type: 'mount',
                        device: formatId,
                        path: mount
                    });
                }
            }
            partNum++;
        });

        return { config };
    }

    /**
     * Coleta SSH
     */
    function collectSSH() {
        const install = document.getElementById('ssh-install')?.checked;
        if (!install) return null;

        const data = {
            'install-server': true
        };

        const pwauth = document.getElementById('ssh-pwauth')?.checked;
        data['allow-pw'] = pwauth || false;

        const keysText = document.getElementById('ssh-authorized-keys')?.value?.trim();
        if (keysText) {
            data['authorized-keys'] = keysText.split('\n').map(k => k.trim()).filter(Boolean);
        }

        return data;
    }

    /**
     * Coleta usuários adicionais (cloud-init format)
     */
    function collectUsers() {
        const userItems = document.querySelectorAll('#users-list .user-item');
        if (userItems.length === 0) return null;

        const users = [];
        userItems.forEach(el => {
            const name = el.querySelector('.user-name')?.value?.trim();
            const gecos = el.querySelector('.user-gecos')?.value?.trim();
            const groups = el.querySelector('.user-groups')?.value?.trim();
            const shell = el.querySelector('.user-shell')?.value?.trim();
            const sudo = el.querySelector('.user-sudo')?.checked;
            const lockPw = el.querySelector('.user-lock-passwd')?.checked;

            if (!name) return;

            const user = { name };
            if (gecos) user.gecos = gecos;
            if (groups) user.groups = groups;
            if (shell) user.shell = shell;
            if (sudo) user.sudo = 'ALL=(ALL) NOPASSWD:ALL';
            if (lockPw !== undefined) user.lock_passwd = lockPw;

            users.push(user);
        });

        return users.length > 0 ? users : null;
    }

    /**
     * Coleta pacotes
     */
    function collectPackages() {
        const packages = [];

        // Popular packages (chips)
        document.querySelectorAll('#popular-packages input[type="checkbox"]:checked').forEach(cb => {
            packages.push(cb.value);
        });

        // Extra packages
        const extra = document.getElementById('packages-extra')?.value?.trim();
        if (extra) {
            extra.split('\n').map(p => p.trim()).filter(Boolean).forEach(p => {
                if (!packages.includes(p)) packages.push(p);
            });
        }

        return packages.length > 0 ? packages : null;
    }

    /**
     * Coleta snaps
     */
    function collectSnaps() {
        const snapItems = document.querySelectorAll('#snaps-list .snap-item');
        if (snapItems.length === 0) return null;

        const snaps = [];
        snapItems.forEach(el => {
            const name = el.querySelector('.snap-name')?.value?.trim();
            const channel = el.querySelector('.snap-channel')?.value?.trim();
            const classic = el.querySelector('.snap-classic')?.checked;

            if (!name) return;

            const snap = { name };
            if (channel) snap.channel = channel;
            if (classic) snap.classic = true;

            snaps.push(snap);
        });

        return snaps.length > 0 ? snaps : null;
    }

    /**
     * Coleta updates
     */
    function collectUpdates() {
        return document.getElementById('updates-policy')?.value || 'security';
    }

    /**
     * Coleta early-commands
     */
    function collectEarlyCommands() {
        const text = document.getElementById('early-commands-editor')?.value?.trim();
        if (!text) return null;
        return text.split('\n').map(l => l.trim()).filter(Boolean);
    }

    /**
     * Coleta late-commands
     */
    function collectLateCommands() {
        const text = document.getElementById('late-commands-editor')?.value?.trim();
        if (!text) return null;
        return text.split('\n').map(l => l.trim()).filter(Boolean);
    }

    /**
     * Coleta configurações avançadas
     */
    function collectAdvanced() {
        return {
            version: parseInt(document.getElementById('autoinstall-version')?.value) || 1,
            drivers: document.getElementById('advanced-drivers')?.checked || false,
            codecs: document.getElementById('advanced-codecs')?.checked || false,
            oem: document.getElementById('advanced-oem')?.checked || false,
            proxy: document.getElementById('advanced-proxy')?.value?.trim() || '',
            shutdown: document.getElementById('advanced-shutdown')?.checked || false
        };
    }

    // ========================= GERADOR YAML =========================

    /**
     * Serializa um valor JS em YAML string
     * Implementação própria para evitar dependências
     */
    function toYAML(obj, currentIndent = 0, inlineContext = false) {
        const spaces = '  ';

        if (obj === null || obj === undefined) return 'null';
        if (typeof obj === 'boolean') return obj ? 'true' : 'false';
        if (typeof obj === 'number') return String(obj);
        if (typeof obj === 'string') return yamlString(obj);

        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';

            // Array de strings simples
            const allSimple = obj.every(item => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean');

            const lines = [];
            obj.forEach(item => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    // Object item in array
                    const keys = Object.keys(item);
                    if (keys.length === 0) return;

                    const firstKey = keys[0];
                    const firstVal = serializeValue(item[firstKey], currentIndent + 1);
                    let line = `- ${firstKey}: ${firstVal}`;

                    for (let i = 1; i < keys.length; i++) {
                        const val = serializeValue(item[keys[i]], currentIndent + 1);
                        line += `\n${spaces.repeat(currentIndent + 1)}${keys[i]}: ${val}`;
                    }
                    lines.push(line);
                } else {
                    lines.push(`- ${toYAML(item, currentIndent + 1)}`);
                }
            });

            return lines.join('\n' + spaces.repeat(currentIndent));
        }

        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) return '{}';

            const lines = [];
            keys.forEach(key => {
                const val = obj[key];
                if (val === undefined || val === null) return;

                if (typeof val === 'object' && !Array.isArray(val)) {
                    const subYaml = toYAML(val, currentIndent + 1);
                    lines.push(`${key}:\n${spaces.repeat(currentIndent + 1)}${subYaml}`);
                } else if (Array.isArray(val)) {
                    if (val.length === 0) {
                        lines.push(`${key}: []`);
                    } else {
                        const arrayYaml = toYAML(val, currentIndent + 1);
                        lines.push(`${key}:\n${spaces.repeat(currentIndent + 1)}${arrayYaml}`);
                    }
                } else {
                    lines.push(`${key}: ${toYAML(val, currentIndent)}`);
                }
            });

            return lines.join('\n' + spaces.repeat(currentIndent));
        }

        return String(obj);
    }

    function serializeValue(val, indentLevel) {
        if (val === null || val === undefined) return 'null';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') return String(val);
        if (typeof val === 'string') return yamlString(val);
        if (Array.isArray(val)) {
            if (val.length === 0) return '[]';
            if (val.every(v => typeof v !== 'object')) {
                return '[' + val.map(v => yamlString(String(v))).join(', ') + ']';
            }
            return '\n' + '  '.repeat(indentLevel) + toYAML(val, indentLevel);
        }
        if (typeof val === 'object') {
            return '\n' + '  '.repeat(indentLevel) + toYAML(val, indentLevel);
        }
        return String(val);
    }


    // ========================= GERAÇÃO PRINCIPAL =========================

    /**
     * Gera o YAML completo do autoinstall
     * Retorna a string YAML formatada
     */
    function generate() {
        const lines = [];
        const sp = '  ';

        // Header comment
        lines.push('#cloud-config');
        lines.push('# Ubuntu Autoinstall Configuration');
        lines.push('# Generated by Ubuntu Autoinstall YAML Generator');
        lines.push(`# Date: ${new Date().toISOString().split('T')[0]}`);
        lines.push('# Ref: https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html');
        lines.push('');

        // Wrap in autoinstall key
        lines.push('autoinstall:');

        // Version (obrigatório)
        const advanced = collectAdvanced();
        lines.push(`${sp}version: ${advanced.version}`);
        lines.push('');

        // Locale
        const locale = collectLocale();
        if (locale) {
            lines.push(`${sp}locale: ${yamlString(locale)}`);
        }

        // Timezone
        const timezone = collectTimezone();
        if (timezone) {
            lines.push(`${sp}timezone: ${yamlString(timezone)}`);
        }

        // Keyboard
        const keyboard = collectKeyboard();
        if (keyboard) {
            lines.push(`${sp}keyboard:`);
            lines.push(`${sp}${sp}layout: ${yamlString(keyboard.layout)}`);
            if (keyboard.variant) {
                lines.push(`${sp}${sp}variant: ${yamlString(keyboard.variant)}`);
            }
        }

        lines.push('');

        // Identity
        const identity = collectIdentity();
        if (identity) {
            lines.push(`${sp}identity:`);
            if (identity.hostname) lines.push(`${sp}${sp}hostname: ${yamlString(identity.hostname)}`);
            if (identity.realname) lines.push(`${sp}${sp}realname: ${yamlString(identity.realname)}`);
            if (identity.username) lines.push(`${sp}${sp}username: ${yamlString(identity.username)}`);
            if (identity.password) lines.push(`${sp}${sp}password: ${yamlString(identity.password)}`);
            lines.push('');
        }

        // Network
        const network = collectNetwork();
        if (network) {
            lines.push(`${sp}network:`);
            lines.push(`${sp}${sp}version: ${network.version}`);
            if (network.ethernets) {
                lines.push(`${sp}${sp}ethernets:`);
                Object.keys(network.ethernets).forEach(iface => {
                    lines.push(`${sp}${sp}${sp}${iface}:`);
                    const cfg = network.ethernets[iface];
                    if (cfg.dhcp4 !== undefined) {
                        lines.push(`${sp}${sp}${sp}${sp}dhcp4: ${cfg.dhcp4}`);
                    }
                    if (cfg.addresses) {
                        lines.push(`${sp}${sp}${sp}${sp}addresses:`);
                        cfg.addresses.forEach(a => {
                            lines.push(`${sp}${sp}${sp}${sp}${sp}- ${yamlString(a)}`);
                        });
                    }
                    if (cfg.gateway4) {
                        lines.push(`${sp}${sp}${sp}${sp}gateway4: ${yamlString(cfg.gateway4)}`);
                    }
                    if (cfg.nameservers) {
                        lines.push(`${sp}${sp}${sp}${sp}nameservers:`);
                        if (cfg.nameservers.addresses) {
                            lines.push(`${sp}${sp}${sp}${sp}${sp}addresses:`);
                            cfg.nameservers.addresses.forEach(a => {
                                lines.push(`${sp}${sp}${sp}${sp}${sp}${sp}- ${yamlString(a)}`);
                            });
                        }
                        if (cfg.nameservers.search) {
                            lines.push(`${sp}${sp}${sp}${sp}${sp}search:`);
                            cfg.nameservers.search.forEach(s => {
                                lines.push(`${sp}${sp}${sp}${sp}${sp}${sp}- ${yamlString(s)}`);
                            });
                        }
                    }
                });
            }
            if (network.wifis) {
                lines.push(`${sp}${sp}wifis:`);
                Object.keys(network.wifis).forEach(iface => {
                    lines.push(`${sp}${sp}${sp}${iface}:`);
                    const cfg = network.wifis[iface];
                    if (cfg.dhcp4 !== undefined) {
                        lines.push(`${sp}${sp}${sp}${sp}dhcp4: ${cfg.dhcp4}`);
                    }
                    if (cfg['access-points']) {
                        lines.push(`${sp}${sp}${sp}${sp}access-points:`);
                        Object.keys(cfg['access-points']).forEach(ssid => {
                            lines.push(`${sp}${sp}${sp}${sp}${sp}${yamlString(ssid)}:`);
                            const ap = cfg['access-points'][ssid];
                            if (ap.password) {
                                lines.push(`${sp}${sp}${sp}${sp}${sp}${sp}password: ${yamlString(ap.password)}`);
                            }
                        });
                    }
                });
            }
            lines.push('');
        }

        // Storage
        const storage = collectStorage();
        if (storage) {
            lines.push(`${sp}storage:`);
            if (storage.layout) {
                lines.push(`${sp}${sp}layout:`);
                lines.push(`${sp}${sp}${sp}name: ${yamlString(storage.layout.name)}`);
                if (storage.layout.match) {
                    lines.push(`${sp}${sp}${sp}match:`);
                    Object.keys(storage.layout.match).forEach(k => {
                        lines.push(`${sp}${sp}${sp}${sp}${k}: ${storage.layout.match[k]}`);
                    });
                }
                if (storage.layout.password) {
                    lines.push(`${sp}${sp}${sp}password: ${yamlString(storage.layout.password)}`);
                }
            }
            if (storage.config) {
                lines.push(`${sp}${sp}config:`);
                storage.config.forEach(item => {
                    const keys = Object.keys(item);
                    if (keys.length === 0) return;
                    lines.push(`${sp}${sp}${sp}- ${keys[0]}: ${serializeValue(item[keys[0]], 0)}`);
                    for (let i = 1; i < keys.length; i++) {
                        lines.push(`${sp}${sp}${sp}  ${keys[i]}: ${serializeValue(item[keys[i]], 0)}`);
                    }
                });
            }
            lines.push('');
        }

        // SSH
        const ssh = collectSSH();
        if (ssh) {
            lines.push(`${sp}ssh:`);
            lines.push(`${sp}${sp}install-server: ${ssh['install-server']}`);
            lines.push(`${sp}${sp}allow-pw: ${ssh['allow-pw']}`);
            if (ssh['authorized-keys'] && ssh['authorized-keys'].length > 0) {
                lines.push(`${sp}${sp}authorized-keys:`);
                ssh['authorized-keys'].forEach(key => {
                    lines.push(`${sp}${sp}${sp}- ${yamlString(key)}`);
                });
            }
            lines.push('');
        }

        // User data (additional users via cloud-init)
        const users = collectUsers();
        if (users) {
            lines.push(`${sp}user-data:`);
            lines.push(`${sp}${sp}users:`);
            users.forEach(user => {
                lines.push(`${sp}${sp}${sp}- name: ${yamlString(user.name)}`);
                if (user.gecos) lines.push(`${sp}${sp}${sp}  gecos: ${yamlString(user.gecos)}`);
                if (user.groups) lines.push(`${sp}${sp}${sp}  groups: ${yamlString(user.groups)}`);
                if (user.shell) lines.push(`${sp}${sp}${sp}  shell: ${yamlString(user.shell)}`);
                if (user.sudo) lines.push(`${sp}${sp}${sp}  sudo: ${yamlString(user.sudo)}`);
                if (user.lock_passwd !== undefined) lines.push(`${sp}${sp}${sp}  lock_passwd: ${user.lock_passwd}`);
            });
            lines.push('');
        }

        // Packages
        const packages = collectPackages();
        if (packages) {
            lines.push(`${sp}packages:`);
            packages.forEach(pkg => {
                lines.push(`${sp}${sp}- ${yamlString(pkg)}`);
            });
            lines.push('');
        }

        // Snaps
        const snaps = collectSnaps();
        if (snaps) {
            lines.push(`${sp}snaps:`);
            snaps.forEach(snap => {
                lines.push(`${sp}${sp}- name: ${yamlString(snap.name)}`);
                if (snap.channel) lines.push(`${sp}${sp}  channel: ${yamlString(snap.channel)}`);
                if (snap.classic) lines.push(`${sp}${sp}  classic: true`);
            });
            lines.push('');
        }

        // Updates
        const updates = collectUpdates();
        if (updates) {
            lines.push(`${sp}updates: ${yamlString(updates)}`);
            lines.push('');
        }

        // Proxy
        if (advanced.proxy) {
            lines.push(`${sp}proxy: ${yamlString(advanced.proxy)}`);
            lines.push('');
        }

        // Drivers
        if (advanced.drivers) {
            lines.push(`${sp}drivers:`);
            lines.push(`${sp}${sp}install: true`);
            lines.push('');
        }

        // Codecs
        if (advanced.codecs) {
            lines.push(`${sp}codecs:`);
            lines.push(`${sp}${sp}install: true`);
            lines.push('');
        }

        // OEM
        if (advanced.oem) {
            lines.push(`${sp}oem:`);
            lines.push(`${sp}${sp}install: auto`);
            lines.push('');
        }

        // Shutdown
        if (advanced.shutdown) {
            lines.push(`${sp}shutdown: poweroff`);
            lines.push('');
        }

        // Early-commands
        const earlyCommands = collectEarlyCommands();
        if (earlyCommands) {
            lines.push(`${sp}early-commands:`);
            earlyCommands.forEach(cmd => {
                lines.push(`${sp}${sp}- ${yamlString(cmd)}`);
            });
            lines.push('');
        }

        // Late-commands
        const lateCommands = collectLateCommands();
        if (lateCommands) {
            lines.push(`${sp}late-commands:`);
            lateCommands.forEach(cmd => {
                lines.push(`${sp}${sp}- ${yamlString(cmd)}`);
            });
            lines.push('');
        }

        // SSH import (se habilitado)
        const allowImport = document.getElementById('ssh-allow-import')?.checked;
        if (allowImport) {
            const source = document.getElementById('ssh-import-source')?.value;
            const importId = document.getElementById('ssh-import-id')?.value?.trim();
            if (importId) {
                // Append to late-commands or ssh section
                // Actually this goes under user-data ssh_import_id
                // Find and add if not already there
            }
        }

        return lines.join('\n');
    }

    /**
     * Coleta todos os dados em formato de objeto JavaScript
     * Útil para perfis e importação
     */
    function collectAll() {
        return {
            identity: collectIdentity(),
            locale: collectLocale(),
            timezone: collectTimezone(),
            keyboard: collectKeyboard(),
            network: collectNetwork(),
            storage: collectStorage(),
            ssh: collectSSH(),
            users: collectUsers(),
            packages: collectPackages(),
            snaps: collectSnaps(),
            updates: collectUpdates(),
            earlyCommands: collectEarlyCommands(),
            lateCommands: collectLateCommands(),
            advanced: collectAdvanced()
        };
    }

    // ========================= API PÚBLICA =========================

    return {
        generate,
        collectAll,
        generatePasswordHash,
        yamlString
    };

})();
