document.addEventListener('DOMContentLoaded', function() {

    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('url-input');
    const resultsSection = document.getElementById('results-section');
    const loadingSection = document.getElementById('loading-section');
    const loadingBar = document.getElementById('loading-bar');
    const loadingStatus = document.getElementById('loading-status');
    const saveReportBtn = document.getElementById('save-report-btn');
    const showAllIssuesBtn = document.getElementById('show-all-issues');
    const competitorUrl = document.getElementById('competitor-url');
    const addCompetitorBtn = document.getElementById('add-competitor');
    const competitorsList = document.getElementById('competitors-list');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

   
    const analysisData = {
        score: 78,
        categories: {
            structure: { score: 82, issues: [
                { title: "Hierarquia de cabeçalhos", status: "good", description: "A estrutura de H1, H2, H3 está bem organizada." },
                { title: "URLs amigáveis", status: "warning", description: "Algumas URLs contêm parâmetros complexos que podem ser simplificados." },
                { title: "Navegação", status: "good", description: "Menu principal bem estruturado e fácil de usar." },
                { title: "Links quebrados", status: "bad", description: "3 links internos retornam erro 404 (não encontrado)." },
                { title: "Responsividade", status: "good", description: "O site se adapta bem a diferentes tamanhos de tela." },
                { title: "Arquitetura de informação", status: "warning", description: "Algumas páginas importantes estão muito profundas na estrutura." }
            ]},
            seo: { score: 65, issues: [
                { title: "Meta description", status: "bad", description: "Falta meta description em várias páginas importantes." },
                { title: "Títulos de página", status: "good", description: "Títulos únicos e descritivos em todas as páginas." },
                { title: "Conteúdo duplicado", status: "warning", description: "Algumas seções aparecem em múltiplas páginas sem variação." },
                { title: "Links internos", status: "good", description: "Boa quantidade de links internos relevantes." },
                { title: "Velocidade de carregamento", status: "bad", description: "Tempo de carregamento acima de 3 segundos em dispositivos móveis." },
                { title: "Schema markup", status: "warning", description: "Marcação semântica básica presente, mas poderia ser expandida." }
            ]},
            performance: { score: 58, issues: [
                { title: "Tempo de carregamento", status: "bad", description: "4.2s para carregamento completo (acima da média de 2.5s)." },
                { title: "Otimização de imagens", status: "warning", description: "5 imagens poderiam ser melhor comprimidas sem perda de qualidade." },
                { title: "Cache", status: "good", description: "Cache HTTP configurado corretamente para recursos estáticos." },
                { title: "JavaScript bloqueante", status: "bad", description: "3 scripts estão bloqueando a renderização da página." },
                { title: "CDN", status: "good", description: "Recursos estáticos sendo servidos por uma CDN global." },
                { title: "Tamanho da página", status: "warning", description: "2.8MB (recomendado abaixo de 2MB para mobile)." }
            ]},
            accessibility: { score: 72, issues: [
                { title: "Contraste de cores", status: "bad", description: "7 elementos com contraste insuficiente para leitura." },
                { title: "Texto alternativo", status: "bad", description: "5 imagens sem atributo alt descritivo." },
                { title: "Navegação por teclado", status: "good", description: "Todos os elementos interativos são acessíveis via teclado." },
                { title: "ARIA labels", status: "warning", description: "Alguns elementos complexos poderiam se beneficiar de atributos ARIA." },
                { title: "Semântica HTML", status: "good", description: "Uso adequado de elementos semânticos como header, nav, main, etc." },
                { title: "Formulários", status: "warning", description: "2 campos de formulário sem labels associados." }
            ]},
            security: { score: 85, issues: [
                { title: "HTTPS", status: "good", description: "Site utiliza HTTPS corretamente." },
                { title: "Headers de segurança", status: "warning", description: "Alguns headers de segurança importantes estão faltando." },
                { title: "Vulnerabilidades conhecidas", status: "good", description: "Nenhuma vulnerabilidade crítica encontrada." },
                { title: "Atualizações", status: "warning", description: "Algumas dependências podem estar desatualizadas." }
            ]}
        },
        quickFixes: [
            { title: "Meta description ausente", severity: "warning", description: "Adicione uma meta description única e descritiva para melhorar os resultados de SEO.", category: "seo" },
            { title: "Imagens sem alt text", severity: "bad", description: "5 imagens não possuem texto alternativo, o que prejudica a acessibilidade e SEO.", category: "accessibility" },
            { title: "Tempo de carregamento lento", severity: "warning", description: "Otimize imagens e habilite cache para melhorar o tempo de carregamento.", category: "performance" },
            { title: "Contraste insuficiente", severity: "bad", description: "7 elementos com contraste insuficiente para leitura.", category: "accessibility" },
            { title: "JavaScript bloqueante", severity: "bad", description: "3 scripts estão bloqueando a renderização da página.", category: "performance" }
        ]
    };


    const scoreFeedback = [
        { min: 0, max: 49, text: "Seu site precisa de melhorias significativas em várias áreas." },
        { min: 50, max: 69, text: "Seu site está ok, mas pode melhorar em vários aspectos." },
        { min: 70, max: 84, text: "Bom trabalho! Seu site está acima da média." },
        { min: 85, max: 100, text: "Excelente! Seu site está entre os melhores." }
    ];

    let historyChart = null;

    function animateNumber(elementId, finalNumber, duration = 1000) {
        const element = document.getElementById(elementId);
        const start = 0;
        const increment = finalNumber / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= finalNumber) {
                current = finalNumber;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    function animateProgressBar(elementId, percent) {
        const element = document.getElementById(elementId);
        element.style.width = '0%';
        setTimeout(() => {
            element.style.width = `${percent}%`;
        }, 100);
    }

    function animateScoreCircle(percent) {
        const circle = document.getElementById('score-circle');
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;
        
        circle.style.strokeDashoffset = circumference;
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);
    }

    function updateScoreFeedback(score) {
        const feedbackElement = document.getElementById('score-feedback');
        const feedback = scoreFeedback.find(f => score >= f.min && score <= f.max);
        feedbackElement.textContent = feedback ? feedback.text : '';
    }

    function renderQuickFixes() {
        const container = document.getElementById('quick-fixes');
        container.innerHTML = '';
        
        analysisData.quickFixes.forEach(fix => {
            let icon, bgColor, borderColor;
            
            if (fix.severity === 'bad') {
                icon = 'fa-exclamation-circle';
                bgColor = 'bg-red-50';
                borderColor = 'border-red-400';
            } else if (fix.severity === 'warning') {
                icon = 'fa-exclamation-triangle';
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-400';
            } else {
                icon = 'fa-info-circle';
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-400';
            }
            
            const fixElement = document.createElement('div');
            fixElement.className = `p-4 ${bgColor} rounded-lg border-l-4 ${borderColor} flex items-start`;
            fixElement.innerHTML = `
                <i class="fas ${icon} mt-0.5 mr-3 text-${fix.severity === 'bad' ? 'red' : fix.severity === 'warning' ? 'yellow' : 'blue'}-400"></i>
                <div>
                    <h4 class="font-medium text-gray-800">${fix.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${fix.description}</p>
                    <button class="text-xs mt-2 text-${fix.severity === 'bad' ? 'red' : fix.severity === 'warning' ? 'yellow' : 'blue'}-500 hover:text-${fix.severity === 'bad' ? 'red' : fix.severity === 'warning' ? 'yellow' : 'blue'}-700 flex items-center learn-more-btn" data-category="${fix.category}" data-title="${fix.title}">
                        Saiba como corrigir <i class="fas fa-chevron-right ml-1 text-xs"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(fixElement);
        });

        document.querySelectorAll('.learn-more-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const title = this.getAttribute('data-title');
                showFixDetails(category, title);
            });
        });
    }

    function showFixDetails(category, title) {
        const categoryData = analysisData.categories[category];
        const issue = categoryData.issues.find(i => i.title === title);
        
        if (issue) {
            modalTitle.textContent = title;
            modalContent.innerHTML = `
                <div class="mb-4">
                    <span class="inline-block px-2 py-1 text-xs font-semibold rounded ${
                        issue.status === 'good' ? 'bg-green-100 text-green-800' : 
                        issue.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }">
                        ${issue.status === 'good' ? 'Bom' : issue.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </span>
                </div>
                <p class="mb-4">${issue.description}</p>
                <h4 class="font-semibold mb-2">Como corrigir:</h4>
                <ul class="list-disc pl-5 mb-4 space-y-1">
                    ${getFixSteps(category, title).map(step => `<li>${step}</li>`).join('')}
                </ul>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <h4 class="font-semibold mb-1">Impacto:</h4>
                    <p>${getFixImpact(category, title)}</p>
                </div>
            `;
            openModal();
        }
    }

    
    function getFixSteps(category, title) {
      
        const steps = {
            'Meta description': [
                "Adicione uma tag <meta name='description'> no <head> do seu HTML",
                "Mantenha a descrição entre 50-160 caracteres",
                "Inclua palavras-chave relevantes naturalmente",
                "Crie descrições únicas para cada página"
            ],
            'Imagens sem alt text': [
                "Adicione o atributo alt a todas as imagens: <img alt='descrição'>",
                "Descreva de forma concisa o conteúdo da imagem",
                "Para imagens decorativas, use alt vazio: alt=''",
                "Não use 'imagem de...' ou 'foto de...' nas descrições"
            ],
            'Tempo de carregamento lento': [
                "Otimize imagens usando ferramentas como TinyPNG",
                "Habilite a compactação GZIP no servidor",
                "Implemente cache HTTP para recursos estáticos",
                "Considere usar uma CDN para distribuir conteúdo"
            ]
        };

        return steps[title] || [
            "Identifique o problema no seu site",
            "Consulte a documentação oficial para soluções recomendadas",
            "Implemente as correções necessárias",
            "Teste novamente após as alterações"
        ];
    }

    
    function getFixImpact(category, title) {
        const impacts = {
            'Meta description': "Melhora o CTR (taxa de cliques) nos resultados de busca e pode ajudar no posicionamento SEO.",
            'Imagens sem alt text': "Melhora a acessibilidade para usuários com deficiência visual e ajuda no SEO para buscas de imagens.",
            'Tempo de carregamento lento': "Melhor experiência do usuário, menor taxa de rejeição e melhor posicionamento no ranking do Google."
        };

        return impacts[title] || "Esta correção pode melhorar significativamente a qualidade geral do seu site.";
    }

    function renderDetailedResults() {
        for (const category in analysisData.categories) {
            const container = document.querySelector(`#${category}-tab`);
            if (container) {
                container.innerHTML = '';
                
                analysisData.categories[category].issues.forEach(issue => {
                    let icon, textColor;
                    
                    if (issue.status === 'good') {
                        icon = 'fa-check-circle';
                        textColor = 'text-green-500';
                    } else if (issue.status === 'warning') {
                        icon = 'fa-exclamation-triangle';
                        textColor = 'text-yellow-500';
                    } else {
                        icon = 'fa-times-circle';
                        textColor = 'text-red-500';
                    }
                    
                    const issueElement = document.createElement('div');
                    issueElement.className = `result-card ${issue.status} p-4 mb-4 cursor-pointer issue-card`;
                    issueElement.setAttribute('data-category', category);
                    issueElement.setAttribute('data-title', issue.title);
                    issueElement.innerHTML = `
                        <div class="flex items-start">
                            <i class="fas ${icon} ${textColor} mt-0.5 mr-3"></i>
                            <div>
                                <h4 class="font-medium text-gray-800">${issue.title}</h4>
                                <p class="text-sm text-gray-600 mt-1">${issue.description}</p>
                            </div>
                        </div>
                    `;
                    
                    container.appendChild(issueElement);
                });
            }
        }


        document.querySelectorAll('.issue-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                const title = this.getAttribute('data-title');
                showFixDetails(category, title);
            });
        });
    }

    function initHistoryChart() {
        const ctx = document.getElementById('history-chart').getContext('2d');
        
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Pontuação do Site',
                    data: [65, 59, 70, 71, 74, 78],
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }


    function addCompetitor() {
        const url = competitorUrl.value.trim();
        if (url && isValidUrl(url)) {
            const competitorItem = document.createElement('li');
            competitorItem.className = 'flex items-center justify-between bg-gray-50 p-2 rounded';
            competitorItem.innerHTML = `
                <span class="truncate">${url}</span>
                <button class="text-red-500 hover:text-red-700 remove-competitor">
                    <i class="fas fa-times"></i>
                </button>
            `;
            competitorsList.appendChild(competitorItem);
            competitorUrl.value = '';
            
            updateComparisonChart();
        } else {
            alert('Por favor, insira uma URL válida');
        }
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function updateComparisonChart() {
        console.log('Atualizando gráfico de comparação com concorrentes');
    }

    function openModal() {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function analyzeSite(url) {
        loadingSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        const loadingMessages = [
            "Iniciando análise...",
            "Verificando estrutura do site...",
            "Analisando SEO...",
            "Testando performance...",
            "Checando acessibilidade...",
            "Verificando segurança...",
            "Gerando relatório..."
        ];
        
        let progress = 0;
        let messageIndex = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            loadingBar.style.width = `${progress}%`;
            
            if (progress >= (messageIndex + 1) * 15 && messageIndex < loadingMessages.length - 1) {
                messageIndex++;
                loadingStatus.textContent = loadingMessages[messageIndex];
            }
            
            if (progress === 100) {
                clearInterval(interval);
                
                setTimeout(() => {
                    loadingSection.classList.add('hidden');
                    resultsSection.classList.remove('hidden');
                    
                    animateNumber('score-value', analysisData.score);
                    animateProgressBar('structure-progress', analysisData.categories.structure.score);
                    animateProgressBar('seo-progress', analysisData.categories.seo.score);
                    animateProgressBar('performance-progress', analysisData.categories.performance.score);
                    animateProgressBar('accessibility-progress', analysisData.categories.accessibility.score);
                    animateScoreCircle(analysisData.score);
                    
                    document.getElementById('structure-score').textContent = `${analysisData.categories.structure.score}/100`;
                    document.getElementById('seo-score').textContent = `${analysisData.categories.seo.score}/100`;
                    document.getElementById('performance-score').textContent = `${analysisData.categories.performance.score}/100`;
                    document.getElementById('accessibility-score').textContent = `${analysisData.categories.accessibility.score}/100`;
                    
                    updateScoreFeedback(analysisData.score);
                    
                    renderQuickFixes();
                    renderDetailedResults();
                    
                    initHistoryChart();
                    
                }, 500);
            }
        }, 200);
    }


    analyzeBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url && isValidUrl(url)) {
            analyzeSite(url);
        } else {
            alert('Por favor, insira uma URL válida começando com http:// ou https://');
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });

    saveReportBtn.addEventListener('click', () => {
        alert('Relatório salvo com sucesso! (simulação)');
      
    });

    showAllIssuesBtn.addEventListener('click', () => {
        alert('Mostrando todas as recomendações... (simulação)');
    });

    addCompetitorBtn.addEventListener('click', addCompetitor);

    competitorUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCompetitor();
        }
    });

    competitorsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-competitor') || e.target.closest('.remove-competitor')) {
            const item = e.target.closest('li');
            item.remove();
            updateComparisonChart();
        }
    });

    closeModalBtn.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => {
                btn.classList.remove('active', 'text-indigo-600', 'border-indigo-500');
                btn.classList.add('text-gray-500', 'border-transparent');
            });
            
            button.classList.add('active', 'text-indigo-600', 'border-indigo-500');
            button.classList.remove('text-gray-500', 'border-transparent');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                content.classList.add('hidden');
            });
            
            const tabId = button.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);
            if (tabContent) {
                tabContent.classList.remove('hidden');
                tabContent.classList.add('active');
            }
        });
    });

    document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.addEventListener('mouseenter', function() {
            console.log('Tooltip:', this.getAttribute('data-tooltip'));
        });
    });
});

