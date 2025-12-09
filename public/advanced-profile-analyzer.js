// ========================================
// SISTEMA AVANÇADO DE ANÁLISE DE PERFIL
// VERSÃO COMPLETA
// ========================================

/**
 * Sistema completo de análise de perfil profissional
 * Inclui: análise multidimensional, perfis híbridos, soft skills,
 * compatibilidade cultural e recomendações personalizadas
 */

const ProfileAnalyzer = {
    
    // ========================================
    // 1. DIMENSÕES DE ANÁLISE
    // ========================================
    
    dimensions: {
        innovation: {
            name: 'Inovação',
            weight: 1.0,
            description: 'Capacidade de criar soluções novas e pensar fora da caixa'
        },
        execution: {
            name: 'Execução',
            weight: 1.0,
            description: 'Foco em resultados e conclusão de tarefas'
        },
        leadership: {
            name: 'Liderança',
            weight: 0.9,
            description: 'Capacidade de guiar e inspirar equipes'
        },
        collaboration: {
            name: 'Colaboração',
            weight: 0.9,
            description: 'Trabalho em equipe e comunicação'
        },
        adaptability: {
            name: 'Adaptabilidade',
            weight: 0.85,
            description: 'Flexibilidade frente a mudanças'
        },
        analytical: {
            name: 'Pensamento Analítico',
            weight: 0.85,
            description: 'Capacidade de análise lógica e resolução de problemas'
        },
        autonomy: {
            name: 'Autonomia',
            weight: 0.8,
            description: 'Capacidade de trabalhar independentemente'
        },
        structure: {
            name: 'Estruturação',
            weight: 0.8,
            description: 'Organização e planejamento'
        }
    },

    // ========================================
    // 2. PERFIS PROFISSIONAIS DETALHADOS
    // ========================================
    
    profileTypes: {
        innovator: {
            name: 'O Inovador Visionário',
            emoji: '🚀',
            primaryColor: '#3b82f6',
            requiredScores: {
                innovation: 70,
                adaptability: 60,
                autonomy: 65
            },
            characteristics: [
                'Pensamento criativo e disruptivo',
                'Alta tolerância a ambiguidade',
                'Busca constante por melhorias',
                'Visão de longo prazo',
                'Entusiasmo por novas tecnologias'
            ],
            strengths: [
                'Geração de ideias originais',
                'Identificação de oportunidades',
                'Adaptação rápida a mudanças',
                'Motivação intrínseca'
            ],
            challenges: [
                'Pode perder foco em detalhes',
                'Impaciente com processos lentos',
                'Dificuldade com tarefas repetitivas'
            ],
            idealRoles: [
                'Gerente de Inovação',
                'Product Owner',
                'Estrategista de Negócios',
                'Líder de Transformação Digital'
            ],
            workEnvironment: {
                best: 'Ambientes dinâmicos, startups, áreas de P&D',
                avoid: 'Ambientes muito hierárquicos ou burocráticos'
            }
        },
        
        strategicExecutor: {
            name: 'O Executor Estratégico',
            emoji: '⚡',
            primaryColor: '#f59e0b',
            requiredScores: {
                execution: 70,
                analytical: 65,
                structure: 60
            },
            characteristics: [
                'Equilíbrio entre planejamento e ação',
                'Visão estratégica com foco em resultados',
                'Alta capacidade de priorização',
                'Gestão eficaz de recursos',
                'Orientado a metas'
            ],
            strengths: [
                'Transformação de ideias em realidade',
                'Gestão de projetos complexos',
                'Tomada de decisões baseada em dados',
                'Consistência na entrega'
            ],
            challenges: [
                'Pode ser exigente demais',
                'Tendência a sobrecarregar-se',
                'Dificuldade em delegar'
            ],
            idealRoles: [
                'Gerente de Projetos',
                'Diretor de Operações',
                'Scrum Master',
                'Coordenador de Equipes'
            ],
            workEnvironment: {
                best: 'Empresas em crescimento, áreas de operações',
                avoid: 'Ambientes caóticos sem estrutura'
            }
        },
        
        technicalSpecialist: {
            name: 'O Especialista Técnico',
            emoji: '🔬',
            primaryColor: '#10b981',
            requiredScores: {
                analytical: 70,
                structure: 65,
                execution: 60
            },
            characteristics: [
                'Profundo conhecimento técnico',
                'Atenção meticulosa aos detalhes',
                'Pensamento lógico e sistemático',
                'Busca por excelência técnica',
                'Aprendizado contínuo'
            ],
            strengths: [
                'Resolução de problemas complexos',
                'Qualidade técnica superior',
                'Documentação precisa',
                'Confiabilidade'
            ],
            challenges: [
                'Pode ser perfeccionista em excesso',
                'Dificuldade com ambiguidade',
                'Comunicação muito técnica'
            ],
            idealRoles: [
                'Especialista Técnico',
                'Arquiteto de Soluções',
                'Analista Sênior',
                'Consultor Especializado'
            ],
            workEnvironment: {
                best: 'Centros de excelência, laboratórios, áreas técnicas',
                avoid: 'Ambientes que exigem constante mudança de foco'
            }
        },
        
        collaborativeLeader: {
            name: 'O Líder Colaborativo',
            emoji: '🤝',
            primaryColor: '#8b5cf6',
            requiredScores: {
                leadership: 70,
                collaboration: 70,
                adaptability: 60
            },
            characteristics: [
                'Forte habilidade interpessoal',
                'Empatia e inteligência emocional',
                'Facilitador de processos de grupo',
                'Mediador de conflitos',
                'Inspirador de equipes'
            ],
            strengths: [
                'Construção de relacionamentos',
                'Desenvolvimento de pessoas',
                'Criação de ambientes positivos',
                'Comunicação eficaz'
            ],
            challenges: [
                'Pode evitar confrontos necessários',
                'Dificuldade em decisões impopulares',
                'Sobrecarga emocional'
            ],
            idealRoles: [
                'Gerente de Pessoas',
                'HR Business Partner',
                'Líder de Equipe',
                'Facilitador Ágil'
            ],
            workEnvironment: {
                best: 'Empresas com forte cultura colaborativa',
                avoid: 'Ambientes competitivos e individualistas'
            }
        },
        
        adaptiveGeneralist: {
            name: 'O Generalista Adaptável',
            emoji: '🎭',
            primaryColor: '#ec4899',
            requiredScores: {
                adaptability: 70,
                collaboration: 60,
                autonomy: 55
            },
            characteristics: [
                'Versatilidade em múltiplas áreas',
                'Rápida aprendizagem',
                'Flexibilidade de pensamento',
                'Confortável com múltiplos papéis',
                'Visão holística'
            ],
            strengths: [
                'Adaptação a novos contextos',
                'Ponte entre diferentes áreas',
                'Gestão de múltiplas prioridades',
                'Aprendizado rápido'
            ],
            challenges: [
                'Pode faltar especialização profunda',
                'Dificuldade em escolher um caminho',
                'Risco de dispersão'
            ],
            idealRoles: [
                'Gerente de Projetos Multidisciplinares',
                'Consultor Generalista',
                'Product Manager',
                'Empreendedor'
            ],
            workEnvironment: {
                best: 'Startups, consultorias, projetos variados',
                avoid: 'Posições que exigem especialização extrema'
            }
        },
        
        reliableOperator: {
            name: 'O Operador Confiável',
            emoji: '⚙️',
            primaryColor: '#06b6d4',
            requiredScores: {
                structure: 70,
                execution: 65,
                collaboration: 55
            },
            characteristics: [
                'Consistência e previsibilidade',
                'Forte senso de responsabilidade',
                'Respeito por processos',
                'Trabalho metódico',
                'Lealdade organizacional'
            ],
            strengths: [
                'Confiabilidade absoluta',
                'Manutenção de padrões',
                'Estabilidade operacional',
                'Comprometimento'
            ],
            challenges: [
                'Resistência a mudanças',
                'Dificuldade com inovação',
                'Pode ser inflexível'
            ],
            idealRoles: [
                'Coordenador Operacional',
                'Gestor de Qualidade',
                'Supervisor de Processos',
                'Especialista em Compliance'
            ],
            workEnvironment: {
                best: 'Organizações estabelecidas, áreas reguladas',
                avoid: 'Ambientes muito dinâmicos ou caóticos'
            }
        }
    },

    // ========================================
    // 3. MAPEAMENTO DE PERGUNTAS PARA DIMENSÕES
    // ========================================
    
    questionMapping: {
        innovationVsExecution: {
            leftDimensions: { execution: 1.0, structure: 0.5 },
            rightDimensions: { innovation: 1.0, adaptability: 0.5 }
        },
        autonomyVsCollaboration: {
            leftDimensions: { collaboration: 1.0, structure: 0.3 },
            rightDimensions: { autonomy: 1.0, leadership: 0.4 }
        },
        analyticalVsIntuitive: {
            leftDimensions: { analytical: 1.0, structure: 0.6 },
            rightDimensions: { innovation: 0.8, adaptability: 0.6 }
        },
        leadershipVsExecution: {
            leftDimensions: { execution: 1.0, structure: 0.4 },
            rightDimensions: { leadership: 1.0, collaboration: 0.5 }
        },
        adaptabilityVsStability: {
            leftDimensions: { structure: 1.0, execution: 0.5 },
            rightDimensions: { adaptability: 1.0, innovation: 0.6 }
        }
    },

    // ========================================
    // 4. ANÁLISE PRINCIPAL
    // ========================================
    
    analyzeProfile(answers) {
        const dimensionScores = {};
        const dimensionCounts = {};
        
        Object.keys(this.dimensions).forEach(dim => {
            dimensionScores[dim] = 0;
            dimensionCounts[dim] = 0;
        });

        answers.forEach(answer => {
            const value = parseInt(answer.value);
            const weight = parseFloat(answer.weight) || 1.0;
            const mapping = answer.mapping || 'innovationVsExecution';
            
            const questionMap = this.questionMapping[mapping];
            if (!questionMap) return;

            const normalizedValue = (value - 3) / 2;

            if (normalizedValue < 0) {
                Object.entries(questionMap.leftDimensions).forEach(([dim, impact]) => {
                    dimensionScores[dim] += Math.abs(normalizedValue) * weight * impact * 100;
                    dimensionCounts[dim] += weight * impact;
                });
            }
            
            if (normalizedValue > 0) {
                Object.entries(questionMap.rightDimensions).forEach(([dim, impact]) => {
                    dimensionScores[dim] += normalizedValue * weight * impact * 100;
                    dimensionCounts[dim] += weight * impact;
                });
            }
        });

        const normalizedScores = {};
        Object.keys(dimensionScores).forEach(dim => {
            if (dimensionCounts[dim] > 0) {
                normalizedScores[dim] = Math.min(100, Math.max(0, 
                    dimensionScores[dim] / dimensionCounts[dim]
                ));
            } else {
                normalizedScores[dim] = 50;
            }
        });

        const profileMatches = this.matchProfiles(normalizedScores);
        const primaryProfile = profileMatches[0];
        const secondaryProfile = profileMatches.length > 1 ? profileMatches[1] : null;
        const confidence = this.calculateConfidence(primaryProfile.score, secondaryProfile?.score || 0);
        const behavioralAnalysis = this.generateBehavioralAnalysis(normalizedScores);
        const recommendations = this.generateRecommendations(primaryProfile, normalizedScores);

        return {
            dimensionScores: normalizedScores,
            primaryProfile: {
                ...this.profileTypes[primaryProfile.type],
                matchScore: primaryProfile.score,
                confidence: confidence
            },
            secondaryProfile: secondaryProfile ? {
                ...this.profileTypes[secondaryProfile.type],
                matchScore: secondaryProfile.score
            } : null,
            isHybrid: secondaryProfile && (primaryProfile.score - secondaryProfile.score) < 15,
            behavioralAnalysis: behavioralAnalysis,
            recommendations: recommendations,
            softSkills: this.identifySoftSkills(normalizedScores),
            developmentAreas: this.identifyDevelopmentAreas(normalizedScores),
            culturalFit: this.analyzeCulturalFit(normalizedScores)
        };
    },

    // ========================================
    // 5. MATCHING DE PERFIS
    // ========================================
    
    matchProfiles(dimensionScores) {
        const matches = [];

        Object.entries(this.profileTypes).forEach(([type, profile]) => {
            let totalScore = 0;
            let totalWeight = 0;

            Object.entries(profile.requiredScores).forEach(([dimension, required]) => {
                const actual = dimensionScores[dimension] || 50;
                const weight = this.dimensions[dimension]?.weight || 1.0;
                const difference = Math.abs(actual - required);
                const score = Math.max(0, 100 - difference);
                
                totalScore += score * weight;
                totalWeight += weight;
            });

            const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
            matches.push({ type, score: Math.round(averageScore) });
        });

        return matches.sort((a, b) => b.score - a.score);
    },

    // ========================================
    // 6. CONFIANÇA DA ANÁLISE
    // ========================================
    
    calculateConfidence(primaryScore, secondaryScore) {
        const difference = primaryScore - secondaryScore;
        
        if (difference >= 30) return 'muito-alta';
        if (difference >= 20) return 'alta';
        if (difference >= 10) return 'média';
        return 'baixa';
    },

    // ========================================
    // 7. ANÁLISE COMPORTAMENTAL
    // ========================================
    
    generateBehavioralAnalysis(scores) {
        const analysis = {
            workStyle: '',
            decisionMaking: '',
            teamDynamics: '',
            stressResponse: '',
            learningStyle: ''
        };

        if (scores.autonomy > 65) {
            analysis.workStyle = 'Prefere trabalhar de forma independente, com mínima supervisão. Valoriza liberdade para tomar decisões.';
        } else if (scores.collaboration > 65) {
            analysis.workStyle = 'Prospera em ambientes colaborativos. Gosta de trabalhar em equipe e buscar consenso.';
        } else {
            analysis.workStyle = 'Flexível quanto ao estilo de trabalho. Consegue trabalhar bem tanto individualmente quanto em equipe.';
        }

        if (scores.analytical > 70) {
            analysis.decisionMaking = 'Abordagem analítica e baseada em dados. Prefere ter informações completas antes de decidir.';
        } else if (scores.innovation > 70) {
            analysis.decisionMaking = 'Decisões ágeis e intuitivas. Confortável com ambiguidade e disposto a assumir riscos calculados.';
        } else {
            analysis.decisionMaking = 'Equilibra análise e intuição. Considera dados mas também confia na experiência.';
        }

        if (scores.leadership > 70) {
            analysis.teamDynamics = 'Tendência natural a assumir papéis de liderança. Gosta de guiar e inspirar outros.';
        } else if (scores.collaboration > 70) {
            analysis.teamDynamics = 'Excelente membro de equipe. Contribui ativamente e valoriza as opiniões dos outros.';
        } else {
            analysis.teamDynamics = 'Adapta-se bem a diferentes papéis na equipe, podendo liderar ou contribuir conforme necessário.';
        }

        if (scores.adaptability > 70) {
            analysis.stressResponse = 'Mantém a calma sob pressão. Vê desafios como oportunidades de crescimento.';
        } else if (scores.structure > 70) {
            analysis.stressResponse = 'Gerencia estresse através de planejamento e organização. Prefere ambientes previsíveis.';
        } else {
            analysis.stressResponse = 'Lida com estresse de forma moderada. Beneficia-se de alguma estrutura mas consegue se adaptar.';
        }

        if (scores.innovation > 70) {
            analysis.learningStyle = 'Aprende melhor experimentando e explorando. Gosta de testar novas abordagens.';
        } else if (scores.analytical > 70) {
            analysis.learningStyle = 'Prefere aprendizado estruturado e sistemático. Valoriza fundamentos teóricos sólidos.';
        } else {
            analysis.learningStyle = 'Combina teoria e prática. Aprende tanto estudando quanto fazendo.';
        }

        return analysis;
    },

    // ========================================
    // 8. SOFT SKILLS
    // ========================================
    
    identifySoftSkills(scores) {
        const skills = [];

        if (scores.innovation > 70) {
            skills.push({ 
                name: 'Criatividade', 
                level: 'Alto',
                description: 'Capacidade excepcional de gerar ideias inovadoras' 
            });
        }

        if (scores.analytical > 70) {
            skills.push({ 
                name: 'Pensamento Crítico', 
                level: 'Alto',
                description: 'Forte habilidade de análise e resolução de problemas' 
            });
        }

        if (scores.collaboration > 70) {
            skills.push({ 
                name: 'Trabalho em Equipe', 
                level: 'Alto',
                description: 'Excelente capacidade de colaboração e comunicação' 
            });
        }

        if (scores.leadership > 70) {
            skills.push({ 
                name: 'Liderança', 
                level: 'Alto',
                description: 'Habilidade natural para influenciar e guiar pessoas' 
            });
        }

        if (scores.adaptability > 70) {
            skills.push({ 
                name: 'Resiliência', 
                level: 'Alto',
                description: 'Capacidade de se adaptar rapidamente a mudanças' 
            });
        }

        if (scores.execution > 70) {
            skills.push({ 
                name: 'Orientação a Resultados', 
                level: 'Alto',
                description: 'Forte foco em entrega e cumprimento de metas' 
            });
        }

        if (scores.autonomy > 70) {
            skills.push({
                name: 'Autogestão',
                level: 'Alto',
                description: 'Capacidade de trabalhar com independência e autodisciplina'
            });
        }

        if (scores.structure > 70) {
            skills.push({
                name: 'Organização',
                level: 'Alto',
                description: 'Excelente capacidade de planejamento e estruturação'
            });
        }

        return skills.slice(0, 5);
    },

    // ========================================
    // 9. ÁREAS DE DESENVOLVIMENTO
    // ========================================
    
    identifyDevelopmentAreas(scores) {
        const areas = [];
        const threshold = 50;

        Object.entries(scores).forEach(([dimension, score]) => {
            if (score < threshold) {
                const dimInfo = this.dimensions[dimension];
                areas.push({
                    dimension: dimInfo.name,
                    currentLevel: score,
                    suggestions: this.getSuggestions(dimension, score)
                });
            }
        });

        return areas.sort((a, b) => a.currentLevel - b.currentLevel).slice(0, 3);
    },

    getSuggestions(dimension, score) {
        const suggestions = {
            innovation: [
                'Participe de workshops de design thinking',
                'Dedique tempo para brainstorming sem restrições',
                'Estude cases de inovação em sua área'
            ],
            execution: [
                'Utilize metodologias ágeis como Scrum',
                'Pratique definição de metas SMART',
                'Desenvolva habilidades de gestão do tempo'
            ],
            leadership: [
                'Busque mentorias e coaches de liderança',
                'Assuma projetos que envolvam coordenação de equipe',
                'Estude inteligência emocional'
            ],
            collaboration: [
                'Participe ativamente de projetos em grupo',
                'Desenvolva habilidades de comunicação',
                'Pratique escuta ativa'
            ],
            adaptability: [
                'Exponha-se a situações novas regularmente',
                'Pratique mindfulness para lidar com incertezas',
                'Desenvolva tolerância à ambiguidade'
            ],
            analytical: [
                'Estude lógica e métodos de análise',
                'Pratique resolução de problemas complexos',
                'Aprenda ferramentas de análise de dados'
            ],
            autonomy: [
                'Assuma projetos individuais',
                'Desenvolva autodisciplina e autogestão',
                'Pratique tomada de decisões independentes'
            ],
            structure: [
                'Aprenda técnicas de planejamento',
                'Utilize ferramentas de organização (Trello, Notion)',
                'Desenvolva processos pessoais de trabalho'
            ]
        };

        return suggestions[dimension] || ['Busque desenvolvimento contínuo nesta área'];
    },

    // ========================================
    // 10. FIT CULTURAL
    // ========================================
    
    analyzeCulturalFit(scores) {
        const cultures = {
            startup: {
                name: 'Startup / Scale-up',
                fit: this.calculateCultureFit(scores, {
                    innovation: 80, adaptability: 80, autonomy: 70
                }),
                description: 'Ambiente dinâmico, rápido crescimento, alta autonomia'
            },
            corporate: {
                name: 'Grande Corporação',
                fit: this.calculateCultureFit(scores, {
                    structure: 75, execution: 75, collaboration: 70
                }),
                description: 'Processos estabelecidos, estrutura hierárquica, estabilidade'
            },
            consulting: {
                name: 'Consultoria',
                fit: this.calculateCultureFit(scores, {
                    analytical: 80, adaptability: 75, leadership: 70
                }),
                description: 'Projetos variados, ambiente desafiador, orientação ao cliente'
            },
            technical: {
                name: 'Empresa de Tecnologia',
                fit: this.calculateCultureFit(scores, {
                    innovation: 75, analytical: 75, autonomy: 70
                }),
                description: 'Foco em tecnologia, inovação, ambiente colaborativo'
            },
            social: {
                name: 'Organização Social / ONG',
                fit: this.calculateCultureFit(scores, {
                    collaboration: 80, adaptability: 70, leadership: 65
                }),
                description: 'Propósito social, trabalho colaborativo, impacto comunitário'
            }
        };

        const sorted = Object.values(cultures).sort((a, b) => b.fit - a.fit);
        return sorted.slice(0, 3);
    },

    calculateCultureFit(userScores, requiredScores) {
        let totalFit = 0;
        let count = 0;

        Object.entries(requiredScores).forEach(([dim, required]) => {
            const actual = userScores[dim] || 50;
            const difference = Math.abs(actual - required);
            const fit = Math.max(0, 100 - difference);
            totalFit += fit;
            count++;
        });

        return count > 0 ? Math.round(totalFit / count) : 50;
    },

    // ========================================
    // 11. RECOMENDAÇÕES PERSONALIZADAS
    // ========================================
    
    generateRecommendations(primaryProfile, scores) {
        const recommendations = {
            careerPath: [],
            skillDevelopment: [],
            workEnvironment: [],
            nextSteps: []
        };

        const profile = this.profileTypes[primaryProfile.type];

        recommendations.careerPath = [
            ...profile.idealRoles,
            this.getSuggestedNextRole(primaryProfile.type, scores)
        ];

        recommendations.skillDevelopment = [
            'Invista em suas forças principais: ' + profile.strengths[0],
            'Trabalhe seus desafios: ' + profile.challenges[0],
            'Desenvolva habilidades complementares para seu perfil'
        ];

        recommendations.workEnvironment = [
            `Ideal: ${profile.workEnvironment.best}`,
            `Evite: ${profile.workEnvironment.avoid}`,
            'Busque empresas que valorizem suas principais características'
        ];

        recommendations.nextSteps = this.getNextSteps(primaryProfile.type, scores);

        return recommendations;
    },

    getSuggestedNextRole(profileType, scores) {
        const suggestions = {
            innovator: 'Head de Inovação ou Chief Innovation Officer',
            strategicExecutor: 'Diretor de Operações ou VP de Projetos',
            technicalSpecialist: 'Arquiteto Principal ou Technical Fellow',
            collaborativeLeader: 'Chief People Officer ou VP de Cultura',
            adaptiveGeneralist: 'Chief Product Officer ou Empreendedor',
            reliableOperator: 'Gerente de Operações Sênior ou Diretor de Qualidade'
        };

        return suggestions[profileType] || 'Líder Sênior em sua área';
    },

    getNextSteps(profileType, scores) {
        return [
            'Busque oportunidades que aproveitem suas principais forças',
            'Considere mentorias focadas em suas áreas de desenvolvimento',
            'Avalie sua satisfação atual com base no fit cultural identificado',
            'Desenvolva um plano de carreira alinhado com seu perfil'
        ];
    }
};

// ========================================
// 12. EXPORTAR PARA USO GLOBAL
// ========================================

if (typeof window !== 'undefined') {
    window.ProfileAnalyzer = ProfileAnalyzer;
}

// ========================================
// 13. EXEMPLO DE USO
// ========================================

/*
EXEMPLO DE COMO USAR:

const exampleAnswers = [
    { id: 'q1', value: 4, category: 'inovador', weight: 2, mapping: 'innovationVsExecution' },
    { id: 'q2', value: 3, category: 'executor', weight: 1, mapping: 'autonomyVsCollaboration' },
    { id: 'q3', value: 5, category: 'inovador', weight: 2, mapping: 'adaptabilityVsStability' }
    // ... mais respostas
];

const analysis = ProfileAnalyzer.analyzeProfile(exampleAnswers);

console.log('Perfil Principal:', analysis.primaryProfile.name);
console.log('Match Score:', analysis.primaryProfile.matchScore);
console.log('É Híbrido?', analysis.isHybrid);
console.log('Soft Skills:', analysis.softSkills);
console.log('Fit Cultural:', analysis.culturalFit);
*/
