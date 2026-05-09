/**
 * ============================================================================
 * Ubuntu Autoinstall YAML Generator
 * Módulo: yamlParser.js
 * 
 * Parser YAML simplificado para importar arquivos YAML de autoinstall
 * e preencher os formulários da interface.
 * Suporta o subset de YAML usado pelo Ubuntu Autoinstall.
 * ============================================================================
 */

const YAMLParser = (() => {
    'use strict';

    // ========================= PARSER YAML BÁSICO =========================

    /**
     * Parse simples de YAML para objeto JavaScript
     * Suporta: scalars, mappings, sequences, strings com aspas, comentários
     * Não suporta: anchors, aliases, tags, multi-document, flow collections complexas
     */
    function parse(yamlText) {
        if (!yamlText || typeof yamlText !== 'string') return null;

        const lines = yamlText.split('\n');
        const result = {};
        const stack = [{ obj: result, indent: -1 }];
        let i = 0;

        while (i < lines.length) {
            const rawLine = lines[i];
            i++;

            // Remove comentários (fora de strings)
            const line = removeComment(rawLine);

            // Pula linhas vazias
            if (line.trim() === '') continue;

            // Calcula indentação
            const indent = line.search(/\S/);
            const content = line.trim();

            // Pula diretivas YAML (---, ...)
            if (content === '---' || content === '...') continue;

            // Verifica se é item de lista
            const isList = content.startsWith('- ');

            // Volta o stack para o nível correto
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                // Se for lista e o indent é igual, verifica se o parent é array
                if (isList && stack[stack.length - 1].indent === indent && Array.isArray(stack[stack.length - 1].obj)) {
                    break;
                }
                stack.pop();
            }

            const parent = stack[stack.length - 1];

            if (isList) {
                const listContent = content.substring(2).trim();

                // Se o parent não é um array, precisamos criar um
                if (!Array.isArray(parent.obj)) {
                    // O último key do parent deve virar array
                    continue; // Simplificação — tratado pelo key: handler
                }

                // Verifica se o item da lista é um mapping inline
                if (listContent.includes(': ')) {
                    const itemObj = {};
                    // Parse o primeiro par key: value
                    const colonIdx = listContent.indexOf(': ');
                    const key = listContent.substring(0, colonIdx).trim();
                    const val = parseScalar(listContent.substring(colonIdx + 2).trim());
                    itemObj[key] = val;

                    // Verifica próximas linhas para mais propriedades do mesmo item
                    const itemIndent = indent + 2;
                    while (i < lines.length) {
                        const nextLine = removeComment(lines[i]);
                        if (nextLine.trim() === '') { i++; continue; }
                        const nextIndent = nextLine.search(/\S/);
                        if (nextIndent < itemIndent) break;
                        if (nextIndent === itemIndent || nextIndent > itemIndent) {
                            const nextContent = nextLine.trim();
                            if (nextContent.startsWith('- ')) break;
                            const nColonIdx = nextContent.indexOf(': ');
                            if (nColonIdx > 0) {
                                const nKey = nextContent.substring(0, nColonIdx).trim();
                                const nVal = parseScalar(nextContent.substring(nColonIdx + 2).trim());
                                itemObj[nKey] = nVal;
                            }
                            i++;
                        } else {
                            break;
                        }
                    }

                    parent.obj.push(itemObj);
                } else {
                    // Item simples
                    parent.obj.push(parseScalar(listContent));
                }

            } else if (content.includes(': ')) {
                // Key: Value pair
                const colonIdx = content.indexOf(': ');
                const key = content.substring(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
                const rawVal = content.substring(colonIdx + 2).trim();

                if (rawVal === '' || rawVal === '|' || rawVal === '>') {
                    // Sub-object ou block scalar
                    // Verifica próxima linha
                    if (i < lines.length) {
                        const nextLine = lines[i];
                        const nextTrimmed = removeComment(nextLine).trim();
                        const nextIndent = nextLine.search(/\S/);

                        if (nextIndent > indent && nextTrimmed.startsWith('- ')) {
                            // É uma lista
                            const arr = [];
                            setNestedValue(parent.obj, key, arr);
                            stack.push({ obj: arr, indent: nextIndent, key });
                        } else if (nextIndent > indent) {
                            // Sub-objeto
                            const subObj = {};
                            setNestedValue(parent.obj, key, subObj);
                            stack.push({ obj: subObj, indent: nextIndent, key });
                        } else {
                            // Empty value
                            setNestedValue(parent.obj, key, rawVal === '|' ? '' : null);
                        }
                    } else {
                        setNestedValue(parent.obj, key, null);
                    }
                } else {
                    // Inline value
                    // Verifica se é inline array [a, b, c]
                    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
                        const items = rawVal.slice(1, -1).split(',').map(s => parseScalar(s.trim()));
                        setNestedValue(parent.obj, key, items);
                    } else {
                        setNestedValue(parent.obj, key, parseScalar(rawVal));
                    }
                }

            } else if (content.endsWith(':')) {
                // Key sem valor (sub-objeto)
                const key = content.slice(0, -1).trim().replace(/^['"]|['"]$/g, '');

                if (i < lines.length) {
                    const nextLine = lines[i];
                    const nextTrimmed = removeComment(nextLine).trim();
                    const nextIndent = nextLine.search(/\S/);

                    if (nextIndent > indent && nextTrimmed.startsWith('- ')) {
                        const arr = [];
                        setNestedValue(parent.obj, key, arr);
                        stack.push({ obj: arr, indent: nextIndent, key });
                    } else if (nextIndent > indent) {
                        const subObj = {};
                        setNestedValue(parent.obj, key, subObj);
                        stack.push({ obj: subObj, indent: nextIndent, key });
                    } else {
                        setNestedValue(parent.obj, key, {});
                    }
                } else {
                    setNestedValue(parent.obj, key, {});
                }
            }
        }

        return result;
    }

    function setNestedValue(obj, key, value) {
        if (Array.isArray(obj)) {
            // Se o parent é array, adiciona como objeto
            const item = {};
            item[key] = value;
            obj.push(item);
        } else {
            obj[key] = value;
        }
    }

    function removeComment(line) {
        // Remove comentários que não estão dentro de strings
        let inSingle = false, inDouble = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === "'" && !inDouble) inSingle = !inSingle;
            else if (ch === '"' && !inSingle) inDouble = !inDouble;
            else if (ch === '#' && !inSingle && !inDouble) {
                // Verifica se o # é precedido por espaço (YAML spec)
                if (i === 0 || line[i - 1] === ' ') {
                    return line.substring(0, i);
                }
            }
        }
        return line;
    }

    function parseScalar(val) {
        if (val === '' || val === 'null' || val === '~') return null;
        if (val === 'true' || val === 'yes') return true;
        if (val === 'false' || val === 'no') return false;

        // Remove aspas
        if ((val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith('"') && val.endsWith('"'))) {
            return val.slice(1, -1);
        }

        // Número
        if (/^-?\d+$/.test(val)) return parseInt(val, 10);
        if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);

        return val;
    }

    // ========================= IMPORTAR PARA FORMULÁRIO =========================

    /**
     * Importa um objeto parseado do YAML para os formulários
     */
    function importToForm(data) {
        if (!data) return;

        // O autoinstall pode estar wrapped em "autoinstall:" key
        const ai = data.autoinstall || data;

        // Identity
        if (ai.identity) {
            setVal('identity-hostname', ai.identity.hostname);
            setVal('identity-realname', ai.identity.realname);
            setVal('identity-username', ai.identity.username);
            // Não importamos a senha hash, apenas mostramos que existe
            if (ai.identity.password) {
                document.getElementById('identity-password').placeholder = '(hash importado)';
                document.getElementById('identity-password').dataset.importedHash = ai.identity.password;
            }
        }

        // Locale
        if (ai.locale) {
            setVal('locale-lang', ai.locale);
        }

        // Timezone
        if (ai.timezone) {
            setVal('locale-timezone', ai.timezone);
        }

        // Keyboard
        if (ai.keyboard) {
            setVal('keyboard-layout', ai.keyboard.layout);
            setVal('keyboard-variant', ai.keyboard.variant);
        }

        // Network
        if (ai.network) {
            importNetwork(ai.network);
        }

        // Storage
        if (ai.storage) {
            importStorage(ai.storage);
        }

        // SSH
        if (ai.ssh) {
            importSSH(ai.ssh);
        }

        // Users (from user-data)
        if (ai['user-data'] && ai['user-data'].users) {
            importUsers(ai['user-data'].users);
        }

        // Packages
        if (ai.packages) {
            importPackages(ai.packages);
        }

        // Snaps
        if (ai.snaps) {
            importSnaps(ai.snaps);
        }

        // Updates
        if (ai.updates) {
            setVal('updates-policy', ai.updates);
        }

        // Early-commands
        if (ai['early-commands']) {
            importEarlyCommands(ai['early-commands']);
        }

        // Late-commands
        if (ai['late-commands']) {
            importLateCommands(ai['late-commands']);
        }

        // Advanced
        if (ai.proxy) {
            setVal('advanced-proxy', ai.proxy);
        }
        if (ai.drivers && ai.drivers.install) {
            setChecked('advanced-drivers', true);
        }
        if (ai.codecs && ai.codecs.install) {
            setChecked('advanced-codecs', true);
        }
        if (ai.oem && ai.oem.install) {
            setChecked('advanced-oem', true);
        }
        if (ai.shutdown === 'poweroff') {
            setChecked('advanced-shutdown', true);
        }
    }

    function importNetwork(net) {
        if (net.ethernets) {
            const ifaces = Object.keys(net.ethernets);
            if (ifaces.length > 0) {
                const iface = ifaces[0];
                const cfg = net.ethernets[iface];

                setVal('network-interface', iface);

                if (cfg.dhcp4 === true) {
                    setToggle('network-method', 'dhcp');
                } else {
                    setToggle('network-method', 'static');
                    // Show static fields
                    const staticFields = document.getElementById('network-static-fields');
                    if (staticFields) staticFields.style.display = '';

                    if (cfg.addresses && cfg.addresses.length > 0) {
                        setVal('network-address', cfg.addresses[0]);
                    }
                    if (cfg.gateway4) {
                        setVal('network-gateway', cfg.gateway4);
                    }
                    if (cfg.nameservers) {
                        if (cfg.nameservers.addresses) {
                            setVal('network-dns', cfg.nameservers.addresses.join(', '));
                        }
                        if (cfg.nameservers.search) {
                            setVal('network-search', cfg.nameservers.search.join(', '));
                        }
                    }
                }
            }
        }

        if (net.wifis) {
            setChecked('network-wifi-enable', true);
            const wifiFields = document.getElementById('network-wifi-fields');
            if (wifiFields) wifiFields.style.display = '';

            const wifis = Object.keys(net.wifis);
            if (wifis.length > 0) {
                const cfg = net.wifis[wifis[0]];
                if (cfg['access-points']) {
                    const ssids = Object.keys(cfg['access-points']);
                    if (ssids.length > 0) {
                        setVal('network-wifi-ssid', ssids[0]);
                        if (cfg['access-points'][ssids[0]].password) {
                            setVal('network-wifi-password', cfg['access-points'][ssids[0]].password);
                        }
                    }
                }
            }
        }
    }

    function importStorage(storage) {
        if (storage.layout) {
            const name = storage.layout.name || 'lvm';
            setToggle('storage-layout', name);
            if (storage.layout.password) {
                setChecked('storage-encrypt', true);
                const encFields = document.getElementById('storage-encrypt-fields');
                if (encFields) encFields.style.display = '';
                setVal('storage-encrypt-password', storage.layout.password);
            }
        }
    }

    function importSSH(ssh) {
        setChecked('ssh-install', ssh['install-server'] !== false);
        if (ssh['allow-pw'] !== undefined) {
            setChecked('ssh-pwauth', ssh['allow-pw']);
        }
        if (ssh['authorized-keys'] && Array.isArray(ssh['authorized-keys'])) {
            setVal('ssh-authorized-keys', ssh['authorized-keys'].join('\n'));
        }
    }

    function importUsers(users) {
        if (!Array.isArray(users)) return;
        // Usa a API do UI para adicionar usuários
        users.forEach(user => {
            if (typeof UI !== 'undefined' && UI.addUser) {
                UI.addUser(user);
            }
        });
    }

    function importPackages(packages) {
        if (!Array.isArray(packages)) return;

        // Marca chips populares
        packages.forEach(pkg => {
            const chip = document.querySelector(`#popular-packages input[value="${pkg}"]`);
            if (chip) {
                chip.checked = true;
            }
        });

        // Pacotes extras (não encontrados nos chips)
        const chipValues = Array.from(document.querySelectorAll('#popular-packages input')).map(i => i.value);
        const extras = packages.filter(p => !chipValues.includes(p));
        if (extras.length > 0) {
            setVal('packages-extra', extras.join('\n'));
        }
    }

    function importSnaps(snaps) {
        if (!Array.isArray(snaps)) return;
        snaps.forEach(snap => {
            if (typeof UI !== 'undefined' && UI.addSnap) {
                UI.addSnap(snap);
            }
        });
    }

    function importEarlyCommands(cmds) {
        if (!Array.isArray(cmds)) return;
        setVal('early-commands-editor', cmds.join('\n'));
    }

    function importLateCommands(cmds) {
        if (!Array.isArray(cmds)) return;
        setVal('late-commands-editor', cmds.join('\n'));
    }

    // ========================= HELPERS =========================

    function setVal(id, value) {
        const el = document.getElementById(id);
        if (el && value !== null && value !== undefined) {
            el.value = String(value);
        }
    }

    function setChecked(id, checked) {
        const el = document.getElementById(id);
        if (el) el.checked = !!checked;
    }

    function setToggle(targetId, value) {
        const hidden = document.getElementById(targetId);
        if (hidden) hidden.value = value;

        // Atualiza botões de toggle
        const buttons = document.querySelectorAll(`.toggle-btn[data-target="${targetId}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    // ========================= API PÚBLICA =========================

    return {
        parse,
        importToForm
    };

})();
