/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: ui.js
 * 
 * Controle da interface: navegação, formulários dinâmicos, listas editáveis
 * (usuários, partições, snaps), toggles, toasts e modais.
 * ============================================================================
 */

const UI = (() => {
    'use strict';

    // Contadores para IDs únicos
    let userCounter = 0;
    let partitionCounter = 0;
    let snapCounter = 0;

    // ========================= NAVEGAÇÃO SIDEBAR =========================

    function initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                if (!section) return;

                // Atualiza nav
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Atualiza seção visível
                document.querySelectorAll('.config-section').forEach(s => s.classList.remove('active'));
                const target = document.getElementById(`section-${section}`);
                if (target) target.classList.add('active');

                // Fecha sidebar mobile
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth <= 1024 && sidebar) {
                    sidebar.classList.remove('open');
                }
            });
        });
    }

    // ========================= TOGGLE GROUPS =========================

    function initToggles() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                const value = btn.dataset.value;
                if (!target) return;

                // Atualiza botões do grupo
                const group = btn.parentElement;
                group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Atualiza hidden input
                const hidden = document.getElementById(target);
                if (hidden) {
                    hidden.value = value;
                    hidden.dispatchEvent(new Event('change'));
                }

                // Lógica condicional por target
                handleToggleChange(target, value);
            });
        });
    }

    function handleToggleChange(target, value) {
        // Network: mostra/esconde campos estáticos
        if (target === 'network-method') {
            const staticFields = document.getElementById('network-static-fields');
            if (staticFields) {
                staticFields.style.display = value === 'static' ? '' : 'none';
            }
        }

        // Storage: mostra/esconde campos personalizados
        if (target === 'storage-layout') {
            const customFields = document.getElementById('storage-custom-fields');
            if (customFields) {
                customFields.style.display = value === 'custom' ? '' : 'none';
            }
        }
    }

    // ========================= CHECKBOX CONDICIONAIS =========================

    function initConditionalFields() {
        // SSH install toggle
        const sshInstall = document.getElementById('ssh-install');
        const sshFields = document.getElementById('ssh-fields');
        if (sshInstall && sshFields) {
            sshInstall.addEventListener('change', () => {
                sshFields.style.display = sshInstall.checked ? '' : 'none';
            });
        }

        // SSH import toggle
        const sshImport = document.getElementById('ssh-allow-import');
        const sshImportFields = document.getElementById('ssh-import-fields');
        if (sshImport && sshImportFields) {
            sshImport.addEventListener('change', () => {
                sshImportFields.style.display = sshImport.checked ? '' : 'none';
            });
        }

        // Storage encrypt toggle
        const storageEncrypt = document.getElementById('storage-encrypt');
        const encryptFields = document.getElementById('storage-encrypt-fields');
        if (storageEncrypt && encryptFields) {
            storageEncrypt.addEventListener('change', () => {
                encryptFields.style.display = storageEncrypt.checked ? '' : 'none';
            });
        }

        // Wi-Fi toggle
        const wifiEnable = document.getElementById('network-wifi-enable');
        const wifiFields = document.getElementById('network-wifi-fields');
        if (wifiEnable && wifiFields) {
            wifiEnable.addEventListener('change', () => {
                wifiFields.style.display = wifiEnable.checked ? '' : 'none';
            });
        }

        // Password visibility toggle
        const togglePw = document.getElementById('toggle-password');
        const pwInput = document.getElementById('identity-password');
        if (togglePw && pwInput) {
            togglePw.addEventListener('click', () => {
                const isPassword = pwInput.type === 'password';
                pwInput.type = isPassword ? 'text' : 'password';
                togglePw.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            });
        }
    }

    // ========================= LISTAS DINÂMICAS: USUÁRIOS =========================

    function initUsersList() {
        const btn = document.getElementById('btn-add-user');
        if (btn) {
            btn.addEventListener('click', () => addUser());
        }
        renderUsersEmptyState();
    }

    function addUser(data = {}) {
        userCounter++;
        const id = `user-${userCounter}`;
        const container = document.getElementById('users-list');
        if (!container) return;

        // Remove empty state
        const empty = container.querySelector('.empty-state');
        if (empty) empty.remove();

        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        const tUser = t('toast.user');
        const tUsername = t('users.username');
        const tUsernamePh = t('users.username.placeholder');
        const tGecos = t('users.gecos');
        const tGecosPh = t('users.gecos.placeholder');
        const tGroups = t('users.groups');
        const tGroupsHint = t('users.groups.hint');
        const tGroupsPh = t('users.groups.placeholder');
        const tShell = t('users.shell');
        const tShellPh = t('users.shell.placeholder');
        const tSudo = t('users.sudo');
        const tLock = t('users.lock_passwd');

        const item = document.createElement('div');
        item.className = 'list-item user-item';
        item.id = id;
        item.innerHTML = `
            <div class="list-item-header">
                <h4><i class="fas fa-user"></i> ${tUser} #${userCounter}</h4>
                <button type="button" class="btn-remove-item" data-target="${id}" title="${t('users.remove')}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>${tUsername}</label>
                    <input type="text" class="user-name" placeholder="${tUsernamePh}" value="${escapeAttr(data.name || '')}">
                </div>
                <div class="form-group">
                    <label>${tGecos}</label>
                    <input type="text" class="user-gecos" placeholder="${tGecosPh}" value="${escapeAttr(data.gecos || '')}">
                </div>
                <div class="form-group">
                    <label>${tGroups}</label>
                    <input type="text" class="user-groups" placeholder="${tGroupsPh}" value="${escapeAttr(data.groups || '')}">
                    <small class="hint">${tGroupsHint}</small>
                </div>
                <div class="form-group">
                    <label>${tShell}</label>
                    <input type="text" class="user-shell" placeholder="${tShellPh}" value="${escapeAttr(data.shell || '/bin/bash')}">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" class="user-sudo" ${data.sudo ? 'checked' : ''}>
                        <span>${tSudo}</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" class="user-lock-passwd" ${data.lock_passwd !== false ? 'checked' : ''}>
                        <span>${tLock}</span>
                    </label>
                </div>
            </div>
        `;

        container.appendChild(item);

        // Remove button
        item.querySelector('.btn-remove-item').addEventListener('click', () => {
            item.remove();
            renderUsersEmptyState();
            triggerUpdate();
        });

        // Bind change events para atualizar YAML
        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', triggerUpdate);
            input.addEventListener('change', triggerUpdate);
        });

        triggerUpdate();
    }

    function renderUsersEmptyState() {
        const container = document.getElementById('users-list');
        if (!container) return;
        if (container.children.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>${I18n ? I18n.t('users.empty') : 'No additional users configured.'}</p>
                </div>
            `;
        }
    }

    // ========================= LISTAS DINÂMICAS: PARTIÇÕES =========================

    function initPartitionsList() {
        const btn = document.getElementById('btn-add-partition');
        if (btn) {
            btn.addEventListener('click', () => addPartition());
        }
    }

    function addPartition(data = {}) {
        partitionCounter++;
        const id = `partition-${partitionCounter}`;
        const container = document.getElementById('partitions-list');
        if (!container) return;

        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        const tPart = t('toast.partition');
        const tSize = t('storage.partition.size');
        const tSizeHint = t('storage.partition.size_hint');
        const tSizePh = '512M, 20G, -1';
        const tFs = t('storage.partition.fstype');
        const tMount = t('storage.partition.mount');
        const tMountPh = t('storage.partition.mount_placeholder');

        const item = document.createElement('div');
        item.className = 'list-item partition-item';
        item.id = id;
        item.innerHTML = `
            <div class="list-item-header">
                <h4><i class="fas fa-database"></i> ${tPart} #${partitionCounter}</h4>
                <button type="button" class="btn-remove-item" data-target="${id}" title="${t('storage.remove_partition')}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>${tSize}</label>
                    <input type="text" class="part-size" placeholder="${tSizePh}" value="${escapeAttr(data.size || '')}">
                    <small class="hint">${tSizeHint}</small>
                </div>
                <div class="form-group">
                    <label>${tFs}</label>
                    <select class="part-fs">
                        <option value="ext4" ${data.fstype === 'ext4' ? 'selected' : ''}>ext4</option>
                        <option value="ext3" ${data.fstype === 'ext3' ? 'selected' : ''}>ext3</option>
                        <option value="xfs" ${data.fstype === 'xfs' ? 'selected' : ''}>xfs</option>
                        <option value="btrfs" ${data.fstype === 'btrfs' ? 'selected' : ''}>btrfs</option>
                        <option value="swap" ${data.fstype === 'swap' ? 'selected' : ''}>swap</option>
                        <option value="fat32" ${data.fstype === 'fat32' || data.fstype === 'vfat' ? 'selected' : ''}>fat32 (EFI)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>${tMount}</label>
                    <input type="text" class="part-mount" placeholder="${tMountPh}" value="${escapeAttr(data.mount || '')}">
                </div>
            </div>
        `;

        container.appendChild(item);

        // Remove button
        item.querySelector('.btn-remove-item').addEventListener('click', () => {
            item.remove();
            triggerUpdate();
        });

        // Bind changes
        item.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', triggerUpdate);
            el.addEventListener('change', triggerUpdate);
        });

        triggerUpdate();
    }

    // ========================= LISTAS DINÂMICAS: SNAPS =========================

    function initSnapsList() {
        const btn = document.getElementById('btn-add-snap');
        if (btn) {
            btn.addEventListener('click', () => addSnap());
        }

        // Popular snap buttons
        document.querySelectorAll('#popular-snaps .chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const snapName = btn.dataset.snap;
                const channel = btn.dataset.channel || 'latest/stable';
                const classic = btn.dataset.classic === 'true';

                if (btn.classList.contains('added')) {
                    // Remove snap
                    btn.classList.remove('added');
                    removeSnapByName(snapName);
                } else {
                    btn.classList.add('added');
                    addSnap({ name: snapName, channel, classic });
                }
            });
        });

        renderSnapsEmptyState();
    }

    function addSnap(data = {}) {
        snapCounter++;
        const id = `snap-${snapCounter}`;
        const container = document.getElementById('snaps-list');
        if (!container) return;

        // Remove empty state
        const empty = container.querySelector('.empty-state');
        if (empty) empty.remove();

        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        const tSnap = t('toast.snap');
        const tAdd = t('snaps.add');
        const tName = t('snaps.name');
        const tNamePh = t('snaps.name.placeholder');
        const tChannel = t('snaps.channel');
        const tChannelPh = t('snaps.channel.placeholder');
        const tClassic = t('snaps.classic');

        const item = document.createElement('div');
        item.className = 'list-item snap-item';
        item.id = id;
        item.dataset.snapName = data.name || '';
        item.innerHTML = `
            <div class="list-item-header">
                <h4><i class="fas fa-puzzle-piece"></i> ${tSnap}: ${escapeHtml(data.name || tAdd)}</h4>
                <button type="button" class="btn-remove-item" data-target="${id}" title="${t('snaps.remove')}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>${tName}</label>
                    <input type="text" class="snap-name" placeholder="${tNamePh}" value="${escapeAttr(data.name || '')}">
                </div>
                <div class="form-group">
                    <label>${tChannel}</label>
                    <input type="text" class="snap-channel" placeholder="${tChannelPh}" value="${escapeAttr(data.channel || 'latest/stable')}">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" class="snap-classic" ${data.classic ? 'checked' : ''}>
                        <span>${tClassic}</span>
                    </label>
                </div>
            </div>
        `;

        container.appendChild(item);

        // Remove button
        item.querySelector('.btn-remove-item').addEventListener('click', () => {
            const snapName = item.dataset.snapName;
            item.remove();
            renderSnapsEmptyState();
            // Unmark popular snap button
            const popBtn = document.querySelector(`#popular-snaps .chip-btn[data-snap="${snapName}"]`);
            if (popBtn) popBtn.classList.remove('added');
            triggerUpdate();
        });

        // Bind changes
        item.querySelectorAll('input').forEach(el => {
            el.addEventListener('input', triggerUpdate);
            el.addEventListener('change', triggerUpdate);
        });

        triggerUpdate();
    }

    function removeSnapByName(name) {
        const container = document.getElementById('snaps-list');
        if (!container) return;
        const items = container.querySelectorAll('.snap-item');
        items.forEach(item => {
            const nameInput = item.querySelector('.snap-name');
            if (nameInput && nameInput.value.trim() === name) {
                item.remove();
            }
        });
        renderSnapsEmptyState();
        triggerUpdate();
    }

    function renderSnapsEmptyState() {
        const container = document.getElementById('snaps-list');
        if (!container) return;
        if (container.querySelectorAll('.snap-item').length === 0) {
            const empty = container.querySelector('.empty-state');
            if (!empty) {
                const div = document.createElement('div');
                div.className = 'empty-state';
                div.innerHTML = `
                    <i class="fas fa-puzzle-piece"></i>
                    <p>${I18n ? I18n.t('snaps.empty') : 'No snaps configured.'}</p>
                `;
                container.appendChild(div);
            }
        }
    }

    // ========================= COMMANDS SUGGESTIONS =========================

    function initSuggestions() {
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                if (!cmd) return;

                // Determine which section we're in based on closest section
                const section = btn.closest('.config-section');
                let editorId = 'late-commands-editor';
                
                if (section && section.id === 'section-earlycommands') {
                    editorId = 'early-commands-editor';
                }

                const editor = document.getElementById(editorId);
                if (!editor) return;

                const current = editor.value.trim();
                if (current.includes(cmd)) {
                    showToast('toast.cmd_exists', 'warning');
                    return;
                }

                editor.value = current ? current + '\n' + cmd : cmd;
                triggerUpdate();
                showToast('toast.cmd_added', 'success');
            });
        });
    }

    // ========================= YAML PANEL CONTROLS =========================

    let isEditing = false;

    function initYAMLPanel() {
        // Copy button
        const copyBtn = document.getElementById('btn-copy-yaml');
        if (copyBtn) {
            copyBtn.addEventListener('click', copyYAML);
        }

        // Edit button
        const editBtn = document.getElementById('btn-edit-yaml');
        if (editBtn) {
            editBtn.addEventListener('click', toggleYAMLEdit);
        }

        // Fullscreen button
        const fsBtn = document.getElementById('btn-fullscreen-yaml');
        if (fsBtn) {
            fsBtn.addEventListener('click', toggleFullscreen);
        }

        // YAML editor changes
        const editor = document.getElementById('yaml-editor');
        if (editor) {
            editor.addEventListener('input', () => {
                updateYAMLStatus(editor.value);
            });
        }
    }

    function copyYAML() {
        const yamlText = isEditing
            ? document.getElementById('yaml-editor')?.value
            : getCurrentYAML();

        if (!yamlText) {
            showToast('toast.nothing_copy', 'warning');
            return;
        }

        navigator.clipboard.writeText(yamlText).then(() => {
            showToast('toast.copied', 'success');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = yamlText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('toast.copied', 'success');
        });
    }

    function toggleYAMLEdit() {
        const preview = document.getElementById('yaml-preview');
        const editor = document.getElementById('yaml-editor');
        const editBtn = document.getElementById('btn-edit-yaml');
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;

        if (!preview || !editor) return;

        isEditing = !isEditing;

        if (isEditing) {
            // Entra no modo edição
            editor.value = getCurrentYAML();
            preview.hidden = true;
            editor.hidden = false;
            editor.focus();
            editBtn.innerHTML = '<i class="fas fa-check"></i>';
            editBtn.title = t('yaml.edit_apply');
            showToast('toast.yaml_edited', 'info');
        } else {
            // Sai do modo edição — importa o YAML editado
            const yamlText = editor.value;
            preview.hidden = false;
            editor.hidden = true;
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = t('yaml.edit_title');

            // Tenta importar o YAML editado para o formulário
            try {
                const parsed = YAMLParser.parse(yamlText);
                if (parsed) {
                    Profiles.resetAllForms();
                    YAMLParser.importToForm(parsed);
                    showToast('toast.yaml_imported', 'success');
                }
            } catch (e) {
                showToast('toast.yaml_error ' + e.message, 'error');
            }

            triggerUpdate();
        }
    }

    function toggleFullscreen() {
        const panel = document.getElementById('yaml-panel');
        const btn = document.getElementById('btn-fullscreen-yaml');
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        if (!panel) return;

        panel.classList.toggle('fullscreen');

        if (panel.classList.contains('fullscreen')) {
            btn.innerHTML = '<i class="fas fa-compress"></i>';
            btn.title = t('yaml.fullscreen_exit');
        } else {
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            btn.title = t('yaml.fullscreen');
        }
    }

    function getCurrentYAML() {
        const output = document.getElementById('yaml-output');
        return output ? output.textContent : '';
    }

    // ========================= YAML DISPLAY =========================

    function updateYAMLPreview(yamlText) {
        if (isEditing) return; // Não atualiza se estiver editando manualmente

        const output = document.getElementById('yaml-output');
        if (!output) return;

        // Aplica syntax highlighting
        output.innerHTML = highlightYAML(yamlText);

        // Atualiza status
        updateYAMLStatus(yamlText);
    }

    function highlightYAML(text) {
        if (!text) return '';

        return text.split('\n').map(line => {
            // Comentários
            if (line.trim().startsWith('#')) {
                return `<span class="yaml-comment">${escapeHtml(line)}</span>`;
            }

            let result = '';
            const leadingSpaces = line.match(/^(\s*)/)[1];
            const content = line.trimStart();

            result += escapeHtml(leadingSpaces);

            // Lista marker
            if (content.startsWith('- ')) {
                result += '<span class="yaml-list-marker">-</span> ';
                const rest = content.substring(2);
                result += highlightKeyValue(rest);
            } else {
                result += highlightKeyValue(content);
            }

            return result;
        }).join('\n');
    }

    function highlightKeyValue(text) {
        // Key: Value
        const colonIdx = text.indexOf(': ');
        if (colonIdx > 0) {
            const key = text.substring(0, colonIdx);
            const value = text.substring(colonIdx + 2);
            return `<span class="yaml-key">${escapeHtml(key)}</span>: ${highlightValue(value)}`;
        }

        // Key apenas (com : no final)
        if (text.endsWith(':')) {
            return `<span class="yaml-key">${escapeHtml(text.slice(0, -1))}</span>:`;
        }

        // Valor avulso
        return highlightValue(text);
    }

    function highlightValue(val) {
        const trimmed = val.trim();

        // Boolean
        if (trimmed === 'true' || trimmed === 'false') {
            return `<span class="yaml-value-bool">${escapeHtml(val)}</span>`;
        }

        // Number
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return `<span class="yaml-value-number">${escapeHtml(val)}</span>`;
        }

        // Null
        if (trimmed === 'null' || trimmed === '~') {
            return `<span class="yaml-value-bool">${escapeHtml(val)}</span>`;
        }

        // Pipe / block scalar
        if (trimmed === '|' || trimmed === '>') {
            return `<span class="yaml-pipe">${escapeHtml(val)}</span>`;
        }

        // String
        if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
            return `<span class="yaml-value-string">${escapeHtml(val)}</span>`;
        }

        // Inline array
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            return `<span class="yaml-value-string">${escapeHtml(val)}</span>`;
        }

        return `<span class="yaml-value-string">${escapeHtml(val)}</span>`;
    }

    function updateYAMLStatus(yamlText) {
        const lineCount = document.getElementById('yaml-line-count');
        const validationStatus = document.getElementById('yaml-validation-status');
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;

        if (lineCount) {
            const count = yamlText ? yamlText.split('\n').length : 0;
            lineCount.textContent = `${count} ${t('yaml.lines')}`;
        }

        if (validationStatus && yamlText) {
            const result = Validator.validateYAML(yamlText);
            if (result.valid) {
                const warnings = result.issues.filter(i => i.type === 'warning');
                if (warnings.length > 0) {
                    validationStatus.className = 'status-warning';
                    const warnText = warnings.length === 1 ? t('yaml.warnings').replace('(s)', '') : t('yaml.warnings');
                    validationStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${warnings.length} ${warnText}`;
                    validationStatus.title = warnings.map(w => w.message).join('\n');
                } else {
                    validationStatus.className = 'status-ok';
                    validationStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${t('yaml.valid')}`;
                    validationStatus.title = '';
                }
            } else {
                const errors = result.issues.filter(i => i.type === 'error');
                validationStatus.className = 'status-error';
                const errText = errors.length === 1 ? t('yaml.errors').replace('(s)', '') : t('yaml.errors');
                validationStatus.innerHTML = `<i class="fas fa-times-circle"></i> ${errors.length} ${errText}`;
                validationStatus.title = errors.map(e => e.message).join('\n');
            }
        }
    }

    // ========================= TOASTS =========================

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        let msg = message;
        if (typeof I18n !== 'undefined') {
            const translated = I18n.t(message);
            if (translated !== message) {
                msg = translated;
            }
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${escapeHtml(msg)}</span>`;
        container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ========================= MODAL =========================

    function showModal(title, bodyHTML, buttons = []) {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');

        if (!overlay) return;

        titleEl.textContent = title;
        bodyEl.innerHTML = bodyHTML;

        // Buttons
        footerEl.innerHTML = '';
        buttons.forEach(btnDef => {
            const btn = document.createElement('button');
            btn.className = `action-btn ${btnDef.class || ''}`;
            btn.textContent = btnDef.label;
            btn.addEventListener('click', () => {
                if (btnDef.action) btnDef.action();
                closeModal();
            });
            footerEl.appendChild(btn);
        });

        overlay.classList.remove('hidden');

        // Close on overlay click - only add once
        if (!overlay.dataset.closeListenerAdded) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
            overlay.dataset.closeListenerAdded = 'true';
        }

        // Close button - only add once
        const closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn && !closeBtn.dataset.listenerAdded) {
            closeBtn.addEventListener('click', closeModal);
            closeBtn.dataset.listenerAdded = 'true';
        }
    }

    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    // ========================= SIDEBAR TOGGLE =========================

    function initSidebarToggle() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.toggle('open');
                } else {
                    sidebar.classList.toggle('collapsed');
                }
            });
        }

        // YAML panel toggle on mobile
        const yamlPanel = document.getElementById('yaml-panel');
        if (yamlPanel) {
            const panelHeader = yamlPanel.querySelector('.panel-header');
            if (panelHeader && window.innerWidth <= 1024) {
                panelHeader.style.cursor = 'pointer';
                panelHeader.addEventListener('click', () => {
                    yamlPanel.classList.toggle('open');
                });
            }
        }
    }

    // ========================= TRIGGER UPDATE =========================

    /** Dispara evento global para atualizar o YAML */
    function triggerUpdate() {
        document.dispatchEvent(new CustomEvent('yaml-update'));
    }

    // ========================= UTILITÁRIOS =========================

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ========================= SSH KEYS FETCH =========================

    function initSSHFetch() {
        const btn = document.getElementById('btn-fetch-ssh-keys');
        if (btn) {
            btn.addEventListener('click', fetchSSHKeys);
        }
    }

    async function fetchSSHKeys() {
        const source = document.getElementById('ssh-import-source')?.value;
        const username = document.getElementById('ssh-import-id')?.value?.trim();

        if (!username) {
            showToast('toast.enter_username', 'warning');
            return;
        }

        const btn = document.getElementById('btn-fetch-ssh-keys');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (I18n ? I18n.t('toast.fetching') : 'Fetching...');
        btn.disabled = true;

        try {
            let keys = [];

            if (source === 'gh') {
                keys = await fetchGitHubKeys(username);
            } else if (source === 'lp') {
                keys = await fetchLaunchpadKeys(username);
            }

            if (keys.length === 0) {
                showToast('toast.no_keys', 'warning');
                return;
            }

            const keysTextarea = document.getElementById('ssh-authorized-keys');
            const existingKeys = keysTextarea.value.trim();
            const existingLines = existingKeys ? existingKeys.split('\n').filter(k => k.trim()) : [];

            const newKeys = keys.filter(k => !existingLines.some(ek => ek.includes(k.split(' ')[1])));
            
            if (newKeys.length === 0) {
                showToast('toast.keys_exist', 'info');
                return;
            }

            if (existingKeys) {
                keysTextarea.value = existingKeys + '\n' + newKeys.join('\n');
            } else {
                keysTextarea.value = newKeys.join('\n');
            }

            triggerUpdate();
            showToast('toast.keys_fetched', 'success');

        } catch (err) {
            console.error('Error fetching SSH keys:', err);
            showToast('toast.keys_error', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    async function fetchGitHubKeys(username) {
        const response = await fetch(`https://api.github.com/users/${username}/keys`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuário não encontrado no GitHub');
            }
            throw new Error('Erro ao acessar API do GitHub');
        }

        const data = await response.json();
        return data.map(item => `ssh-rsa ${item.key} ${username}@github`);
    }

    async function fetchLaunchpadKeys(username) {
        const response = await fetch(`https://launchpad.net/~${username}/+sshkeys`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuário não encontrado no Launchpad');
            }
            throw new Error('Erro ao acessar Launchpad');
        }

        const text = await response.text();
        const keys = [];
        const matches = text.matchAll(/ssh-[\w]+ [A-Za-z0-9+\/]+/g);
        for (const match of matches) {
            keys.push(`${match[0]} ${username}@launchpad`);
        }
        return keys;
    }

    // ========================= INICIALIZAÇÃO =========================

    // ========================= RESIZE PANEL =========================

    function initResizePanel() {
        const handle = document.getElementById('yaml-resize-handle');
        const panel = document.getElementById('yaml-panel');
        if (!handle || !panel) return;

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = panel.offsetWidth;
            handle.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const diff = startX - e.clientX;
            let newWidth = startWidth + diff;
            
            const minWidth = 280;
            const maxWidth = 800;
            
            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;
            
            panel.style.width = newWidth + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    function init() {
        initNavigation();
        initToggles();
        initConditionalFields();
        initUsersList();
        initPartitionsList();
        initSnapsList();
        initSuggestions();
        initYAMLPanel();
        initSidebarToggle();
        initSSHFetch();
        initResizePanel();
    }

    // ========================= API PÚBLICA =========================

    return {
        init,
        addUser,
        addPartition,
        addSnap,
        showToast,
        showModal,
        closeModal,
        updateYAMLPreview,
        triggerUpdate,
        getCurrentYAML,
        escapeHtml,
        get isEditing() { return isEditing; }
    };

})();
