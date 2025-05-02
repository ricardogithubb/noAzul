// Inicialização do IndexedDB
const request = indexedDB.open('noAzul', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    // Criar object store para Categoria
    if (!db.objectStoreNames.contains('categorias')) {
        const categoriaStore = db.createObjectStore('categorias', { keyPath: 'id', autoIncrement: true });
        categoriaStore.createIndex('nome', 'nome', { unique: false });
        categoriaStore.createIndex('tipo', 'tipo', { unique: false });
        categoriaStore.createIndex('user_id', 'user_id', { unique: false });
    }

    // Criar object store para Conta
    if (!db.objectStoreNames.contains('contas')) {
        const contaStore = db.createObjectStore('contas', { keyPath: 'id', autoIncrement: true });
        contaStore.createIndex('nome', 'nome', { unique: false });
        contaStore.createIndex('saldo_inicial', 'saldo_inicial', { unique: false });
        contaStore.createIndex('user_id', 'user_id', { unique: false });
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
    const request = indexedDB.open('noAzul', 1);

    //não permitir gravar registros com nomes repetidos para categorias e contas
    if (storeName === 'categorias' || storeName === 'contas') {
        const getRequest = indexedDB.open('noAzul', 1);
        getRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('nome');
            const query = index.get(data.nome);

            query.onsuccess = function() {
                if (query.result) {
                    alert(`Já existe uma ${storeName} com o nome ${data.nome}`);
                } else {
                    request.onsuccess = function(event) {
                        const db = event.target.result;
                        const transaction = db.transaction([storeName], 'readwrite');
                        const store = transaction.objectStore(storeName);
                        store.add(data);
                        console.log(`Adicionado na store ${storeName}`);
                    };
                }
            };
        };
    } 

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add(data);
        console.log(`Adicionado na store ${storeName}`);
    };
}

function listar(storeName, callback) {
    const request = indexedDB.open('noAzul', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAll = store.getAll();

        getAll.onsuccess = function() {
            callback(getAll.result);
        };
    };
}

export function listarCategorias(storeName,type, callback) {
    const request = indexedDB.open('noAzul', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAll = store.index('tipo').getAll(type); 

        getAll.onsuccess = function() {
            callback(getAll.result);
        };
    };
}

export async function listarReceitas(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('noAzul', 1);

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

                // Ordenar as transações pela data (mais recente primeiro)
                const transacoesOrdenadas = transacoes.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                const receitasNoMes = transacoes.filter(transacao => {

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

export async function listarDespesas(mes, ano) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('noAzul', 1);

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

                // Ordenar as transações pela data (mais recente primeiro)
                const transacoesOrdenadas = transacoes.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                const receitasNoMes = transacoes.filter(transacao => {

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

function atualizar(storeName, id, novosDados) {
    const request = indexedDB.open('noAzul', 1);

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
                store.put(data);
                console.log(`Registro atualizado na store ${storeName}`);
            } else {
                console.error('Registro não encontrado para atualização.');
            }
        };
    };
}

async function totalTransacao(mes, ano, tipo) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('noAzul', 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes'], 'readonly');
            const store = transaction.objectStore('transacoes');

            const query = store.getAll();

            query.onsuccess = function() {
                const transacoes = query.result || [];

                const receitasNoMes = transacoes.filter(transacao => {
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
        const request = indexedDB.open('noAzul', 1);

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
        const request = indexedDB.open('noAzul', 1);

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
        const request = indexedDB.open('noAzul', 1);

        request.onsuccess = async function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['transacoes', 'categorias'], 'readonly');
            const transacoesStore = transaction.objectStore('transacoes');
            const categoriasStore = transaction.objectStore('categorias');

            const query = transacoesStore.getAll();

            query.onsuccess = async function() {
                const transacoes = query.result || [];

                const receitasNoMes = transacoes.filter(transacao => {

                    const dataStr = transacao.data_efetivacao || transacao.data_vencimento;
                    if (!dataStr) return false;

                    const data = new Date(dataStr.replace(/-/g, '/'));
                    const dataMes = data.getMonth() + 1;
                    const dataAno = data.getFullYear();

                    return dataMes === parseInt(mes) && dataAno === parseInt(ano);
                });

                // Ordenar as transações pela data (mais recente primeiro)
                const transacoesOrdenadas = receitasNoMes.sort((a, b) => {
                    const dataA = new Date(a.data_efetivacao || a.data_vencimento);
                    const dataB = new Date(b.data_efetivacao || b.data_vencimento);
                    return dataB - dataA;
                });

                const ultimos5 = transacoesOrdenadas.slice(0, 5);

                // Buscar os nomes das categorias
                const transacoesComCategoria = await Promise.all(
                    ultimos5.map(transacao => {
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





function deletar(storeName, id) {
    const request = indexedDB.open('noAzul', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);
        console.log(`Registro deletado da store ${storeName}`);
    };
}

// Exemplo de uso:

// Adicionar uma Categoria
// adicionar('categorias', { nome: 'Salario', tipo: 'R', user_id: 1 });
// adicionar('categorias', { nome: 'Adiantamento', tipo: 'R', user_id: 1 });
// adicionar('categorias', { nome: 'Carro', tipo: 'D', user_id: 1 });
// adicionar('categorias', { nome: 'Supermercado', tipo: 'D', user_id: 1 });

// // Adicionar uma Conta
// adicionar('contas', { nome: 'Itau', user_id: 1 });
// adicionar('contas', { nome: 'Investimento', user_id: 1 });

// Listar todas Categorias
// listar('categorias', (dados) => console.log(dados));

// Atualizar uma Categoria pelo id
// atualizar('transacoes', 3, { data_efetivacao: '2025-04-30'});

// Deletar uma Categoria pelo id
// deletar('categorias', 1);

//adicionar uma transacao
// adicionar('transacoes', { descricao: 'RochaSystem', observacao: null, conta_id: 1, categoria_id: 1, tipo: 'R', valor: 1232.00, data_vencimento: '2025-04-14', data_efetivacao: null, user_id: 1 });
// adicionar('transacoes', { descricao: 'Adiantamento Sumidenso', observacao: null, conta_id: 1, categoria_id: 1, tipo: 'R', valor: 3685.22, data_vencimento: '2025-04-15', data_efetivacao: null, user_id: 1 });
// adicionar('transacoes', { descricao: 'Salario Sumidenso', observacao: null, conta_id: 1, categoria_id: 1, tipo: 'R', valor: 1232.00, data_vencimento: '2025-04-16', data_efetivacao: null, user_id: 1 });
// adicionar('transacoes', { descricao: 'Combustível', observacao: null, conta_id: 1, categoria_id: 3, tipo: 'D', valor: 350.00, data_vencimento: '2025-04-15', data_efetivacao: null, user_id: 1 });
//exportar estas funções
export { adicionar, listar, atualizar, deletar, totalTransacao, ultimasTransacoes };
