/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: i18n.js
 * 
 * Sistema de internacionalização (i18n)
 * Suporta: Inglês (default), Português
 * ============================================================================
 */

const I18n = (() => {
    'use strict';

    const translations = {
        en: {
            // Topbar
            'app.title': 'Autoinstall YAML Generator',
            'app.subtitle': 'YAML Generator',
            'profile.label': 'Profile',
            'profile.custom': 'Custom',
            'profile.server': 'Server',
            'profile.server_name': 'Server',
            'profile.server_desc': 'Ubuntu server configuration optimized for server use. SSH enabled, essential administration packages, LVM layout.',
            'profile.desktop': 'Desktop',
            'profile.desktop_name': 'Desktop',
            'profile.desktop_desc': 'Ubuntu Desktop configuration for workstation. Includes drivers, codecs and common desktop applications.',
            'profile.minimal': 'Minimal',
            'profile.minimal_name': 'Minimal',
            'profile.minimal_desc': 'Minimal Ubuntu installation. Only the essential, no extra packages.',
            'profile.kiosk': 'Kiosk',
            'profile.kiosk_name': 'Kiosk',
            'profile.kiosk_desc': 'Configuration for kiosk/quiosque terminal. Auto-login, fullscreen, no external SSH access.',
            'btn.import': 'Import',
            'btn.export': 'Download YAML',
            'btn.reset': 'Reset',

            // Navigation
            'nav.identity': 'Identity',
            'nav.locale': 'Localization',
            'nav.keyboard': 'Keyboard',
            'nav.network': 'Network',
            'nav.storage': 'Storage',
            'nav.ssh': 'SSH',
            'nav.users': 'Users',
            'nav.packages': 'Packages',
            'nav.snaps': 'Snaps',
            'nav.updates': 'Updates',
            'nav.earlycommands': 'Early-Commands',
            'nav.latecommands': 'Late-Commands',
            'nav.advanced': 'Advanced',
            'nav.docs': 'Official Documentation',

            // Identity Section
            'section.identity.title': 'Identity',
            'section.identity.desc': 'Main user, hostname and password configuration. Autoinstall identity block.',
            'identity.hostname': 'Hostname',
            'identity.hostname.hint': 'Machine name on network (no spaces or special characters)',
            'identity.hostname.placeholder': 'ubuntu-server',
            'identity.realname': 'Full Name',
            'identity.realname.hint': 'User real name (display name)',
            'identity.realname.placeholder': 'Administrator',
            'identity.username': 'Username',
            'identity.username.hint': 'Login user (lowercase letters, no spaces)',
            'identity.username.placeholder': 'admin',
            'identity.password': 'Password',
            'identity.password.hint': 'Will be converted to SHA-512 hash in generated YAML',
            'identity.password.placeholder': '••••••••',
            'identity.password_show': 'Show/hide password',
            'identity.required': 'Required',

            // Locale Section
            'section.locale.title': 'Localization',
            'section.locale.desc': 'Language and timezone settings.',
            'locale.lang': 'Locale / Language',
            'locale.timezone': 'Timezone',

            // Keyboard Section
            'section.keyboard.title': 'Keyboard',
            'section.keyboard.desc': 'Keyboard layout and variant.',
            'keyboard.layout': 'Layout',
            'keyboard.variant': 'Variant',
            'keyboard.variant.hint': 'Ex: "intl", "nodeadkeys", "dvorak" (leave empty for default)',
            'keyboard.variant.placeholder': '(optional)',

            // Network Section
            'section.network.title': 'Network',
            'section.network.desc': 'Network configuration via Netplan.',
            'network.method': 'Configuration Method',
            'network.dhcp': 'DHCP',
            'network.static': 'Static IP',
            'network.disabled': 'Disabled',
            'network.interface': 'Interface',
            'network.interface.hint': 'ex: eth0, ens3, enp0s3',
            'network.address': 'IP Address (CIDR)',
            'network.address.hint': 'ex: 192.168.1.100/24',
            'network.gateway': 'Gateway',
            'network.dns': 'DNS Servers',
            'network.dns.hint': 'Separate with comma',
            'network.search': 'Search Domains',
            'network.search.hint': 'Comma-separated',
            'network.wifi': 'Enable Wi-Fi',
            'network.wifi.ssid': 'SSID',
            'network.wifi.password': 'Wi-Fi Password',
            'network.wifi.placeholder': 'MyNetwork',
            'network.wifi.pass_placeholder': '••••••••',
            'network.gateway.placeholder': '192.168.1.1',
            'network.dns.placeholder': '8.8.8.8, 8.8.4.4',
            'network.search.placeholder': 'example.com',

            // Storage Section
            'section.storage.title': 'Storage',
            'section.storage.desc': 'Disk and partitioning configuration.',
            'storage.layout': 'Layout Mode',
            'storage.lvm': 'LVM (Recommended)',
            'storage.direct': 'Direct',
            'storage.zfs': 'ZFS',
            'storage.custom': 'Custom',
            'storage.layout_mode': 'Layout Mode',
            'storage.partitions': 'Custom Partitions',
            'storage.disk': 'Target Disk',
            'storage.disk.hint': 'ex: /dev/sda, /dev/vda, /dev/nvme0n1',
            'storage.disk.placeholder': '/dev/sda',
            'storage.encrypt': 'LUKS Encryption',
            'storage.encrypt.password': 'Encryption Password',
            'storage.encrypt.pass_placeholder': 'LUKS Password',
            'storage.partitions': 'Custom Partitions',
            'storage.add_partition': 'Add Partition',
            'storage.partition.size': 'Size',
            'storage.partition.size_hint': 'Ex: 512M, 20G, 100G, -1 for remaining',
            'storage.partition.fstype': 'Filesystem',
            'storage.partition.mount': 'Mount Point',
            'storage.partition.mount_placeholder': '/, /boot/efi, /home',
            'storage.remove_partition': 'Remove partition',

            // SSH Section
            'section.ssh.title': 'SSH',
            'section.ssh.desc': 'Remote access via OpenSSH. Block .',
            'ssh.install': 'Install OpenSSH server',
            'ssh.pwauth': 'Allow password authentication',
            'ssh.authorized_keys': 'Authorized Public Keys',
            'ssh.authorized_keys.hint': 'One key per line. Supported formats: ssh-rsa, ssh-ed25519, ecdsa-sha2-*',
            'ssh.authorized_keys.placeholder': 'ssh-rsa AAAA... user@host\nssh-ed25519 AAAA... user@host',
            'ssh.import_keys': 'Import from GitHub/Launchpad',
            'ssh.import.source': 'Source',
            'ssh.import.source_gh': 'GitHub',
            'ssh.import.source_lp': 'Launchpad',
            'ssh.import.id': 'User ID',
            'ssh.import.id_placeholder': 'your-github-username',
            'ssh.import.fetch': 'Fetch Keys',
            'ssh.import.hint': 'Fetches public keys from the specified account',

            // Users Section
            'section.users.title': 'Additional Users',
            'section.users.desc': 'Extra users via cloud-init. Main user is in Identity.',
            'users.add': 'Add User',
            'users.empty': 'No additional users configured.',
            'users.username': 'Username',
            'users.username.placeholder': 'username',
            'users.gecos': 'Full Name (GECOS)',
            'users.gecos.placeholder': 'Full Name',
            'users.groups': 'Groups',
            'users.groups.hint': 'Comma-separated',
            'users.groups.placeholder': 'sudo, docker, adm',
            'users.shell': 'Shell',
            'users.shell.placeholder': '/bin/bash',
            'users.sudo': 'Sudo Access (NOPASSWD)',
            'users.lock_passwd': 'Lock password login',
            'users.remove': 'Remove user',

            // Packages Section
            'section.packages.title': 'Packages',
            'section.packages.desc': 'Packages to install after the initial setup. Block.',
            'packages.popular': 'Popular Packages',
            'packages.extra': 'Additional Packages',
            'packages.extra.hint': 'One package per line. Accepts valid APT package names.',
            'packages.extra.placeholder': 'package1\npackage2\npackage3',

            // Snaps Section
            'section.snaps.title': 'Snaps',
            'section.snaps.desc': 'Snap packages to install. Block .',
            'snaps.add': 'Add Snap',
            'snaps.popular': 'Popular Snaps',
            'snaps.empty': 'No snaps configured.',
            'snaps.name': 'Snap Name',
            'snaps.name.placeholder': 'snap-name',
            'snaps.channel': 'Channel',
            'snaps.channel.placeholder': 'latest/stable',
            'snaps.classic': 'Classic confinement',
            'snaps.remove': 'Remove snap',

// Updates Section
            'section.updates.title': 'Updates',
            'section.updates.desc': 'Update policy during installation. Block .',
            'updates.policy': 'Update Policy',
            'updates.security': 'Security only (security)',
            'updates.security_desc': 'Installs only security updates.',
            'updates.all': 'All updates (all)',
            'updates.all_desc': 'Installs all updates.',

            // Early Command Section
            'section.earlycommands.title': 'Early-Commands',
            'section.earlycommands.desc': 'Commands run before installation starts. Block . Can be used for validation or preparation.',
            'earlycommands.editor': 'Commands',
            'earlycommands.hint': 'One command per line. These commands run in the Curtin environment before installation.',
            'earlycommands.placeholder': "echo 'Starting installation...'\nping -c 3 8.8.8.8",
            'earlycommands.common': 'Common Commands',

            // Late Command Section
            'section.latecommands.title': 'Late-Commands',
            'section.latecommands.desc': 'Commands run after installation. Block . The target system is at .',
            'latecommands.editor': 'Commands',
            'latecommands.hint': 'One command per line. Use  to execute on the installed system.',
            'latecommands.placeholder': "curtin in-target --target=/target -- apt-get update\ncurtin in-target --target=/target -- apt-get upgrade -y\ncurtin in-target --target=/target -- systemctl enable nginx",
            'latecommands.common': 'Common Commands',

            // Advanced Section
            'section.advanced.title': 'Advanced',
            'section.advanced.desc': 'Additional settings: autoinstall version, drivers, codecs and more.',
            'advanced.version': 'Autoinstall Version',
            'advanced.version.hint': 'Autoinstall schema version. Currently only v1 is supported.',
            'advanced.drivers': 'Install third-party drivers',
            'advanced.drivers_desc': 'Equivalent to : install: true',
            'advanced.codecs': 'Install restricted codecs',
            'advanced.codecs_desc': 'Equivalent to : install: true',
            'advanced.oem': 'OEM Mode',
            'advanced.oem_desc': 'Equivalent to : install: auto',
            'advanced.proxy': 'HTTP Proxy',
            'advanced.proxy.hint': 'Proxy for use during installation. Block .',
            'advanced.proxy.placeholder': 'http://proxy.example.com:8080',
            'advanced.shutdown': 'Shutdown after installation (instead of reboot)',
            'advanced.shutdown_desc': 'Equivalent to  (default is reboot)',

            // YAML Panel
            'yaml.title': 'YAML Preview',
            'yaml.copy': 'Copy YAML',
            'yaml.copy_title': 'Copy to clipboard',
            'yaml.edit': 'Edit YAML',
            'yaml.edit_title': 'Edit YAML manually',
            'yaml.edit_apply': 'Apply manual edit',
            'yaml.fullscreen': 'Fullscreen',
            'yaml.fullscreen_exit': 'Exit fullscreen',
            'yaml.lines': 'lines',
            'yaml.valid': 'Valid',
            'yaml.invalid': 'Invalid',
            'yaml.warnings': 'warning(s)',
            'yaml.errors': 'error(s)',

            // Modals
            'modal.import.title': 'Warnings on Import',
            'modal.import.content': 'File imported but contains possible problems:',
            'modal.import.button': 'Got it',
            'modal.export.title': 'Problems Found',
            'modal.export.content': 'YAML contains errors that may prevent installation:',
            'modal.export.cancel': 'Cancel',
            'modal.export.download_anyway': 'Download Anyway',
            'modal.warnings.title': 'Warnings',
            'modal.warnings.content': 'Warnings found:',
            'modal.warnings.review': 'Review',
            'modal.warnings.download': 'Download',
            'modal.reset.title': 'Reset Configuration',
            'modal.reset.content': 'Are you sure? All data will be lost.',
            'modal.reset.cancel': 'Cancel',
            'modal.reset.reset_all': 'Reset All',
            'modal.profile.title': 'Apply Profile',
            'modal.profile.description': 'This will replace all current configurations.',
            'modal.profile.cancel': 'Cancel',
            'modal.profile.apply': 'Apply',

            // Toast Messages
            'toast.copied': 'YAML copied to clipboard!',
            'toast.imported': 'File imported successfully!',
            'toast.downloaded': 'File downloaded successfully!',
            'toast.reset': 'Configuration reset.',
            'toast.profile_applied': 'Profile applied successfully!',
            'toast.cmd_added': 'Command added!',
            'toast.cmd_exists': 'Command already added.',
            'toast.keys_fetched': 'key(s) added!',
            'toast.no_keys': 'No public keys found.',
            'toast.keys_error': 'Error fetching keys:',
            'toast.enter_username': 'Please enter a username.',
            'toast.keys_exist': 'All keys already added.',
            'toast.yaml_empty': 'YAML empty. Configure at least one section.',
            'toast.nothing_copy': 'Nothing to copy.',
            'toast.yaml_edited': 'Manual edit mode activated.',
            'toast.yaml_imported': 'YAML imported to form!',
            'toast.yaml_error': 'Error parsing YAML:',
            'toast.fetching': 'Fetching...',
            'toast.user': 'User',
            'toast.partition': 'Partition',
            'toast.snap': 'Snap',

            // App Messages (used in app.js)
            'app.import.invalid_format': 'Invalid format. Use .yaml, .yml or .txt',
            'app.import.file_too_large': 'File too large. Maximum 1MB.',
            'app.import.empty_or_invalid': 'YAML empty or invalid.',
            'app.import.warnings_title': 'Warnings on Import',
            'app.import.warnings_content': 'File imported but contains possible problems:',
            'app.import.button': 'Got it',
            'app.import.success': 'File "%s" imported successfully!',
            'app.import.error': 'Error processing YAML file: %s',
            'app.import.read_error': 'Error reading file.',

            'app.export.empty': 'YAML empty. Configure at least one section.',
            'app.export.errors_title': 'Problems Found',
            'app.export.errors_content': 'YAML contains errors that may prevent installation:',
            'app.export.cancel': 'Cancel',
            'app.export.download_anyway': 'Download Anyway',
            'app.export.warnings_title': 'Warnings',
            'app.export.warnings_content': 'Warnings found:',
            'app.export.review': 'Review',
            'app.export.download': 'Download',
            'app.export.success': 'File "%s" downloaded successfully!',

            'app.reset.title': 'Reset Configuration',
            'app.reset.content': 'Are you sure? All data will be lost.',
            'app.reset.cancel': 'Cancel',
            'app.reset.reset_all': 'Reset All',

            'app.profile.title': 'Apply Profile: %s',
            'app.profile.description': '%s',
            'app.profile.warning': 'This will replace all current configurations.',
            'app.profile.cancel': 'Cancel',
            'app.profile.apply': 'Apply "%s"',

            'app.keyboard.ctrl_s_download': 'Download YAML',
            'app.keyboard.ctrl_o_import': 'Import YAML',
            'app.keyboard.escape_close': 'Close modal / Exit fullscreen',

            // Validation Messages
            'validation.yaml_empty': 'YAML is empty',
            'validation.yaml_no_config': 'YAML does not contain configuration',
            'validation.yaml_no_autoinstall': 'Root key "autoinstall:" is missing. Required by Ubuntu.',
            'validation.yaml_no_version': 'Required "version" field not found.',
            'validation.yaml_no_tabs': 'YAML does not allow tabs. Use spaces for indentation.',
            'validation.hostname_invalid': 'Invalid hostname. Use only letters, numbers and hyphens.',
            'validation.hostname_length': 'Hostname cannot exceed 63 characters.',
            'validation.username_invalid': 'Username must start with lowercase letter and contain only [a-z0-9_-].',
            'validation.password_short': 'Password too short. Minimum 8 characters recommended.',
            'validation.hostname_missing': 'Hostname not defined in identity block.',
            'validation.username_missing': 'Username not defined in identity block.',
            'validation.password_missing': 'Password not defined in identity block.',
            'validation.network_ip_cidr': 'IP address must be in CIDR format (e.g., 192.168.1.100/24).',
            'validation.network_gateway_ip': 'Gateway must be a valid IP.',
            'validation.storage_disk_path': 'Disk must start with /dev/ (e.g., /dev/sda, /dev/nvme0n1).',
            'validation.ssh_key_invalid': 'SSH key #%s may not have a valid format.',
            'validation.yaml_quotes': 'Possible unbalanced quotes on line %s.'
        },
        pt: {
            // Topbar
            'app.title': 'Gerador de YAML Autoinstall',
            'app.subtitle': 'Gerador de YAML',
            'profile.label': 'Perfil',
            'profile.custom': 'Personalizado',
            'profile.server': 'Servidor',
            'profile.server_name': 'Servidor',
            'profile.server_desc': 'Configuração otimizada para servidor Ubuntu. SSH habilitado, pacotes essenciais para administração, layout LVM.',
            'profile.desktop': 'Desktop',
            'profile.desktop_name': 'Desktop',
            'profile.desktop_desc': 'Configuração para estação de trabalho Ubuntu Desktop. Inclui drivers, codecs e aplicações desktop comuns.',
            'profile.minimal': 'Minimal',
            'profile.minimal_name': 'Minimal',
            'profile.minimal_desc': 'Instalação mínima do Ubuntu. Apenas o essencial, sem pacotes extras.',
            'profile.kiosk': 'Kiosk',
            'profile.kiosk_name': 'Kiosk',
            'profile.kiosk_desc': 'Configuração para terminal kiosk/quiosque. Auto-login, tela cheia, sem acesso SSH externo.',
            'btn.import': 'Importar',
            'btn.export': 'Baixar YAML',
            'btn.reset': 'Resetar',

            // Navigation
            'nav.identity': 'Identidade',
            'nav.locale': 'Localização',
            'nav.keyboard': 'Teclado',
            'nav.network': 'Rede',
            'nav.storage': 'Armazenamento',
            'nav.ssh': 'SSH',
            'nav.users': 'Usuários',
            'nav.packages': 'Pacotes',
            'nav.snaps': 'Snaps',
            'nav.updates': 'Atualizações',
            'nav.earlycommands': 'Early-Commands',
            'nav.latecommands': 'Late-Commands',
            'nav.advanced': 'Avançado',
            'nav.docs': 'Documentação Oficial',

            // Identity Section
            'section.identity.title': 'Identidade',
            'section.identity.desc': 'Configuração do usuário principal, hostname e senha. Bloco identity do autoinstall.',
            'identity.hostname': 'Hostname',
            'identity.hostname.hint': 'Nome da máquina na rede (sem espaços ou caracteres especiais)',
            'identity.hostname.placeholder': 'ubuntu-server',
            'identity.realname': 'Nome Completo',
            'identity.realname.hint': 'Nome real do usuário (nome de exibição)',
            'identity.realname.placeholder': 'Administrator',
            'identity.username': 'Nome de Usuário',
            'identity.username.hint': 'Login do usuário (letras minúsculas, sem espaços)',
            'identity.username.placeholder': 'admin',
            'identity.password': 'Senha',
            'identity.password.hint': 'Será convertida para hash SHA-512 no YAML gerado',
            'identity.password.placeholder': '••••••••',
            'identity.password_show': 'Mostrar/ocultar senha',
            'identity.required': 'Obrigatório',

            // Locale Section
            'section.locale.title': 'Localização',
            'section.locale.desc': 'Configurações de idioma e fuso horário.',
            'locale.lang': 'Locale / Idioma',
            'locale.timezone': 'Fuso Horário',

            // Keyboard Section
            'section.keyboard.title': 'Teclado',
            'section.keyboard.desc': 'Layout e variante do teclado.',
            'keyboard.layout': 'Layout',
            'keyboard.variant': 'Variante',
            'keyboard.variant.hint': 'Ex: "intl", "nodeadkeys", "dvorak" (deixe vazio para padrão)',
            'keyboard.variant.placeholder': '(opcional)',

            // Network Section
            'section.network.title': 'Rede',
            'section.network.desc': 'Configuração de rede via Netplan.',
            'network.method': 'Método de Configuração',
            'network.dhcp': 'DHCP',
            'network.static': 'IP Estático',
            'network.disabled': 'Desativado',
            'network.interface': 'Interface',
            'network.interface.hint': 'ex: eth0, ens3',
            'network.address': 'Endereço IP (CIDR)',
            'network.address.hint': 'ex: 192.168.1.100/24',
            'network.gateway': 'Gateway',
            'network.dns': 'Servidores DNS',
            'network.dns.hint': 'Separar com vírgula',
            'network.search': 'Domínios de Busca',
            'network.search.hint': 'Separados por vírgula',
            'network.wifi': 'Habilitar Wi-Fi',
            'network.wifi.ssid': 'SSID',
            'network.wifi.password': 'Senha Wi-Fi',
            'network.wifi.placeholder': 'MinhaRede',
            'network.wifi.pass_placeholder': '••••••••',
            'network.gateway.placeholder': '192.168.1.1',
            'network.dns.placeholder': '8.8.8.8, 8.8.4.4',
            'network.search.placeholder': 'example.com',

            // Storage Section
            'section.storage.title': 'Armazenamento',
            'section.storage.desc': 'Configuração de disco e particionamento.',
            'storage.layout': 'Modo de Layout',
            'storage.lvm': 'LVM (Recomendado)',
            'storage.direct': 'Direto',
            'storage.zfs': 'ZFS',
            'storage.custom': 'Personalizado',
            'storage.layout_mode': 'Modo de Layout',
            'storage.partitions': 'Partições Personalizadas',
            'storage.disk': 'Disco Alvo',
            'storage.disk.hint': 'ex: /dev/sda, /dev/vda, /dev/nvme0n1',
            'storage.disk.placeholder': '/dev/sda',
            'storage.encrypt': 'Criptografia LUKS',
            'storage.encrypt.password': 'Senha de Criptografia',
            'storage.encrypt.pass_placeholder': 'Senha LUKS',
            'storage.partitions': 'Partições Personalizadas',
            'storage.add_partition': 'Adicionar Partição',
            'storage.partition.size': 'Tamanho',
            'storage.partition.size_hint': 'Ex: 512M, 20G, 100G, -1 para usar todo espaço restante',
            'storage.partition.fstype': 'Sistema de Arquivos',
            'storage.partition.mount': 'Ponto de Montagem',
            'storage.partition.mount_placeholder': '/, /boot/efi, /home',
            'storage.remove_partition': 'Remover partição',

            // SSH Section
            'section.ssh.title': 'SSH',
            'section.ssh.desc': 'Acesso remoto via OpenSSH. Bloco .',
            'ssh.install': 'Instalar servidor OpenSSH',
            'ssh.pwauth': 'Permitir autenticação por senha',
            'ssh.authorized_keys': 'Chaves Públicas Autorizadas',
            'ssh.authorized_keys.hint': 'Uma chave por linha. Formatos suportados: ssh-rsa, ssh-ed25519, ecdsa-sha2-*',
            'ssh.authorized_keys.placeholder': 'ssh-rsa AAAA... user@host\nssh-ed25519 AAAA... user@host',
            'ssh.import_keys': 'Importar chaves do GitHub/Launchpad',
            'ssh.import.source': 'Fonte',
            'ssh.import.source_gh': 'GitHub',
            'ssh.import.source_lp': 'Launchpad',
            'ssh.import.id': 'ID do Usuário',
            'ssh.import.id_placeholder': 'seu-usuario-github',
            'ssh.import.fetch': 'Buscar Chaves',
            'ssh.import.hint': 'Busca chaves públicas da conta especificada',

            // Users Section
            'section.users.title': 'Usuários Adicionais',
            'section.users.desc': 'Usuários extras via cloud-init. O usuário principal é definido em Identidade.',
            'users.add': 'Adicionar Usuário',
            'users.empty': 'Nenhum usuário adicional configurado.',
            'users.username': 'Nome de Usuário',
            'users.username.placeholder': 'usuario',
            'users.gecos': 'Nome Completo (GECOS)',
            'users.gecos.placeholder': 'Nome Completo',
            'users.groups': 'Grupos',
            'users.groups.hint': 'Separados por vírgula',
            'users.groups.placeholder': 'sudo, docker, adm',
            'users.shell': 'Shell',
            'users.shell.placeholder': '/bin/bash',
            'users.sudo': 'Acesso sudo (NOPASSWD)',
            'users.lock_passwd': 'Bloquear login por senha',
            'users.remove': 'Remover usuário',

            // Packages Section
            'section.packages.title': 'Pacotes',
            'section.packages.desc': 'Pacotes a serem instalados após o setup inicial. Bloco .',
            'packages.popular': 'Pacotes Populares',
            'packages.extra': 'Pacotes Adicionais',
            'packages.extra.hint': 'Um pacote por linha. Aceita nomes de pacotes válidos do APT.',
            'packages.extra.placeholder': 'pacote1\npacote2\npacote3',

            // Snaps Section
            'section.snaps.title': 'Snaps',
            'section.snaps.desc': 'Pacotes Snap a serem instalados. Bloco .',
            'snaps.add': 'Adicionar Snap',
            'snaps.popular': 'Snaps Populares',
            'snaps.empty': 'Nenhum snap configurado.',
            'snaps.name': 'Nome do Snap',
            'snaps.name.placeholder': 'nome-do-snap',
            'snaps.channel': 'Channel',
            'snaps.channel.placeholder': 'latest/stable',
            'snaps.classic': 'Classic confinement',
            'snaps.remove': 'Remover snap',

// Updates Section
            'section.updates.title': 'Atualizações',
            'section.updates.desc': 'Política de atualizações durante a instalação. Bloco .',
            'updates.policy': 'Política de Atualizações',
            'updates.security': 'Apenas segurança (security)',
            'updates.security_desc': 'Instala apenas atualizações de segurança.',
            'updates.all': 'Todas as atualizações (all)',
            'updates.all_desc': 'Instala todas as atualizações.',

            // Early Command Section
            'section.earlycommands.title': 'Early-Commands',
            'section.earlycommands.desc': 'Comandos executados antes da instalação começar. Bloco . Podem ser usados para validação ou preparação.',
            'earlycommands.editor': 'Comandos',
            'earlycommands.hint': 'Um comando por linha. Estes comandos rodam no ambiente Curtin antes da instalação.',
            'earlycommands.placeholder': "echo 'Iniciando installation...'\nping -c 3 8.8.8.8",
            'earlycommands.common': 'Comandos Comuns',

            // Late Command Section
            'section.latecommands.title': 'Late-Commands',
            'section.latecommands.desc': 'Comandos executados após a instalação. Bloco . O sistema alvo está em .',
            'latecommands.editor': 'Comandos',
            'latecommands.hint': 'Um comando por linha. Use  para executar no sistema instalado.',
            'latecommands.placeholder': "curtin in-target --target=/target -- apt-get update\ncurtin in-target --target=/target -- apt-get upgrade -y\ncurtin in-target --target=/target -- systemctl enable nginx",
            'latecommands.common': 'Comandos Comuns',

            // Advanced Section
            'section.advanced.title': 'Avançado',
            'section.advanced.desc': 'Configurações adicionais: versão do autoinstall, drivers, codecs e mais.',
            'advanced.version': 'Versão do Autoinstall',
            'advanced.version.hint': 'Versão do schema autoinstall. Atualmente apenas v1 é suportada.',
            'advanced.drivers': 'Instalar drivers de terceiros',
            'advanced.drivers_desc': 'Equivale a : install: true',
            'advanced.codecs': 'Instalar codecs restritos',
            'advanced.codecs_desc': 'Equivale a : install: true',
            'advanced.oem': 'Modo OEM',
            'advanced.oem_desc': 'Equivale a : install: auto',
            'advanced.proxy': 'Proxy HTTP',
            'advanced.proxy.hint': 'Proxy para uso durante a instalação. Bloco .',
            'advanced.proxy.placeholder': 'http://proxy.example.com:8080',
            'advanced.shutdown': 'Desligar após instalação (ao invés de reiniciar)',
            'advanced.shutdown_desc': 'Equivale a  (padrão é reboot)',

// YAML Panel
            'yaml.title': 'YAML Preview',
            'yaml.copy': 'Copiar YAML',
            'yaml.copy_title': 'Copiar para área de transferência',
            'yaml.edit': 'Editar YAML',
            'yaml.edit_title': 'Editar YAML manualmente',
            'yaml.edit_apply': 'Aplicar edição manual',
            'yaml.fullscreen': 'Tela cheia',
            'yaml.fullscreen_exit': 'Sair da tela cheia',
            'yaml.lines': 'linhas',
            'yaml.valid': 'Válido',
            'yaml.invalid': 'Inválido',
            'yaml.warnings': 'aviso(s)',
            'yaml.errors': 'erro(s)',

            // Modals
            'modal.import.title': 'Avisos na Importação',
            'modal.import.content': 'Arquivo importado com possíveis problemas:',
            'modal.import.button': 'Entendido',
            'modal.export.title': 'Problemas Encontrados',
            'modal.export.content': 'YAML contém erros que podem impedir a instalação:',
            'modal.export.cancel': 'Cancelar',
            'modal.export.download_anyway': 'Baixar Mesmo Assim',
            'modal.warnings.title': 'Avisos',
            'modal.warnings.content': 'Avisos encontrados:',
            'modal.warnings.review': 'Revisar',
            'modal.warnings.download': 'Baixar',
            'modal.reset.title': 'Resetar Configuração',
            'modal.reset.content': 'Tem certeza? Todos os dados serão perdidos.',
            'modal.reset.cancel': 'Cancelar',
            'modal.reset.reset_all': 'Resetar Tudo',
            'modal.profile.title': 'Aplicar Perfil',
            'modal.profile.description': 'Isso substituirá todas as configurações.',
            'modal.profile.cancel': 'Cancelar',
            'modal.profile.apply': 'Aplicar',

            // Toast Messages
            'toast.copied': 'YAML copiado!',
            'toast.imported': 'Arquivo importado!',
            'toast.downloaded': 'Arquivo baixado!',
            'toast.reset': 'Configuração resetada.',
            'toast.profile_applied': 'Perfil aplicado!',
            'toast.cmd_added': 'Comando adicionado!',
            'toast.cmd_exists': 'Comando já adicionado.',
            'toast.keys_fetched': 'chave(s) adicionada(s)!',
            'toast.no_keys': 'Nenhuma chave encontrada.',
            'toast.keys_error': 'Erro ao buscar chaves:',
            'toast.enter_username': 'Insira um nome de usuário.',
            'toast.keys_exist': 'Todas as chaves já estão adicionadas.',
            'toast.yaml_empty': 'YAML vazio. Configure pelo menos uma seção.',
            'toast.nothing_copy': 'Nada para copiar.',
            'toast.yaml_edited': 'Modo de edição ativado.',
            'toast.yaml_imported': 'YAML importado!',
            'toast.yaml_error': 'Erro ao parsear YAML:',
            'toast.fetching': 'Buscando...',
            'toast.user': 'Usuário',
            'toast.partition': 'Partição',
            'toast.snap': 'Snap',

            // App Messages (used in app.js)
            'app.import.invalid_format': 'Formato inválido. Use .yaml, .yml ou .txt',
            'app.import.file_too_large': 'Arquivo muito grande. Máximo 1MB.',
            'app.import.empty_or_invalid': 'YAML vazio ou inválido.',
            'app.import.warnings_title': 'Avisos na Importação',
            'app.import.warnings_content': 'Arquivo importado com possíveis problemas:',
            'app.import.button': 'Entendido',
            'app.import.success': 'Arquivo "%s" importado com sucesso!',
            'app.import.error': 'Erro ao processar o arquivo YAML: %s',
            'app.import.read_error': 'Erro ao ler o arquivo.',

            'app.export.empty': 'YAML vazio. Configure pelo menos uma seção.',
            'app.export.errors_title': 'Problemas Encontrados',
            'app.export.errors_content': 'YAML contém erros que podem impedir a instalação:',
            'app.export.cancel': 'Cancelar',
            'app.export.download_anyway': 'Baixar Mesmo Assim',
            'app.export.warnings_title': 'Avisos',
            'app.export.warnings_content': 'Avisos encontrados:',
            'app.export.review': 'Revisar',
            'app.export.download': 'Baixar',
            'app.export.success': 'Arquivo "%s" baixado com sucesso!',

            'app.reset.title': 'Resetar Configuração',
            'app.reset.content': 'Tem certeza? Todos os dados serão perdidos.',
            'app.reset.cancel': 'Cancelar',
            'app.reset.reset_all': 'Resetar Tudo',

            'app.profile.title': 'Aplicar Perfil: %s',
            'app.profile.description': '%s',
            'app.profile.warning': 'Isso substituirá todas as configurações atuais.',
            'app.profile.cancel': 'Cancelar',
            'app.profile.apply': 'Aplicar "%s"',

            'app.keyboard.ctrl_s_download': 'Baixar YAML',
            'app.keyboard.ctrl_o_import': 'Importar YAML',
            'app.keyboard.escape_close': 'Fechar modal / Sair da tela cheia',

            // Validation Messages
            'validation.yaml_empty': 'YAML está vazio',
            'validation.yaml_no_config': 'YAML não contém configuração',
            'validation.yaml_no_autoinstall': 'Falta a chave raiz "autoinstall:". Requerida pelo Ubuntu.',
            'validation.yaml_no_version': 'Campo obrigatório "version" não encontrado.',
            'validation.yaml_no_tabs': 'YAML não permite tabs. Use espaços para indentação.',
            'validation.hostname_invalid': 'Hostname inválido. Use apenas letras, números e hifens.',
            'validation.hostname_length': 'Hostname não pode exceder 63 caracteres.',
            'validation.username_invalid': 'Nome de usuário deve iniciar com letra minúscula e conter apenas [a-z0-9_-].',
            'validation.password_short': 'Senha muito curta. Recomendado mínimo de 8 caracteres.',
            'validation.hostname_missing': 'Hostname não definido no bloco identity.',
            'validation.username_missing': 'Username não definido no bloco identity.',
            'validation.password_missing': 'Senha não definida no bloco identity.',
            'validation.network_ip_cidr': 'Endereço IP deve estar no formato CIDR (ex: 192.168.1.100/24).',
            'validation.network_gateway_ip': 'Gateway deve ser um IP válido.',
            'validation.storage_disk_path': 'Disco deve iniciar com /dev/ (ex: /dev/sda, /dev/nvme0n1).',
            'validation.ssh_key_invalid': 'Chave SSH #%s pode não ter formato válido.',
            'validation.yaml_quotes': 'Possíveis aspas desbalanceadas na linha %s.'
        }
    };

    let currentLocale = 'en';

    function init() {
        const savedLocale = localStorage.getItem('i18n-locale');
        if (savedLocale && translations[savedLocale]) {
            currentLocale = savedLocale;
        } else {
            currentLocale = 'en';
            localStorage.setItem('i18n-locale', 'en');
        }
        applyTranslations();
    }

    function setLocale(locale) {
        if (translations[locale]) {
            currentLocale = locale;
            localStorage.setItem('i18n-locale', locale);
            applyTranslations();
            return true;
        }
        return false;
    }

    function getLocale() {
        return currentLocale;
    }

    function t(key) {
        return translations[currentLocale]?.[key] || translations['en']?.[key] || key;
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            if (translation) {
                if (el.tagName === 'OPTION') {
                    el.textContent = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
    }

    return {
        init,
        setLocale,
        getLocale,
        t,
        applyTranslations
    };
})();