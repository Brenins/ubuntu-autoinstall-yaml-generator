/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: profiles.js
 * 
 * Perfis de instalação predefinidos baseados em casos de uso comuns.
 * Cada perfil pré-configura os formulários com valores apropriados.
 * ============================================================================
 */

const Profiles = (() => {
    'use strict';

    const t = (key) => {
        if (typeof I18n !== 'undefined' && I18n.t) {
            return I18n.t(key);
        }
        return key;
    };

    /**
     * Perfis disponíveis
     * Cada perfil define valores padrão para os formulários
     */
    const profiles = {

        // ===== SERVIDOR =====
        server: {
            get name() { return t('profile.server_name'); },
            get description() { return t('profile.server_desc'); },
            identity: {
                hostname: 'ubuntu-server',
                realname: 'Administrator',
                username: 'admin',
                password: ''
            },
            locale: 'en_US.UTF-8',
            timezone: 'UTC',
            keyboard: { layout: 'us', variant: '' },
            network: { method: 'dhcp' },
            storage: { layout: 'lvm', disk: '/dev/sda', encrypt: false },
            ssh: {
                install: true,
                pwauth: true,
                keys: '',
                allowImport: false
            },
            packages: [
                'curl', 'wget', 'vim', 'htop', 'git',
                'net-tools', 'unzip', 'ca-certificates',
                'software-properties-common', 'ufw', 'fail2ban'
            ],
            snaps: [],
            updates: 'security',
            lateCommands: [
                'curtin in-target --target=/target -- apt-get update',
                'curtin in-target --target=/target -- apt-get upgrade -y',
                'curtin in-target --target=/target -- systemctl enable ufw',
                'curtin in-target --target=/target -- ufw allow OpenSSH',
                'curtin in-target --target=/target -- ufw --force enable'
            ],
            advanced: {
                drivers: false,
                codecs: false,
                oem: false,
                proxy: '',
                shutdown: false
            }
        },

        // ===== DESKTOP =====
        desktop: {
            get name() { return t('profile.desktop_name'); },
            get description() { return t('profile.desktop_desc'); },
            identity: {
                hostname: 'ubuntu-desktop',
                realname: 'User',
                username: 'user',
                password: ''
            },
            locale: 'pt_BR.UTF-8',
            timezone: 'America/Sao_Paulo',
            keyboard: { layout: 'br', variant: '' },
            network: { method: 'dhcp' },
            storage: { layout: 'lvm', disk: '/dev/sda', encrypt: false },
            ssh: {
                install: false,
                pwauth: false,
                keys: '',
                allowImport: false
            },
            packages: [
                'curl', 'wget', 'git', 'vim', 'htop',
                'gnupg', 'unzip', 'ca-certificates'
            ],
            snaps: [
                { name: 'firefox', channel: 'latest/stable', classic: false },
                { name: 'code', channel: 'latest/stable', classic: true }
            ],
            updates: 'all',
            lateCommands: [],
            advanced: {
                drivers: true,
                codecs: true,
                oem: false,
                proxy: '',
                shutdown: false
            }
        },

        // ===== MINIMAL =====
        minimal: {
            get name() { return t('profile.minimal_name'); },
            get description() { return t('profile.minimal_desc'); },
            identity: {
                hostname: 'ubuntu-minimal',
                realname: 'Admin',
                username: 'admin',
                password: ''
            },
            locale: 'en_US.UTF-8',
            timezone: 'UTC',
            keyboard: { layout: 'us', variant: '' },
            network: { method: 'dhcp' },
            storage: { layout: 'direct', disk: '/dev/sda', encrypt: false },
            ssh: {
                install: true,
                pwauth: true,
                keys: '',
                allowImport: false
            },
            packages: [],
            snaps: [],
            updates: 'security',
            lateCommands: [],
            advanced: {
                drivers: false,
                codecs: false,
                oem: false,
                proxy: '',
                shutdown: false
            }
        },

        // ===== KIOSK =====
        kiosk: {
            get name() { return t('profile.kiosk_name'); },
            get description() { return t('profile.kiosk_desc'); },
            identity: {
                hostname: 'ubuntu-kiosk',
                realname: 'Kiosk User',
                username: 'kiosk',
                password: ''
            },
            locale: 'pt_BR.UTF-8',
            timezone: 'America/Sao_Paulo',
            keyboard: { layout: 'br', variant: '' },
            network: { method: 'dhcp' },
            storage: { layout: 'direct', disk: '/dev/sda', encrypt: false },
            ssh: {
                install: false,
                pwauth: false,
                keys: '',
                allowImport: false
            },
            packages: [
                'curl', 'unzip', 'ca-certificates'
            ],
            snaps: [
                { name: 'chromium', channel: 'latest/stable', classic: false }
            ],
            updates: 'security',
            lateCommands: [],
            advanced: {
                drivers: true,
                codecs: true,
                oem: false,
                proxy: '',
                shutdown: false
            }
        }
    };

    /**
     * Aplica um perfil aos formulários
     */
    function apply(profileId) {
        const profile = profiles[profileId];
        if (!profile) return false;

        // Primeiro reseta tudo
        resetAllForms();

        // Identity
        if (profile.identity) {
            setVal('identity-hostname', profile.identity.hostname);
            setVal('identity-realname', profile.identity.realname);
            setVal('identity-username', profile.identity.username);
        }

        // Locale & Timezone
        if (profile.locale) setVal('locale-lang', profile.locale);
        if (profile.timezone) setVal('locale-timezone', profile.timezone);

        // Keyboard
        if (profile.keyboard) {
            setVal('keyboard-layout', profile.keyboard.layout);
            setVal('keyboard-variant', profile.keyboard.variant || '');
        }

        // Network
        if (profile.network) {
            setToggleBtn('network-method', profile.network.method);
            const staticFields = document.getElementById('network-static-fields');
            if (staticFields) {
                staticFields.style.display = profile.network.method === 'static' ? '' : 'none';
            }
        }

        // Storage
        if (profile.storage) {
            setToggleBtn('storage-layout', profile.storage.layout);
            setVal('storage-disk', profile.storage.disk || '/dev/sda');
            setChecked('storage-encrypt', profile.storage.encrypt || false);
            const encFields = document.getElementById('storage-encrypt-fields');
            if (encFields) encFields.style.display = profile.storage.encrypt ? '' : 'none';
        }

        // SSH
        if (profile.ssh) {
            setChecked('ssh-install', profile.ssh.install);
            setChecked('ssh-pwauth', profile.ssh.pwauth);
            setVal('ssh-authorized-keys', profile.ssh.keys || '');
            setChecked('ssh-allow-import', profile.ssh.allowImport || false);

            const sshFields = document.getElementById('ssh-fields');
            if (sshFields) sshFields.style.display = profile.ssh.install ? '' : 'none';
        }

        // Packages
        if (profile.packages) {
            // Reset chips
            document.querySelectorAll('#popular-packages input').forEach(cb => {
                cb.checked = profile.packages.includes(cb.value);
            });
            // No extra packages for profiles
            setVal('packages-extra', '');
        }

        // Snaps
        if (profile.snaps && profile.snaps.length > 0 && typeof UI !== 'undefined') {
            // Limpa snaps existentes
            document.getElementById('snaps-list').innerHTML = '';
            profile.snaps.forEach(snap => UI.addSnap(snap));
        }

        // Updates
        if (profile.updates) {
            setVal('updates-policy', profile.updates);
        }

        // Late commands
        if (profile.lateCommands) {
            setVal('late-commands-editor', profile.lateCommands.join('\n'));
        }

        // Early commands
        if (profile.earlyCommands) {
            setVal('early-commands-editor', profile.earlyCommands.join('\n'));
        }

        // Advanced
        if (profile.advanced) {
            setChecked('advanced-drivers', profile.advanced.drivers);
            setChecked('advanced-codecs', profile.advanced.codecs);
            setChecked('advanced-oem', profile.advanced.oem);
            setVal('advanced-proxy', profile.advanced.proxy || '');
            setChecked('advanced-shutdown', profile.advanced.shutdown);
        }

        return true;
    }

    /**
     * Retorna informações do perfil
     */
    function getInfo(profileId) {
        return profiles[profileId] || null;
    }

    /**
     * Lista todos os perfis disponíveis
     */
    function listAll() {
        return Object.keys(profiles).map(id => ({
            id,
            name: profiles[id].name,
            description: profiles[id].description
        }));
    }

    /**
     * Reseta todos os formulários
     */
    function resetAllForms() {
        // Identity
        setVal('identity-hostname', '');
        setVal('identity-realname', '');
        setVal('identity-username', '');
        setVal('identity-password', '');
        const pwField = document.getElementById('identity-password');
        if (pwField) {
            pwField.placeholder = '••••••••';
            delete pwField.dataset.importedHash;
        }

        // Locale
        setVal('locale-lang', 'pt_BR.UTF-8');
        setVal('locale-timezone', 'America/Sao_Paulo');

        // Keyboard
        setVal('keyboard-layout', 'br');
        setVal('keyboard-variant', '');

        // Network
        setToggleBtn('network-method', 'dhcp');
        setVal('network-interface', 'ens3');
        setVal('network-address', '');
        setVal('network-gateway', '');
        setVal('network-dns', '');
        setVal('network-search', '');
        setChecked('network-wifi-enable', false);
        setVal('network-wifi-ssid', '');
        setVal('network-wifi-password', '');
        const staticFields = document.getElementById('network-static-fields');
        if (staticFields) staticFields.style.display = 'none';
        const wifiFields = document.getElementById('network-wifi-fields');
        if (wifiFields) wifiFields.style.display = 'none';

        // Storage
        setToggleBtn('storage-layout', 'lvm');
        setVal('storage-disk', '/dev/sda');
        setChecked('storage-encrypt', false);
        setVal('storage-encrypt-password', '');
        const encFields = document.getElementById('storage-encrypt-fields');
        if (encFields) encFields.style.display = 'none';
        const customFields = document.getElementById('storage-custom-fields');
        if (customFields) customFields.style.display = 'none';
        const partList = document.getElementById('partitions-list');
        if (partList) partList.innerHTML = '';

        // SSH
        setChecked('ssh-install', true);
        setChecked('ssh-pwauth', false);
        setVal('ssh-authorized-keys', '');
        setChecked('ssh-allow-import', false);
        const sshImportFields = document.getElementById('ssh-import-fields');
        if (sshImportFields) sshImportFields.style.display = 'none';

        // Users
        const usersList = document.getElementById('users-list');
        if (usersList) usersList.innerHTML = '';

        // Packages
        document.querySelectorAll('#popular-packages input').forEach(cb => { cb.checked = false; });
        setVal('packages-extra', '');

        // Snaps
        const snapsList = document.getElementById('snaps-list');
        if (snapsList) snapsList.innerHTML = '';
        document.querySelectorAll('#popular-snaps .chip-btn').forEach(btn => {
            btn.classList.remove('added');
        });

        // Updates
        setVal('updates-policy', 'security');

        // Late commands
        setVal('late-commands-editor', '');

        // Early commands
        setVal('early-commands-editor', '');

        // Advanced
        setChecked('advanced-drivers', false);
        setChecked('advanced-codecs', false);
        setChecked('advanced-oem', false);
        setVal('advanced-proxy', '');
        setChecked('advanced-shutdown', false);
    }

    // ========================= HELPERS =========================

    function setVal(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value !== null && value !== undefined ? String(value) : '';
    }

    function setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = !!checked;
    }

    function setToggleBtn(targetId, value) {
        const hidden = document.getElementById(targetId);
        if (hidden) hidden.value = value;

        const buttons = document.querySelectorAll(`.toggle-btn[data-target="${targetId}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    // ========================= API PÚBLICA =========================

    return {
        apply,
        getInfo,
        listAll,
        resetAllForms
    };

})();
