/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: app.js
 * 
 * Módulo principal que orquestra todos os outros módulos.
 * Inicialização, binding de eventos globais, import/export, atualização YAML.
 * ============================================================================
 */

const App = (() => {
    'use strict';

    // Debounce timer para atualização do YAML
    let updateTimer = null;
    const UPDATE_DELAY = 150; // ms

    // ========================= INICIALIZAÇÃO =========================

    function init() {
        console.log('[App] Inicializando Ubuntu Autoinstall YAML Generator...');

        // Inicializa UI
        UI.init();

        // Bind eventos globais dos formulários
        bindFormEvents();

        // Bind botões da topbar
        bindTopBarActions();

        // Bind evento customizado de atualização
        document.addEventListener('yaml-update', () => {
            scheduleUpdate();
        });

        // Gera YAML inicial
        scheduleUpdate();

        // Keyboard shortcuts
        bindKeyboardShortcuts();

        console.log('[App] Inicialização completa.');
    }

    // ========================= FORM EVENTS =========================

    /**
     * Conecta todos os campos de formulário ao sistema de atualização em tempo real
     */
    function bindFormEvents() {
        // Todos os inputs de texto, selects, textareas
        const formElements = document.querySelectorAll(
            '#main-content input[type="text"], ' +
            '#main-content input[type="password"], ' +
            '#main-content input[type="number"], ' +
            '#main-content input[type="email"], ' +
            '#main-content select, ' +
            '#main-content textarea'
        );

        formElements.forEach(el => {
            el.addEventListener('input', () => scheduleUpdate());
            el.addEventListener('change', () => scheduleUpdate());
        });

        // Todos os checkboxes
        const checkboxes = document.querySelectorAll('#main-content input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => scheduleUpdate());
        });

        // Hidden inputs (toggles)
        const hiddenInputs = document.querySelectorAll('#main-content input[type="hidden"]');
        hiddenInputs.forEach(h => {
            h.addEventListener('change', () => scheduleUpdate());
        });
    }

    // ========================= TOPBAR ACTIONS =========================

    function bindTopBarActions() {
        // Importar YAML
        const btnImport = document.getElementById('btn-import');
        const fileInput = document.getElementById('file-input');
        if (btnImport && fileInput) {
            btnImport.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileImport);
        }

        // Exportar / Baixar YAML
        const btnExport = document.getElementById('btn-export');
        if (btnExport) {
            btnExport.addEventListener('click', handleExport);
        }

        // Resetar
        const btnReset = document.getElementById('btn-reset');
        if (btnReset) {
            btnReset.addEventListener('click', handleReset);
        }

        // Profile selector
        const profileSelect = document.getElementById('profile-select');
        if (profileSelect) {
            profileSelect.addEventListener('change', handleProfileChange);
        }
    }

    // ========================= IMPORT =========================

    function handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const t = I18n ? I18n.t.bind(I18n) : (k) => k;

        // Verifica extensão
        const validExtensions = ['.yaml', '.yml', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
            UI.showToast(t('app.import.invalid_format'), 'error');
            return;
        }

        // Verifica tamanho (máx 1MB)
        if (file.size > 1024 * 1024) {
            UI.showToast(t('app.import.file_too_large'), 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const yamlText = event.target.result;

            try {
                // Parse o YAML
                const parsed = YAMLParser.parse(yamlText);

                if (!parsed || Object.keys(parsed).length === 0) {
                    UI.showToast(t('app.import.empty_or_invalid'), 'error');
                    return;
                }

                // Valida
                const validation = Validator.validateYAML(yamlText);
                if (!validation.valid) {
                    const errors = validation.issues.filter(i => i.type === 'error');
                    UI.showModal(
                        t('app.import.warnings_title'),
                        `<p>${t('app.import.warnings_content')}</p>
                         <ul style="color: var(--color-warning); font-size: 0.85rem; padding-left: 20px;">
                            ${validation.issues.map(i => `<li>${UI.escapeHtml(i.message)}</li>`).join('')}
                         </ul>
                         <p>Os dados foram importados mesmo assim.</p>`,
                        [{ label: t('app.import.button'), class: 'primary' }]
                    );
                }

                // Reseta e importa
                Profiles.resetAllForms();
                YAMLParser.importToForm(parsed);

                // Atualiza profile selector
                const profileSelect = document.getElementById('profile-select');
                if (profileSelect) profileSelect.value = 'custom';

                scheduleUpdate();
                UI.showToast(t('app.import.success').replace('%s', file.name), 'success');

            } catch (err) {
                console.error('[App] Erro ao importar YAML:', err);
                UI.showToast(t('app.import.error').replace('%s', err.message), 'error');
            }
        };

        reader.onerror = () => {
            UI.showToast(t('app.import.read_error'), 'error');
        };

        reader.readAsText(file);

        // Reset file input para permitir reimportação do mesmo arquivo
        e.target.value = '';
    }

    // ========================= EXPORT =========================

    function handleExport() {
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        const yamlText = UI.isEditing
            ? document.getElementById('yaml-editor')?.value
            : YAMLGenerator.generate();

        if (!yamlText || yamlText.trim() === '') {
            UI.showToast(t('app.export.empty'), 'warning');
            return;
        }

        // Validação antes do download
        const validation = Validator.validateAll(yamlText);
        if (!validation.valid) {
            const errors = validation.issues.filter(i => i.type === 'error');
            UI.showModal(
                t('app.export.errors_title'),
                `<p>${t('app.export.errors_content')}</p>
                 <ul style="color: var(--color-danger); font-size: 0.85rem; padding-left: 20px;">
                    ${errors.map(e => `<li>${UI.escapeHtml(e.message)}</li>`).join('')}
                 </ul>
                 <p>Deseja baixar mesmo assim?</p>`,
                [
                    { label: t('app.export.cancel'), class: '' },
                    { label: t('app.export.download_anyway'), class: 'primary', action: () => downloadYAML(yamlText) }
                ]
            );
            return;
        }

        // Verifica warnings
        const warnings = validation.issues.filter(i => i.type === 'warning');
        if (warnings.length > 0) {
            UI.showModal(
                t('app.export.warnings_title'),
                `<p>${t('app.export.warnings_content')}</p>
                 <ul style="color: var(--color-warning); font-size: 0.85rem; padding-left: 20px;">
                    ${warnings.map(w => `<li>${UI.escapeHtml(w.message)}</li>`).join('')}
                 </ul>
                 <p>Deseja prosseguir com o download?</p>`,
                [
                    { label: t('app.export.review'), class: '' },
                    { label: t('app.export.download'), class: 'primary', action: () => downloadYAML(yamlText) }
                ]
            );
            return;
        }

        downloadYAML(yamlText);
    }

    function downloadYAML(yamlText) {
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        const blob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Nome baseado no hostname
        const hostname = document.getElementById('identity-hostname')?.value?.trim() || 'autoinstall';
        link.href = url;
        link.download = `user-data-${hostname}.yaml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        UI.showToast(t('app.export.success').replace('%s', link.download), 'success');
    }

    // ========================= RESET =========================

    function handleReset() {
        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        UI.showModal(
            t('app.reset.title'),
            `<p>${t('app.reset.content')}</p>`,
            [
                { label: t('app.reset.cancel'), class: '' },
                {
                    label: t('app.reset.reset_all'), class: 'danger', action: () => {
                        Profiles.resetAllForms();
                        const profileSelect = document.getElementById('profile-select');
                        if (profileSelect) profileSelect.value = 'custom';
                        scheduleUpdate();
                        UI.showToast('toast.reset', 'info');
                    }
                }
            ]
        );
    }

    // ========================= PROFILES =========================

    function handleProfileChange(e) {
        const profileId = e.target.value;

        if (profileId === 'custom') {
            // Não faz nada, mantém o estado atual
            return;
        }

        const profile = Profiles.getInfo(profileId);
        if (!profile) return;

        const t = I18n ? I18n.t.bind(I18n) : (k) => k;
        
        UI.showModal(
            t('app.profile.title').replace('%s', profile.name),
            `<p>${UI.escapeHtml(profile.description)}</p>
             <p style="margin-top:12px; color: var(--color-warning); font-size: 0.85rem;">
                <i class="fas fa-exclamation-triangle"></i> 
                ${t('app.profile.warning')}
             </p>`,
            [
                {
                    label: t('app.profile.cancel'), class: '', action: () => {
                        // Reseta o select para custom
                        const select = document.getElementById('profile-select');
                        if (select) select.value = 'custom';
                    }
                },
                {
                    label: t('app.profile.apply').replace('%s', profile.name), class: 'primary', action: () => {
                        Profiles.apply(profileId);
                        scheduleUpdate();
                        UI.showToast('toast.profile_applied', 'success');
                    }
                }
            ]
        );
    }

    // ========================= YAML UPDATE =========================

    /**
     * Agenda uma atualização do YAML com debounce
     */
    function scheduleUpdate() {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
            performUpdate();
        }, UPDATE_DELAY);
    }

    /**
     * Executa a atualização do YAML
     */
    function performUpdate() {
        try {
            const yamlText = YAMLGenerator.generate();
            UI.updateYAMLPreview(yamlText);
            updateSectionBadges();
        } catch (err) {
            console.error('[App] Erro ao gerar YAML:', err);
        }
    }

    /**
     * Atualiza os badges (contadores) na sidebar
     */
    function updateSectionBadges() {
        // Packages count
        const pkgCount = document.querySelectorAll('#popular-packages input:checked').length;
        const extraPkgs = document.getElementById('packages-extra')?.value?.trim();
        const extraCount = extraPkgs ? extraPkgs.split('\n').filter(l => l.trim()).length : 0;
        setBadge('badge-packages', pkgCount + extraCount);

        // Snaps count
        const snapCount = document.querySelectorAll('#snaps-list .snap-item').length;
        setBadge('badge-snaps', snapCount);

        // Users count
        const userCount = document.querySelectorAll('#users-list .user-item').length;
        setBadge('badge-users', userCount);

        // Late commands count
        const cmds = document.getElementById('late-commands-editor')?.value?.trim();
        const cmdCount = cmds ? cmds.split('\n').filter(l => l.trim()).length : 0;
        setBadge('badge-latecommands', cmdCount);

        // Early commands count
        const earlyCmds = document.getElementById('early-commands-editor')?.value?.trim();
        const earlyCmdCount = earlyCmds ? earlyCmds.split('\n').filter(l => l.trim()).length : 0;
        setBadge('badge-earlycommands', earlyCmdCount);

        // SSH keys count
        const sshKeys = document.getElementById('ssh-authorized-keys')?.value?.trim();
        const keyCount = sshKeys ? sshKeys.split('\n').filter(l => l.trim()).length : 0;
        const sshInstalled = document.getElementById('ssh-install')?.checked;
        setBadge('badge-ssh', sshInstalled ? (keyCount > 0 ? keyCount : '') : '');

        // Identity filled?
        const hostname = document.getElementById('identity-hostname')?.value?.trim();
        const username = document.getElementById('identity-username')?.value?.trim();
        setBadge('badge-identity', (hostname && username) ? '✓' : '');

        // Network method
        const netMethod = document.getElementById('network-method')?.value;
        setBadge('badge-network', netMethod === 'static' ? 'Static' : '');

        // Storage layout
        const storageLayout = document.getElementById('storage-layout')?.value;
        if (storageLayout && storageLayout !== 'lvm') {
            setBadge('badge-storage', storageLayout.toUpperCase());
        } else {
            setBadge('badge-storage', '');
        }
    }

    function setBadge(id, value) {
        const badge = document.getElementById(id);
        if (!badge) return;

        if (value && value !== 0 && value !== '') {
            badge.textContent = String(value);
            badge.hidden = false;
        } else {
            badge.hidden = true;
        }
    }

    // ========================= KEYBOARD SHORTCUTS =========================

    function bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S — Baixar YAML
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleExport();
            }

            // Ctrl+O — Importar YAML
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                document.getElementById('file-input')?.click();
            }

            // Escape — Fechar modal / sair fullscreen
            if (e.key === 'Escape') {
                UI.closeModal();
                const panel = document.getElementById('yaml-panel');
                if (panel?.classList.contains('fullscreen')) {
                    panel.classList.remove('fullscreen');
                    const btn = document.getElementById('btn-fullscreen-yaml');
                    if (btn) {
                        btn.innerHTML = '<i class="fas fa-expand"></i>';
                        btn.title = 'Tela cheia';
                    }
                }
            }
        });
    }

    // ========================= API PÚBLICA =========================

    return {
        init
    };

})();

// ========================= BOOTSTRAP =========================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
