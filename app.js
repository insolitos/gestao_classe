// ClassTracker Application
class ClassTracker {
    constructor() {
        this.currentTurma = null;
        this.data = this.loadData();
        this.confirmAction = null;
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.initEventListeners();
        this.initTabs();
        this.loadTurmas();
        this.initSampleData();
        
        // Load first turma if available
        if (this.data.turmas.length > 0) {
            this.selectTurma(this.data.turmas[0]);
        }
    }

    initSampleData() {
        // Initialize with sample data if no data exists
        if (this.data.turmas.length === 0) {
            const sampleData = {
                turmas: ["5ºA", "6ºB", "7ºC"],
                alunos: {
                    "5ºA": ["Ana Silva", "Bruno Costa", "Carla Santos", "David Oliveira", "Eva Ferreira"],
                    "6ºB": ["Francisco Lima", "Gabriela Sousa", "Hugo Martins", "Inês Rodrigues", "João Pereira"]
                },
                tarefas: [
                    {id: 1, texto: "Preparar teste de matemática", concluido: false, data: "2025-07-30"},
                    {id: 2, texto: "Corrigir trabalhos de português", concluido: true, data: "2025-07-29"},
                    {id: 3, texto: "Reunião com pais", concluido: false, data: "2025-07-31"}
                ]
            };
            
            this.data.turmas = sampleData.turmas;
            this.data.alunos = sampleData.alunos;
            this.data.tarefas = sampleData.tarefas;
            this.saveData();
            this.loadTurmas();
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('pt-PT', options);
        }
    }

    initEventListeners() {
        // Turma management
        const addTurmaBtn = document.getElementById('adicionarTurma');
        const novaTurmaInput = document.getElementById('novaTurma');
        const turmaSelector = document.getElementById('turmaSelector');

        if (addTurmaBtn) {
            addTurmaBtn.addEventListener('click', () => this.adicionarTurma());
        }
        if (novaTurmaInput) {
            novaTurmaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.adicionarTurma();
            });
        }
        if (turmaSelector) {
            turmaSelector.addEventListener('change', (e) => {
                if (e.target.value) this.selectTurma(e.target.value);
            });
        }

        // Student management
        const addAlunoBtn = document.getElementById('adicionarAluno');
        const novoAlunoInput = document.getElementById('novoAluno');

        if (addAlunoBtn) {
            addAlunoBtn.addEventListener('click', () => this.adicionarAluno());
        }
        if (novoAlunoInput) {
            novoAlunoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.adicionarAluno();
            });
        }

        // Tasks management
        const addTarefaBtn = document.getElementById('adicionarTarefa');
        const novaTarefaInput = document.getElementById('novaTarefa');

        if (addTarefaBtn) {
            addTarefaBtn.addEventListener('click', () => this.adicionarTarefa());
        }
        if (novaTarefaInput) {
            novaTarefaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.adicionarTarefa();
            });
        }

        // Reset buttons
        const resetPresencasBtn = document.getElementById('resetPresencas');
        const resetParticipacoesBtn = document.getElementById('resetParticipacoes');

        if (resetPresencasBtn) {
            resetPresencasBtn.addEventListener('click', () => this.resetPresencas());
        }
        if (resetParticipacoesBtn) {
            resetParticipacoesBtn.addEventListener('click', () => this.resetParticipacoes());
        }

        // Modal
        const confirmCancel = document.getElementById('confirmCancel');
        const confirmOk = document.getElementById('confirmOk');
        const confirmModal = document.getElementById('confirmModal');

        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.hideModal());
        }
        if (confirmOk) {
            confirmOk.addEventListener('click', () => this.executeConfirmAction());
        }
        if (confirmModal) {
            confirmModal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-backdrop')) this.hideModal();
            });
        }
    }

    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        const activePane = document.getElementById(tabId);
        if (activePane) {
            activePane.classList.add('active');
        }

        // Load content for the active tab
        this.loadTabContent(tabId);
    }

    loadTabContent(tabId) {
        if (!this.currentTurma) return;

        switch(tabId) {
            case 'alunos':
                this.loadAlunos();
                break;
            case 'presencas':
                this.loadPresencas();
                break;
            case 'participacoes':
                this.loadParticipacoes();
                break;
            case 'tarefas':
                this.loadTarefas();
                break;
            case 'notas':
                this.loadNotas();
                break;
        }
    }

    // Turma Management
    adicionarTurma() {
        const input = document.getElementById('novaTurma');
        if (!input) return;
        
        const nome = input.value.trim();
        
        if (!nome) return;
        if (this.data.turmas.includes(nome)) {
            alert('Esta turma já existe!');
            return;
        }

        this.data.turmas.push(nome);
        this.data.alunos[nome] = [];
        this.saveData();
        this.loadTurmas();
        input.value = '';
        this.selectTurma(nome);
    }

    removeTurma(nome) {
        this.showModal(
            'Remover Turma',
            `Tem certeza que deseja remover a turma "${nome}" e todos os seus dados?`,
            () => {
                this.data.turmas = this.data.turmas.filter(t => t !== nome);
                delete this.data.alunos[nome];
                delete this.data.presencas[nome];
                delete this.data.participacoes[nome];
                delete this.data.notas[nome];
                this.saveData();
                this.loadTurmas();
                
                if (this.currentTurma === nome) {
                    this.currentTurma = null;
                    const activeTab = document.querySelector('.tab-btn.active');
                    if (activeTab) {
                        this.loadTabContent(activeTab.dataset.tab);
                    }
                }
            }
        );
    }

    selectTurma(nome) {
        this.currentTurma = nome;
        
        // Update selector
        const selector = document.getElementById('turmaSelector');
        if (selector) {
            selector.value = nome;
        }
        
        // Update sidebar
        document.querySelectorAll('.turma-item').forEach(item => {
            item.classList.toggle('active', item.dataset.turma === nome);
        });
        
        // Reload current tab content
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.loadTabContent(activeTab.dataset.tab);
        }
    }

    loadTurmas() {
        const lista = document.getElementById('listaTurmas');
        const selector = document.getElementById('turmaSelector');
        
        if (lista) {
            lista.innerHTML = '';
        }
        if (selector) {
            selector.innerHTML = '<option value="">Selecionar Turma...</option>';
        }
        
        this.data.turmas.forEach(turma => {
            // Sidebar list
            if (lista) {
                const li = document.createElement('li');
                li.className = 'turma-item';
                li.dataset.turma = turma;
                li.innerHTML = `
                    <span>${turma}</span>
                    <button class="turma-remove">✕</button>
                `;
                
                // Add event listeners
                li.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('turma-remove')) {
                        this.selectTurma(turma);
                    }
                });
                
                const removeBtn = li.querySelector('.turma-remove');
                if (removeBtn) {
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeTurma(turma);
                    });
                }
                
                lista.appendChild(li);
            }
            
            // Selector option
            if (selector) {
                const option = document.createElement('option');
                option.value = turma;
                option.textContent = turma;
                selector.appendChild(option);
            }
        });
    }

    // Student Management
    adicionarAluno() {
        if (!this.currentTurma) {
            alert('Selecione uma turma primeiro!');
            return;
        }

        const input = document.getElementById('novoAluno');
        if (!input) return;
        
        const nome = input.value.trim();
        
        if (!nome) return;
        if (this.data.alunos[this.currentTurma].includes(nome)) {
            alert('Este aluno já existe na turma!');
            return;
        }

        this.data.alunos[this.currentTurma].push(nome);
        this.saveData();
        this.loadAlunos();
        input.value = '';
    }

    removeAluno(nome) {
        this.showModal(
            'Remover Aluno',
            `Tem certeza que deseja remover "${nome}" da turma?`,
            () => {
                this.data.alunos[this.currentTurma] = this.data.alunos[this.currentTurma].filter(a => a !== nome);
                
                // Remove related data
                if (this.data.presencas[this.currentTurma]) {
                    delete this.data.presencas[this.currentTurma][nome];
                }
                if (this.data.participacoes[this.currentTurma]) {
                    delete this.data.participacoes[this.currentTurma][nome];
                }
                if (this.data.notas[this.currentTurma]) {
                    delete this.data.notas[this.currentTurma][nome];
                }
                
                this.saveData();
                this.loadAlunos();
            }
        );
    }

    loadAlunos() {
        const container = document.getElementById('listaAlunos');
        if (!container) return;
        
        if (!this.currentTurma) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><p>Selecione uma turma para ver os alunos</p></div>';
            return;
        }

        const alunos = this.data.alunos[this.currentTurma] || [];
        if (alunos.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>Nenhum aluno adicionado ainda</p></div>';
            return;
        }

        container.innerHTML = '';
        alunos.forEach(aluno => {
            const div = document.createElement('div');
            div.className = 'aluno-card';
            div.innerHTML = `
                <button class="aluno-remove">✕</button>
                <div class="aluno-nome">${aluno}</div>
            `;
            
            const removeBtn = div.querySelector('.aluno-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeAluno(aluno));
            }
            
            container.appendChild(div);
        });
    }

    // Attendance Management
    loadPresencas() {
        const container = document.getElementById('presencasGrid');
        const dataElement = document.getElementById('dataPresencas');
        
        if (!container) return;
        
        if (!this.currentTurma) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Selecione uma turma primeiro</p></div>';
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (dataElement) {
            dataElement.textContent = `Presenças de ${new Date().toLocaleDateString('pt-PT')}`;
        }
        
        const alunos = this.data.alunos[this.currentTurma] || [];
        if (alunos.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>Adicione alunos à turma primeiro</p></div>';
            return;
        }

        if (!this.data.presencas[this.currentTurma]) {
            this.data.presencas[this.currentTurma] = {};
        }

        container.innerHTML = '';
        alunos.forEach(aluno => {
            const status = this.data.presencas[this.currentTurma][aluno]?.[today];
            const cardClass = status ? (status === 'presente' ? 'presente' : 'ausente') : '';
            const btnClass = status ? status : 'neutro';
            const btnText = status === 'presente' ? 'Presente ✓' : status === 'ausente' ? 'Ausente ✗' : 'Marcar';
            
            const div = document.createElement('div');
            div.className = `presenca-card ${cardClass}`;
            div.innerHTML = `
                <div class="aluno-nome">${aluno}</div>
                <button class="presenca-btn ${btnClass}">${btnText}</button>
            `;
            
            const btn = div.querySelector('.presenca-btn');
            if (btn) {
                btn.addEventListener('click', () => this.togglePresenca(aluno));
            }
            
            container.appendChild(div);
        });
    }

    togglePresenca(aluno) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.presencas[this.currentTurma]) {
            this.data.presencas[this.currentTurma] = {};
        }
        if (!this.data.presencas[this.currentTurma][aluno]) {
            this.data.presencas[this.currentTurma][aluno] = {};
        }

        const current = this.data.presencas[this.currentTurma][aluno][today];
        let newStatus;
        
        if (!current) {
            newStatus = 'presente';
        } else if (current === 'presente') {
            newStatus = 'ausente';
        } else {
            newStatus = null;
            delete this.data.presencas[this.currentTurma][aluno][today];
        }

        if (newStatus) {
            this.data.presencas[this.currentTurma][aluno][today] = newStatus;
        }

        this.saveData();
        this.loadPresencas();
    }

    resetPresencas() {
        if (!this.currentTurma) return;
        
        this.showModal(
            'Reset Presenças',
            'Tem certeza que deseja limpar todas as presenças de hoje?',
            () => {
                const today = new Date().toISOString().split('T')[0];
                if (this.data.presencas[this.currentTurma]) {
                    Object.keys(this.data.presencas[this.currentTurma]).forEach(aluno => {
                        if (this.data.presencas[this.currentTurma][aluno][today]) {
                            delete this.data.presencas[this.currentTurma][aluno][today];
                        }
                    });
                }
                this.saveData();
                this.loadPresencas();
            }
        );
    }

    // Participation Management
    loadParticipacoes() {
        const container = document.getElementById('participacoesGrid');
        
        if (!container) return;
        
        if (!this.currentTurma) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🗣️</div><p>Selecione uma turma primeiro</p></div>';
            return;
        }

        const alunos = this.data.alunos[this.currentTurma] || [];
        if (alunos.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>Adicione alunos à turma primeiro</p></div>';
            return;
        }

        if (!this.data.participacoes[this.currentTurma]) {
            this.data.participacoes[this.currentTurma] = {};
        }

        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = '';
        alunos.forEach(aluno => {
            const count = this.data.participacoes[this.currentTurma][aluno]?.[today] || 0;
            
            const div = document.createElement('div');
            div.className = 'participacao-card';
            div.innerHTML = `
                <div class="aluno-nome">${aluno}</div>
                <div class="participacao-counter">${count}</div>
                <button class="participacao-btn">+1</button>
            `;
            
            const btn = div.querySelector('.participacao-btn');
            if (btn) {
                btn.addEventListener('click', () => this.addParticipacao(aluno));
            }
            
            container.appendChild(div);
        });
    }

    addParticipacao(aluno) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.participacoes[this.currentTurma]) {
            this.data.participacoes[this.currentTurma] = {};
        }
        if (!this.data.participacoes[this.currentTurma][aluno]) {
            this.data.participacoes[this.currentTurma][aluno] = {};
        }

        this.data.participacoes[this.currentTurma][aluno][today] = 
            (this.data.participacoes[this.currentTurma][aluno][today] || 0) + 1;

        this.saveData();
        this.loadParticipacoes();
    }

    resetParticipacoes() {
        if (!this.currentTurma) return;
        
        this.showModal(
            'Reset Participações',
            'Tem certeza que deseja zerar todas as participações de hoje?',
            () => {
                const today = new Date().toISOString().split('T')[0];
                if (this.data.participacoes[this.currentTurma]) {
                    Object.keys(this.data.participacoes[this.currentTurma]).forEach(aluno => {
                        if (this.data.participacoes[this.currentTurma][aluno][today]) {
                            delete this.data.participacoes[this.currentTurma][aluno][today];
                        }
                    });
                }
                this.saveData();
                this.loadParticipacoes();
            }
        );
    }

    // Tasks Management
    adicionarTarefa() {
        const input = document.getElementById('novaTarefa');
        if (!input) return;
        
        const texto = input.value.trim();
        
        if (!texto) return;

        const tarefa = {
            id: Date.now(),
            texto: texto,
            concluido: false,
            data: new Date().toISOString().split('T')[0]
        };

        this.data.tarefas.push(tarefa);
        this.saveData();
        this.loadTarefas();
        input.value = '';
    }

    toggleTarefa(id) {
        const tarefa = this.data.tarefas.find(t => t.id === id);
        if (tarefa) {
            tarefa.concluido = !tarefa.concluido;
            this.saveData();
            this.loadTarefas();
        }
    }

    removeTarefa(id) {
        this.showModal(
            'Remover Tarefa',
            'Tem certeza que deseja remover esta tarefa?',
            () => {
                this.data.tarefas = this.data.tarefas.filter(t => t.id !== id);
                this.saveData();
                this.loadTarefas();
            }
        );
    }

    loadTarefas() {
        const container = document.getElementById('listaTarefas');
        if (!container) return;
        
        if (this.data.tarefas.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>Nenhuma tarefa adicionada ainda</p></div>';
            return;
        }

        // Sort tasks: incomplete first, then by date
        const sortedTarefas = [...this.data.tarefas].sort((a, b) => {
            if (a.concluido !== b.concluido) {
                return a.concluido ? 1 : -1;
            }
            return new Date(b.data) - new Date(a.data);
        });

        container.innerHTML = '';
        sortedTarefas.forEach(tarefa => {
            const li = document.createElement('li');
            li.className = `tarefa-item ${tarefa.concluido ? 'concluida' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="tarefa-checkbox" ${tarefa.concluido ? 'checked' : ''}>
                <span class="tarefa-texto">${tarefa.texto}</span>
                <span class="tarefa-data">${new Date(tarefa.data).toLocaleDateString('pt-PT')}</span>
                <button class="tarefa-remove">✕</button>
            `;
            
            const checkbox = li.querySelector('.tarefa-checkbox');
            const removeBtn = li.querySelector('.tarefa-remove');
            
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleTarefa(tarefa.id));
            }
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeTarefa(tarefa.id));
            }
            
            container.appendChild(li);
        });
    }

    // Notes Management
    loadNotas() {
        const container = document.getElementById('notasGrid');
        
        if (!container) return;
        
        if (!this.currentTurma) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📔</div><p>Selecione uma turma primeiro</p></div>';
            return;
        }

        const alunos = this.data.alunos[this.currentTurma] || [];
        if (alunos.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>Adicione alunos à turma primeiro</p></div>';
            return;
        }

        if (!this.data.notas[this.currentTurma]) {
            this.data.notas[this.currentTurma] = {};
        }

        container.innerHTML = '';
        alunos.forEach(aluno => {
            const nota = this.data.notas[this.currentTurma][aluno] || {};
            const timestamp = nota.timestamp ? new Date(nota.timestamp).toLocaleString('pt-PT') : '';
            
            const div = document.createElement('div');
            div.className = 'nota-card';
            div.innerHTML = `
                <div class="aluno-nome">${aluno}</div>
                <textarea class="nota-textarea form-control" placeholder="Anotações sobre ${aluno}...">${nota.texto || ''}</textarea>
                ${timestamp ? `<div class="nota-timestamp">Última edição: ${timestamp}</div>` : ''}
            `;
            
            const textarea = div.querySelector('.nota-textarea');
            if (textarea) {
                textarea.addEventListener('change', () => this.saveNota(aluno, textarea.value));
            }
            
            container.appendChild(div);
        });
    }

    saveNota(aluno, texto) {
        if (!this.data.notas[this.currentTurma]) {
            this.data.notas[this.currentTurma] = {};
        }

        this.data.notas[this.currentTurma][aluno] = {
            texto: texto,
            timestamp: new Date().toISOString()
        };

        this.saveData();
        // Reload to show timestamp
        setTimeout(() => this.loadNotas(), 100);
    }

    // Modal Management
    showModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
        
        this.confirmAction = onConfirm;
    }

    hideModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.classList.add('hidden');
        this.confirmAction = null;
    }

    executeConfirmAction() {
        if (this.confirmAction) {
            this.confirmAction();
        }
        this.hideModal();
    }

    // Data Management
    loadData() {
        const defaultData = {
            turmas: [],
            alunos: {},
            presencas: {},
            participacoes: {},
            tarefas: [],
            notas: {}
        };

        try {
            const stored = localStorage.getItem('classTracker');
            return stored ? {...defaultData, ...JSON.parse(stored)} : defaultData;
        } catch (e) {
            console.error('Error loading data:', e);
            return defaultData;
        }
    }

    saveData() {
        try {
            localStorage.setItem('classTracker', JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ClassTracker();
});