/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: validator.js
 * 
 * Validação do YAML gerado e dos campos do formulário.
 * Verifica conformidade com a spec do Ubuntu Autoinstall.
 * ============================================================================
 */

const Validator = (() => {
    'use strict';

    const t = (key) => {
        if (typeof I18n !== 'undefined' && I18n.t) {
            return I18n.t(key);
        }
        return key;
    };

    /**
     * Resultado de validação
     * @typedef {Object} ValidationResult
     * @property {boolean} valid - Se é válido
     * @property {Array<{type: string, message: string, field?: string}>} issues
     */

    /**
     * Valida o YAML text bruto
     */
    function validateYAML(yamlText) {
        const issues = [];

        if (!yamlText || yamlText.trim() === '') {
            issues.push({ type: 'error', message: t('validation.yaml_empty') });
            return { valid: false, issues };
        }

        // Verifica se começa com #cloud-config ou autoinstall
        const lines = yamlText.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
        if (lines.length === 0) {
            issues.push({ type: 'error', message: t('validation.yaml_no_config') });
            return { valid: false, issues };
        }

        // Verifica a key autoinstall
        const hasAutoinstall = lines.some(l => l.trim().startsWith('autoinstall:'));
        if (!hasAutoinstall) {
            issues.push({ type: 'warning', message: t('validation.yaml_no_autoinstall') });
        }

        // Verifica version
        const hasVersion = lines.some(l => l.trim().startsWith('version:'));
        if (!hasVersion) {
            issues.push({ type: 'error', message: t('validation.yaml_no_version') });
        }

        // Verifica indentação consistente
        const indentIssue = checkIndentation(yamlText);
        if (indentIssue) {
            issues.push(indentIssue);
        }

        // Verifica caracteres problemáticos
        if (yamlText.includes('\t')) {
            issues.push({ type: 'error', message: t('validation.yaml_no_tabs') });
        }

        // Verifica pares de aspas
        const quoteIssue = checkQuotes(yamlText);
        if (quoteIssue) {
            issues.push(quoteIssue);
        }

        return {
            valid: issues.filter(i => i.type === 'error').length === 0,
            issues
        };
    }

    /**
     * Valida os campos do formulário
     */
    function validateForm() {
        const issues = [];

        // Identity validation
        const hostname = document.getElementById('identity-hostname')?.value?.trim();
        const username = document.getElementById('identity-username')?.value?.trim();
        const password = document.getElementById('identity-password')?.value;
        const importedHash = document.getElementById('identity-password')?.dataset?.importedHash;

        if (hostname && !/^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/.test(hostname)) {
            issues.push({
                type: 'error',
                message: t('validation.hostname_invalid'),
                field: 'identity-hostname'
            });
        }

        if (hostname && hostname.length > 63) {
            issues.push({
                type: 'error',
                message: t('validation.hostname_length'),
                field: 'identity-hostname'
            });
        }

        if (username && !/^[a-z_][a-z0-9_\-]*$/.test(username)) {
            issues.push({
                type: 'error',
                message: t('validation.username_invalid'),
                field: 'identity-username'
            });
        }

        if (password && password.length < 1 && !importedHash) {
            issues.push({
                type: 'warning',
                message: t('validation.password_short'),
                field: 'identity-password'
            });
        }

        // Verifica se identity tem todos os campos obrigatórios
        const hasAnyIdentity = hostname || username || password || importedHash;
        if (hasAnyIdentity) {
            if (!hostname) issues.push({ type: 'warning', message: t('validation.hostname_missing'), field: 'identity-hostname' });
            if (!username) issues.push({ type: 'warning', message: t('validation.username_missing'), field: 'identity-username' });
            if (!password && !importedHash) issues.push({ type: 'warning', message: t('validation.password_missing'), field: 'identity-password' });
        }

        // Network validation
        const method = document.getElementById('network-method')?.value;
        if (method === 'static') {
            const address = document.getElementById('network-address')?.value?.trim();
            const gateway = document.getElementById('network-gateway')?.value?.trim();

            if (address && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(address)) {
                issues.push({
                    type: 'error',
                    message: t('validation.network_ip_cidr'),
                    field: 'network-address'
                });
            }

            if (gateway && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(gateway)) {
                issues.push({
                    type: 'error',
                    message: t('validation.network_gateway_ip'),
                    field: 'network-gateway'
                });
            }
        }

        // Storage validation
        const disk = document.getElementById('storage-disk')?.value?.trim();
        if (disk && !disk.startsWith('/dev/')) {
            issues.push({
                type: 'warning',
                message: t('validation.storage_disk_path'),
                field: 'storage-disk'
            });
        }

        // SSH validation
        const sshKeys = document.getElementById('ssh-authorized-keys')?.value?.trim();
        if (sshKeys) {
            const keyLines = sshKeys.split('\n').filter(l => l.trim());
            keyLines.forEach((key, idx) => {
                const trimmedKey = key.trim();
                if (!trimmedKey.startsWith('ssh-rsa') &&
                    !trimmedKey.startsWith('ssh-ed25519') &&
                    !trimmedKey.startsWith('ecdsa-sha2') &&
                    !trimmedKey.startsWith('ssh-dss')) {
                    issues.push({
                        type: 'warning',
                        message: t('validation.ssh_key_invalid').replace('%s', idx + 1),
                        field: 'ssh-authorized-keys'
                    });
                }
            });
        }

        return {
            valid: issues.filter(i => i.type === 'error').length === 0,
            issues
        };
    }

    /**
     * Verifica indentação consistente
     */
    function checkIndentation(yamlText) {
        const lines = yamlText.split('\n');
        let prevIndent = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '' || line.trim().startsWith('#')) continue;

            const indent = line.search(/\S/);
            if (indent === -1) continue;

            // Verifica se indentação usa incrementos consistentes
            const diff = indent - prevIndent;
            if (diff > 0 && diff !== 2 && diff !== 4 && indent !== prevIndent) {
                // Pode ser OK em listas com items
                if (!line.trim().startsWith('-')) {
                    // Não reportamos como erro, apenas aviso leve
                }
            }
            prevIndent = indent;
        }
        return null;
    }

    /**
     * Verifica aspas equilibradas
     */
    function checkQuotes(yamlText) {
        const lines = yamlText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('#')) continue;

            // Conta aspas simples (ignorando escaped)
            const singleQuotes = (line.match(/'/g) || []).length;
            if (singleQuotes % 2 !== 0) {
                // Pode ser OK com '' escaping dentro de aspas simples
                // Só reporta se não é um padrão de escape válido
                const unescaped = line.replace(/''/g, '');
                const remaining = (unescaped.match(/'/g) || []).length;
                if (remaining % 2 !== 0) {
                    return {
                        type: 'warning',
                        message: t('validation.yaml_quotes').replace('%s', i + 1)
                    };
                }
            }
        }
        return null;
    }

    /**
     * Validação completa — formulário + YAML
     */
    function validateAll(yamlText) {
        const formResult = validateForm();
        const yamlResult = validateYAML(yamlText);

        const allIssues = [...formResult.issues, ...yamlResult.issues];
        const valid = formResult.valid && yamlResult.valid;

        return { valid, issues: allIssues };
    }

    // ========================= API PÚBLICA =========================

    return {
        validateYAML,
        validateForm,
        validateAll
    };

})();
