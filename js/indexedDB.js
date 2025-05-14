// Inicialização do IndexedDB
const banco = 'noAzul';
const versao = 5;

const request = indexedDB.open(banco, versao);

function ultimoDiaDoMes() {
    const mes = localStorage.getItem('selectedMonth');
    const ano = localStorage.getItem('selectedYear');
    const ultimoDia = new Date(ano, mes, 0).getDate(); // mês começa de 1 a 12, mas o Date usa 0 a 11
    return `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
}

export function formatarData(data) {
    const pad = num => num.toString().padStart(2, '0');
    return `${data.getFullYear()}-${pad(data.getMonth()+1)}-${pad(data.getDate())} ` +
           `${pad(data.getHours())}:${pad(data.getMinutes())}:${pad(data.getSeconds())}`;
}


request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // Criar object store para Categoria
    if (!db.objectStoreNames.contains('categorias')) {
        const categoriaStore = db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
        categoriaStore.createIndex('nome', 'nome', { unique: false });
        categoriaStore.createIndex('tipo', 'tipo', { unique: false });
        categoriaStore.createIndex('user_id', 'user_id', { unique: false });
        categoriaStore.createIndex('created_at', 'created_at', { unique: false });
        categoriaStore.createIndex('updated_at', 'updated_at', { unique: false });
        categoriaStore.createIndex('deleted_at', 'deleted_at', { unique: false });
    }

    // Criar object store para Conta
    if (!db.objectStoreNames.contains('contas')) {
        const contaStore = db.createObjectStore('contas', { keyPath: 'id', autoIncrement: true });
        contaStore.createIndex('nome', 'nome', { unique: false });
        contaStore.createIndex('saldo_inicial', 'saldo_inicial', { unique: false });
        contaStore.createIndex('tipo', 'tipo', { unique: false });               // Separado aqui
        contaStore.createIndex('user_id', 'user_id', { unique: false });
        contaStore.createIndex('visivel', 'visivel', { unique: false });
        contaStore.createIndex('created_at', 'created_at', { unique: false });
        contaStore.createIndex('updated_at', 'updated_at', { unique: false });
        contaStore.createIndex('deleted_at', 'deleted_at', { unique: false });
    }

    // Criar object store para Transacao
    if (!db.objectStoreNames.contains('transacoes')) {
        const transacaoStore = db.createObjectStore('transacoes', { keyPath: 'id', autoIncrement: true });
        transacaoStore.createIndex('descricao', 'descricao', { unique: false });
        transacaoStore.createIndex('observacao', 'observacao', { unique: false });
        transacaoStore.createIndex('conta_id', 'conta_id', { unique: false });
        transacaoStore.createIndex('categoria_id', 'categoria_id', { unique: false });
        transacaoStore.createIndex('tipo', 'tipo', { unique: false });
        transacaoStore.createIndex('valor', 'valor', { unique: false });
        transacaoStore.createIndex('data_vencimento', 'data_vencimento', { unique: false });
        transacaoStore.createIndex('data_efetivacao', 'data_efetivacao', { unique: false });
        transacaoStore.createIndex('user_id', 'user_id', { unique: false });
        transacaoStore.createIndex('created_at', 'created_at', { unique: false });
        transacaoStore.createIndex('updated_at', 'updated_at', { unique: false });
        transacaoStore.createIndex('deleted_at', 'deleted_at', { unique: false });
    }

    // Criar object store para Orçamento
    if (!db.objectStoreNames.contains('orcamentos')) {
        const orcamentoStore = db.createObjectStore('orcamentos', { keyPath: 'id', autoIncrement: true });
        orcamentoStore.createIndex('categoria_id', 'categoria_id', { unique: false });
        orcamentoStore.createIndex('mes', 'mes', { unique: false });
        orcamentoStore.createIndex('ano', 'ano', { unique: false });
        orcamentoStore.createIndex('valor', 'valor', { unique: false });
        orcamentoStore.createIndex('user_id', 'user_id', { unique: false });
        orcamentoStore.createIndex('created_at', 'created_at', { unique: false });
        orcamentoStore.createIndex('updated_at', 'updated_at', { unique: false });
        orcamentoStore.createIndex('deleted_at', 'deleted_at', { unique: false });
    }

    console.log('Estrutura do banco criada!');
};


request.onsuccess = function(event) {
    console.log('Banco de dados aberto com sucesso');
};

request.onerror = function(event) {
    console.error('Erro ao abrir o banco de dados:', event.target.error);
};

// Funções genéricas CRUD
function adicionar(storeName, data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;

            if (storeName === 'categorias' || storeName === 'contas') {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index('nome');
                const query = index.getAll(data.nome);

                query.onsuccess = function() {
                    const result = query.result;

                    const conta = result.filter(item => item.deleted_at === null&&
                                                        item.mes === data.mes &&
                                                        item.ano === data.ano);

                    // Verifica se já existe com o mesmo nome e não deletado
                    if (conta.length > 0) {
                        console.log(`Já existe uma ${storeName} com o nome ${data.nome}`);
                        resolve(); // apenas resolve sem inserir
                    } else {
                        // Inserir o novo registro
                        const insertTransaction = db.transaction([storeName], 'readwrite');
                        const insertStore = insertTransaction.objectStore(storeName);
                        data.created_at = formatarData(new Date());
                        data.updated_at = formatarData(new Date());
                        data.deleted_at = null;
                        insertStore.add(data);
                        console.log(`Adicionado na store ${storeName}`);
                        resolve();
                    }
                };

                query.onerror = function(event) {
                    console.error('Erro na verificação de duplicidade:', event.target.error);
                    reject(event.target.error);
                };
            } else  if  (storeName === 'orcamentos') {
                const transaction = db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const index = store.index('categoria_id');
                const query = index.getAll(data.categoria_id);

                query.onsuccess = async function() {
                    const result = query.result;

                    const conta = result.filter(item => item.deleted_at === null &&
                                                        item.mes === data.mes &&
                                                        item.ano === data.ano);

                    // Verifica se já existe com o mesmo nome e não deletado
                    if (conta.length > 0) {
                        const nomeCategoria = await listarId('categorias', data.categoria_id);
                        console.log(`Já existe uma ${storeName} com o nome ${nomeCategoria.nome}`);
                        resolve(); // apenas resolve sem inserir
                    } else {
                        // Inserir o novo registro
                        const insertTransaction = db.transaction([storeName], 'readwrite');
                        const insertStore = insertTransaction.objectStore(storeName);
                        data.created_at = formatarData(new Date());
                        data.updated_at = formatarData(new Date());
                        data.deleted_at = null;
                        insertStore.add(data);
                        console.log(`Adicionado na store ${storeName}`);
                        resolve();
                    }
                };

                query.onerror = function(event) {
                    console.error('Erro na verificação de duplicidade:', event.target.error);
                    reject(event.target.error);
                };
            
            } else {
                // Para outras stores, grava direto
                const transaction = db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                data.created_at = formatarData(new Date());
                data.updated_at = formatarData(new Date());
                data.deleted_at = null;
                store.add(data);
                console.log(JSON.stringify(data));
                console.log(`Adicionado na store ${storeName}`);
                resolve();
            }


        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco:', event.target.error);
            reject(event.target.error);
        };
    });
}


function listar(storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const getAll = store.getAll();

            getAll.onsuccess = function() {
                const registros = getAll.result;

                const registrosFiltrados = registros.filter(
                    registro => registro.deleted_at === null || registro.deleted_at === undefined
                );

                resolve(registrosFiltrados);
            };

            getAll.onerror = function(event) {
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}


export async function listarId(storeName, id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const query = store.get(id);

            query.onsuccess = function() {
                const registros = query.result;
                resolve(registros);
            };
        };
    })
    
}


export async function listarContaId(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['contas'], 'readonly');
            const store = transaction.objectStore('contas');
            const query = store.get(id);

            query.onsuccess = function() {
                const registros = query.result;
                resolve(registros);
            };
        };
    });
}

export function listarCategorias(storeName,type, callback) {
    const request = indexedDB.open(banco, versao);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAll = store.index('tipo').getAll(type); 

        getAll.onsuccess = function() {
            const registros = getAll.result;
            const registrosFiltrados = registros.filter(registro => 
                                                        registro.deleted_at === null || 
                                                        registro.deleted_at === undefined ||
                                                        typeof registro.deleted_at === 'undefined');
            callback(registrosFiltrados);
        };
    };
}

export async function listarReceitas(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias', 'contas'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');
            const contaStore = transaction.objectStore('contas');

            //filtrar somentes as receitas
            const query = transacoesStore.index('tipo').getAll('R');

            query.onsuccess = async function() {
                const transacoes = query.result || [];
                const registrosFiltrados = transacoes.filter(registro => 
                                                           registro.deleted_at === null||
                                                           registro.deleted_at === undefined ||
                                                           typeof registro.deleted_at === 'undefined');

                // Ordenar as transações pela data (mais recente primeiro)
                const transacoesOrdenadas = registrosFiltrados.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                const receitasNoMes = transacoesOrdenadas.filter(transacao => {

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));


                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();
                    // console.log(dataMes, mes, dataAno, ano);
                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    receitasNoMes.map(transacao => {
                        return new Promise((resolveCategoria) => {
                            if (!transacao.categoria_id) {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(transacao.categoria_id);

                            categoriaRequest.onsuccess = function() {
                                const categoria = categoriaRequest.result;
                                transacao.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(transacao);
                            };

                            categoriaRequest.onerror = function() {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                            };
                        });
                    })
                );

                // Buscar os nomes das contas
                const transacoesComConta = await Promise.all(
                    transacoesComCategoria.map(transacao => {
                        return new Promise((resolveConta) => {
                            if (!transacao.conta_id) {
                                transacao.conta = null;
                                resolveConta(transacao);
                                return;
                            }

                            const contaRequest = contaStore.get(transacao.conta_id);

                            contaRequest.onsuccess = function() {
                                const conta = contaRequest.result;
                                transacao.conta = conta ? conta.nome : null;
                                resolveConta(transacao);
                            };

                            contaRequest.onerror = function() {
                                transacao.conta = null;
                                resolveConta(transacao);
                            };
                        });
                    })
                );

                resolve(transacoesComCategoria);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function listarReceitasFiltro(filtro) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias', 'contas'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');
            const contaStore = transaction.objectStore('contas');

            const query = transacoesStore.index('tipo').getAll('R'); // Apenas receitas

            query.onsuccess = async function () {
                let transacoes = query.result || [];

                // Remover deletados
                transacoes = transacoes.filter(registro =>
                    registro.deleted_at === null ||
                    registro.deleted_at === undefined ||
                    typeof registro.deleted_at === 'undefined'
                );

                // Aplicar filtros
                transacoes = transacoes.filter(transacao => {
                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr);
                    const dataInicio = filtro.dataInicio ? new Date(filtro.dataInicio) : null;
                    const dataFim = filtro.dataFim ? new Date(filtro.dataFim) : null;

                    if (dataInicio && data < dataInicio) return false;
                    if (dataFim && data > dataFim) return false;

                    if (filtro.categorias && filtro.categorias[0] != 0 && filtro.categorias.length > 0 && !filtro.categorias.includes(transacao.categoria_id)) {
                        return false;
                    }

                    const valor = parseFloat(transacao.valor || 0);
                    if (filtro.valorMin != null && valor < filtro.valorMin) return false;
                    if (filtro.valorMax != null && valor > filtro.valorMax) return false;

                    const efetivado = !!transacao.efetivada;

                    if (filtro.status && filtro.status.length > 0) {
                        if (efetivado && !filtro.status.includes('efetivado')) return false;
                        if (!efetivado && !filtro.status.includes('pendente')) return false;
                    }

                    if (filtro.descricao) {
                        const desc = (transacao.descricao || '').toLowerCase();
                        if (!desc.includes(filtro.descricao.toLowerCase())) return false;
                    }

                    return true;
                });

                // Calcular totais
                let totalEfetivado = 0;
                let totalPendente = 0;

                transacoes.forEach(transacao => {
                    const valor = parseFloat(transacao.valor || 0);
                    if (!!transacao.efetivada) {
                        totalEfetivado += valor;
                    } else {
                        totalPendente += valor;
                    }
                });

                // Ordenar por data (mais recente primeiro)
                const transacoesOrdenadas = transacoes.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    transacoesOrdenadas.map(transacao => {
                        return new Promise(resolveCategoria => {
                            if (!transacao.categoria_id) {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(transacao.categoria_id);
                            categoriaRequest.onsuccess = function () {
                                const categoria = categoriaRequest.result;
                                transacao.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(transacao);
                            };
                            categoriaRequest.onerror = function () {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                            };
                        });
                    })
                );

                // Buscar os nomes das contas
                const transacoesComConta = await Promise.all(
                    transacoesComCategoria.map(transacao => {
                        return new Promise(resolveConta => {
                            if (!transacao.conta_id) {
                                transacao.conta = null;
                                resolveConta(transacao);
                                return;
                            }

                            const contaRequest = contaStore.get(transacao.conta_id);
                            contaRequest.onsuccess = function () {
                                const conta = contaRequest.result;
                                transacao.conta = conta ? conta.nome : null;
                                resolveConta(transacao);
                            };
                            contaRequest.onerror = function () {
                                transacao.conta = null;
                                resolveConta(transacao);
                            };
                        });
                    })
                );

                resolve({
                    transacoes: transacoesComConta,
                    totalEfetivado,
                    totalPendente
                });
            };

            query.onerror = function (event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function listarDespesasFiltro(filtro) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias', 'contas'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');
            const contaStore = transaction.objectStore('contas');

            const query = transacoesStore.index('tipo').getAll('D'); // Apenas despesas

            query.onsuccess = async function () {
                let transacoes = query.result || [];

                // Remover deletados
                transacoes = transacoes.filter(registro =>
                    registro.deleted_at === null ||
                    registro.deleted_at === undefined ||
                    typeof registro.deleted_at === 'undefined'
                );

                // Aplicar filtros
                transacoes = transacoes.filter(transacao => {
                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr);
                    const dataInicio = filtro.dataInicio ? new Date(filtro.dataInicio) : null;
                    const dataFim = filtro.dataFim ? new Date(filtro.dataFim) : null;

                    if (dataInicio && data < dataInicio) return false;
                    if (dataFim && data > dataFim) return false;

                    if (filtro.categorias && filtro.categorias[0] != 0 && filtro.categorias.length > 0 && !filtro.categorias.includes(transacao.categoria_id)) {
                        return false;
                    }

                    const valor = parseFloat(transacao.valor || 0);
                    if (filtro.valorMin != null && valor < filtro.valorMin) return false;
                    if (filtro.valorMax != null && valor > filtro.valorMax) return false;

                    const efetivado = !!transacao.efetivada;

                    if (filtro.status && filtro.status.length > 0) {
                        if (efetivado && !filtro.status.includes('efetivado')) return false;
                        if (!efetivado && !filtro.status.includes('pendente')) return false;
                    }

                    if (filtro.descricao) {
                        const desc = (transacao.descricao || '').toLowerCase();
                        if (!desc.includes(filtro.descricao.toLowerCase())) return false;
                    }

                    return true;
                });

                // Calcular totais
                let totalEfetivado = 0;
                let totalPendente = 0;

                transacoes.forEach(transacao => {
                    const valor = parseFloat(transacao.valor || 0);
                    if (!!transacao.efetivada) {
                        totalEfetivado += valor;
                    } else {
                        totalPendente += valor;
                    }
                });

                // Ordenar por data (mais recente primeiro)
                const transacoesOrdenadas = transacoes.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    transacoesOrdenadas.map(transacao => {
                        return new Promise(resolveCategoria => {
                            if (!transacao.categoria_id) {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(transacao.categoria_id);
                            categoriaRequest.onsuccess = function () {
                                const categoria = categoriaRequest.result;
                                transacao.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(transacao);
                            };
                            categoriaRequest.onerror = function () {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                            };
                        });
                    })
                );

                // Buscar os nomes das contas
                const transacoesComConta = await Promise.all(
                    transacoesComCategoria.map(transacao => {
                        return new Promise(resolveConta => {
                            if (!transacao.conta_id) {
                                transacao.conta = null;
                                resolveConta(transacao);
                                return;
                            }

                            const contaRequest = contaStore.get(transacao.conta_id);
                            contaRequest.onsuccess = function () {
                                const conta = contaRequest.result;
                                transacao.conta = conta ? conta.nome : null;
                                resolveConta(transacao);
                            };
                            contaRequest.onerror = function () {
                                transacao.conta = null;
                                resolveConta(transacao);
                            };
                        });
                    })
                );

                resolve({
                    transacoes: transacoesComConta,
                    totalEfetivado,
                    totalPendente
                });
            };

            query.onerror = function (event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function (event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}



export async function listarDespesas(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias', 'contas'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');
            const contaStore = transaction.objectStore('contas');

            //filtrar somentes as receitas
            const query = transacoesStore.index('tipo').getAll('D');

            query.onsuccess = async function() {
                const transacoes = query.result || [];

                const registrosFiltrados = transacoes.filter(registro => 
                                                             registro.deleted_at === null||
                                                             registro.deleted_at === undefined ||
                                                             typeof registro.deleted_at === 'undefined');

                // Ordenar as transações pela data (mais recente primeiro)
                const transacoesOrdenadas = registrosFiltrados.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataA - dataB;
                });

                const receitasNoMes = transacoesOrdenadas.filter(transacao => {

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));


                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();
                    // console.log(dataMes, mes, dataAno, ano);
                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    receitasNoMes.map(transacao => {
                        return new Promise((resolveCategoria) => {
                            if (!transacao.categoria_id) {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(transacao.categoria_id);

                            categoriaRequest.onsuccess = function() {
                                const categoria = categoriaRequest.result;
                                transacao.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(transacao);
                            };

                            categoriaRequest.onerror = function() {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                            };
                        });
                    })
                );

                // Buscar os nomes das contas
                const transacoesComConta = await Promise.all(
                    transacoesComCategoria.map(transacao => {
                        return new Promise((resolveConta) => {
                            if (!transacao.conta_id) {
                                transacao.conta = null;
                                resolveConta(transacao);
                                return;
                            }

                            const contaRequest = contaStore.get(transacao.conta_id);

                            contaRequest.onsuccess = function() {
                                const conta = contaRequest.result;
                                transacao.conta = conta ? conta.nome : null;
                                resolveConta(transacao);
                            };

                            contaRequest.onerror = function() {
                                transacao.conta = null;
                                resolveConta(transacao);
                            };
                        });
                    })
                );

                resolve(transacoesComCategoria);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function listarOrcamentos(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['orcamentos', 'categorias', 'transacoes'], 'readonly');
            const orcamentosStore = transaction.objectStore('orcamentos');
            const categoriasStore = transaction.objectStore('categorias');
            // const transacoesStore = transaction.objectStore('transacoes');

            //filtrar somentes as receitas
            const query = orcamentosStore.index('mes', 'ano').getAll(parseInt(mes), parseInt(ano));

            query.onsuccess = async function() {
                const orcamentos = query.result || [];

                const registrosFiltrados = orcamentos.filter(registro => 
                                                             registro.deleted_at === null||
                                                             registro.deleted_at === undefined ||
                                                             typeof registro.deleted_at === 'undefined');

                // Ordenar os orçamentos pela data (mais recente primeiro)
                const orcamentosOrdenados = registrosFiltrados.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                // Buscar os nomes das categorias
                const orcamentosComCategoria = await Promise.all(
                    orcamentosOrdenados.map(orcamento => {
                        return new Promise((resolveCategoria) => {
                            if (!orcamento.categoria_id) {
                                orcamento.categoria = null;
                                resolveCategoria(orcamento);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(orcamento.categoria_id);

                            categoriaRequest.onsuccess = function() {
                                const categoria = categoriaRequest.result;
                                orcamento.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(orcamento);
                            };

                            categoriaRequest.onerror = function() {
                                orcamento.categoria = null;
                                resolveCategoria(orcamento);
                            };
                        });
                    })
                );

                // Buscar o total em transacoes por categoria
                const orcamentosComTotal = await Promise.all(
                    orcamentosComCategoria.map(orcamento => {
                        return new Promise((resolveTotal) => {
                            totalDespesasCategoria(orcamento.mes, orcamento.ano, orcamento.categoria_id).then(total => {
                                orcamento.total_gasto = total;
                                orcamento.diferenca = orcamento.valor - orcamento.total_gasto;
                                let percentual = (orcamento.total_gasto / orcamento.valor) * 100;
                                orcamento.percentual = percentual.toFixed(0);
                                resolveTotal(orcamento);
                            });
                        });
                    })
                );

                resolve(orcamentosComTotal);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function graficoCategorias(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['categorias', 'transacoes'], 'readonly');
            const categoriasStore = transaction.objectStore('categorias');

            //filtrar somentes as receitas
            const query = categoriasStore.getAll();

            query.onsuccess = async function() {
                const categorias = query.result || [];

                const categoriasDespesas = categorias.filter(categoria => 
                                                             categoria.tipo === "D"||
                                                             categoria.deleted_at === null||
                                                             categoria.deleted_at === undefined ||
                                                             typeof categoria.deleted_at === 'undefined');

                

                // Buscar o total em transacoes por categoria
                const categoriasTotal = await Promise.all(
                    categoriasDespesas.map(categoria => {
                        return new Promise((resolveTotal) => {
                            totalDespesasCategoria(mes, ano, categoria.id).then(total => {
                                categoria.total_gasto = total;
                                resolveTotal(categoria);
                            });
                        });
                    })
                );

                const categoriasTotalOrdenadas = categoriasTotal.sort((a, b) => b.total_gasto - a.total_gasto);

                // rertorna somente 5 regi
                resolve(categoriasTotalOrdenadas.slice(0, 5));
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}
                

//listar contas e total de transacoes na conta
export async function listarContas(status) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['contas', 'transacoes'], 'readonly');
            const contasStore = transaction.objectStore('contas');
            const transacoesStore = transaction.objectStore('transacoes');

            const query = contasStore.getAll();

            query.onsuccess = async function() {
                let contas = query.result || [];
                
                if (status === 'A') { //somente contas ativas
                    contas = contas.filter(c => c.ativa === true);
                    contas = contas.filter(c => c.visivel === true);
                }

                const registrosFiltrados = contas.filter(registro => 
                                                         registro.deleted_at === null ||
                                                         registro.deleted_at === undefined);

                // Buscar o total em transacoes por conta
                const contasComTotal = await Promise.all(
                    registrosFiltrados.map(async (conta) => {
                        conta.saldo_atual = conta.saldo_inicial;
                        try {
                            const transacoes = await listar('transacoes');
                            const total = transacoes
                                .filter(transacao => transacao.conta_id === conta.id && transacao.efetivada)
                                .reduce((total, transacao) => {
                                    const valor = transacao.tipo === 'R' ? transacao.valor : -transacao.valor;
                                    return total + valor;
                                }, 0);
                            conta.saldo_atual = parseFloat(conta.saldo_inicial) + total;
                        } catch (e) {
                            conta.saldo_atual = parseFloat(conta.saldo_inicial);
                        }
                        return conta;
                    })
                );     

                // Buscar o total em transacoes por conta para o saldo previsto
                const dataLimite = ultimoDiaDoMes(); // Ex: "2025-05-31"

                const contasComTotalPrevisto = await Promise.all(
                    contasComTotal.map(async (conta) => {
                        try {
                            const transacoes = await listar('transacoes');
                            const total = transacoes
                                .filter(transacao => {
                                    const dataComparacao = transacao.data_efetivacao || transacao.data_vencimento;
                                    return dataComparacao <= dataLimite && transacao.conta_id === conta.id;
                                })
                                .reduce((total, transacao) => {
                                    const valor = transacao.tipo === 'R' ? transacao.valor : -transacao.valor;
                                    return total + valor;
                                }, 0);

                            conta.saldo_previsto = parseFloat(conta.saldo_inicial) + total;
                        } catch (e) {
                            conta.saldo_previsto = parseFloat(conta.saldo_inicial);                                    
                        }
                        return conta;
                    })
                );

                resolve(contasComTotalPrevisto);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Receitas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}



function atualizar(storeName, id, novosDados) {
    const request = indexedDB.open(banco, versao);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const getRequest = store.get(id);

        getRequest.onsuccess = function() {
            const data = getRequest.result;

            if (data) {
                // Atualiza os campos
                Object.assign(data, novosDados);
                data.updated_at = formatarData(new Date());
                store.put(data);
                console.log(`Registro atualizado na store ${storeName}`);
            } else {
                console.error('Registro não encontrado para atualização.');
            }
        };
    };
}

//Total de Despesas por data
export async function totalDespesasData(data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();

            query.onsuccess = function() {
                const transacoes = query.result || [];

                const registrosFiltrados = transacoes.filter(registro => 
                                                                    registro.deleted_at === null||
                                                                    registro.deleted_at === undefined ||
                                                                    typeof registro.deleted_at === 'undefined');

                const despesasNoMes = registrosFiltrados.filter(transacao => {
                    if (transacao.tipo !== 'D') return false;
                    if(transacao.efetivada === false) return false;

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const dataTransacao = new Date(dataStr);
                    return dataTransacao.toISOString().slice(0, 10) === data;
                });

                const totalDespesas = despesasNoMes.reduce((total, transacao) => {
                    return total + parseFloat(transacao.valor);
                }, 0);

                resolve(totalDespesas);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Despesas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

//Total Despesas por mes, ano e categoria
async function totalDespesasCategoria(mes, ano, categoria_id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();


            query.onsuccess = function() {
                const transacoes = query.result || [];

                const registrosFiltrados = transacoes.filter(registro => 
                                                                    registro.deleted_at === null||
                                                                    registro.deleted_at === undefined ||
                                                                    typeof registro.deleted_at === 'undefined');

                const despesasNoMes = registrosFiltrados.filter(transacao => {
                    if (transacao.tipo !== 'D') return false;
                    if(transacao.efetivada === false) return false;
                    if(transacao.deleted_at !== null) return false;

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano) && transacao.categoria_id === categoria_id;
                });

                const totalDespesas = despesasNoMes.reduce((total, transacao) => {
                    return total + parseFloat(transacao.valor);
                }, 0);

                resolve(totalDespesas);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar Despesas:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

async function totalTransacao(mes, ano, tipo) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();

            query.onsuccess = function() {
                const transacoes = query.result || [];

                const transacoesFiltradas = transacoes.filter(registro => 
                                                           registro.deleted_at === null || 
                                                           registro.deleted_at === undefined ||
                                                           typeof registro.deleted_at === 'undefined');

                const receitasNoMes = transacoesFiltradas.filter(transacao => {
                    if (transacao.tipo !== tipo) return false;

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                const totalReceitas = receitasNoMes.reduce((total, transacao) => {
                    return total + Number(transacao.valor);
                }, 0);

                resolve(totalReceitas); // 👈 resolver com o valor correto
            };

            query.onerror = function(event) {
                console.error('Erro na consulta IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function totalPendente(mes, ano, tipo) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();

            query.onsuccess = function() {
                const transacoes = query.result || [];

                const receitasNoMes = transacoes.filter(transacao => {
                    if (transacao.tipo !== tipo) return false;
                    if (transacao.data_efetivacao != null) return false;
                    if (transacao.deleted_at != null) return false;

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                const totalReceitas = receitasNoMes.reduce((total, transacao) => {
                    return total + Number(transacao.valor);
                }, 0);

                resolve(totalReceitas); // 👈 resolver com o valor correto
            };

            query.onerror = function(event) {
                console.error('Erro na consulta IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

export async function totalEfetivado(mes, ano, tipo) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();

            query.onsuccess = function() {
                const transacoes = query.result || [];

                const receitasNoMes = transacoes.filter(transacao => {
                    if (transacao.tipo !== tipo) return false;
                    if (transacao.data_efetivacao == null) return false;
                    if (transacao.deleted_at != null) return false;

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                const totalReceitas = receitasNoMes.reduce((total, transacao) => {
                    return total + Number(transacao.valor);
                }, 0);

                resolve(totalReceitas); // 👈 resolver com o valor correto
            };

            query.onerror = function(event) {
                console.error('Erro na consulta IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}
 

//funcao para retornar as ultimas 5 transações em ordem decrescente
async function ultimasTransacoes(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);

        request.onsuccess = async function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');

            const query = transacoesStore.getAll();

            query.onsuccess = async function() {
                const transacoes = query.result || [];

                const registrosFiltrados = transacoes.filter(registro => 
                                                             registro.deleted_at === null || 
                                                             registro.deleted_at === undefined ||
                                                             typeof registro.deleted_at === 'undefined');

                const receitasNoMes = registrosFiltrados.filter(transacao => {

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                //Ordenar pelo id da transação do maior para o menor
                const transacoesOrdenadas = receitasNoMes.sort((a, b) => {
                    return b.id - a.id;
                });
               

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    transacoesOrdenadas.map(transacao => {
                        return new Promise((resolveCategoria) => {
                            if (!transacao.categoria_id) {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                                return;
                            }

                            const categoriaRequest = categoriasStore.get(transacao.categoria_id);

                            categoriaRequest.onsuccess = function() {
                                const categoria = categoriaRequest.result;
                                transacao.categoria = categoria ? categoria.nome : null;
                                resolveCategoria(transacao);
                            };

                            categoriaRequest.onerror = function() {
                                transacao.categoria = null;
                                resolveCategoria(transacao);
                            };
                        });
                    })
                );

                resolve(transacoesComCategoria);
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar transações:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}


//listar meses de orçamentos cadastrados no seguinte formato Janeiro/2025
export async function listarMesesOrcamentos() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(banco, versao);
        
        const mesesPortugues = [
            '', 'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['orcamentos'], 'readonly');
            const orcamentosStore = transaction.objectStore('orcamentos');

            const query = orcamentosStore.getAll();

            query.onsuccess = function() {
                const orcamentos = query.result || [];
                const mesesMap = new Map();

                orcamentos.forEach(orcamento => {
                    const valId = `${orcamento.mes}-${orcamento.ano}`;
                    if (!mesesMap.has(valId)) {
                        const mesNome = mesesPortugues[orcamento.mes] || 'Mês Inválido';
                        mesesMap.set(valId, {
                            valId: valId,
                            mesAno: `${mesNome}/${orcamento.ano}`
                        });
                    }
                });

                resolve(Array.from(mesesMap.values()));
            };

            query.onerror = function(event) {
                console.error('Erro ao buscar orçamentos:', event.target.error);
                reject(event.target.error);
            };
        };

        request.onerror = function(event) {
            console.error('Erro ao abrir o banco IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

function deletar(storeName, id) {
    return new Promise((resolve, reject) => {
        
        const request = indexedDB.open(banco, versao);
    
        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Primeiro obtemos o registro para atualizá-lo
            const getRequest = store.get(id);
            
            getRequest.onsuccess = function() {
                const data = getRequest.result;
                
                if (data) {
                    // Atualiza o campo deleted_at com a data/hora atual
                    data.deleted_at = formatarData(new Date());
                    
                    // Salva o registro atualizado
                    const putRequest = store.put(data);
                    
                    putRequest.onsuccess = function() {
                        console.log(`Registro marcado como deletado na store ${storeName}`);
                        resolve();
                    };
                    
                    putRequest.onerror = function(error) {
                        console.error('Erro ao atualizar registro:', error);
                        resolve();
                    };
                } else {
                    console.warn(`Registro com ID ${id} não encontrado na store ${storeName}`);
                    resolve();
                }
            };
            
            getRequest.onerror = function(error) {
                console.error('Erro ao buscar registro:', error);
                resolve();
            };
        };
        
        request.onerror = function(error) {
            console.error('Erro ao abrir o banco de dados:', error);
            resolve();
        };

        resolve();
    })

}

export { adicionar, listar, atualizar, deletar, totalTransacao, ultimasTransacoes };
