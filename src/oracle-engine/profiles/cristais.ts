export interface CristaisInput {
  fullName: string;
  birthDate: string;
  question?: string;
}

export type TemaCristais =
  | 'amor'
  | 'trabalho'
  | 'prosperidade'
  | 'espiritualidade'
  | 'família'
  | 'proteção'
  | 'saúde'
  | 'geral';

export interface Cristal {
  id: string;
  nome: string;
  cor: string;
  elemento: string;
  chakra: string;
  vibracao: string;
  palavrasChave: string[];
  significado: string;
  luz: string;
  sombra: string;
  amor: string;
  trabalho: string;
  prosperidade: string;
  espiritualidade: string;
  conselho: string;
  alerta: string;
  usoSimbolico: string;
  polaridade: 'favorável' | 'neutra' | 'desafiadora';
}

export interface CristalSelecionado {
  posicao:
    | 'essencia'
    | 'emocional'
    | 'mental'
    | 'material'
    | 'espiritual'
    | 'bloqueio'
    | 'integracao';
  titulo: string;
  cristal: Cristal;
  interpretacaoTematica: string;
}

export interface CristaisResultado {
  oracle: 'cristais';
  entrada: {
    fullName: string;
    birthDate: string;
    question: string;
  };
  tema: TemaCristais;
  metodo: {
    nome: string;
    quantidadeCristais: number;
    descricao: string;
  };
  leitura: {
    essencia: CristalSelecionado;
    emocional: CristalSelecionado;
    mental: CristalSelecionado;
    material: CristalSelecionado;
    espiritual: CristalSelecionado;
    bloqueio: CristalSelecionado;
    integracao: CristalSelecionado;
  };
  sintese: {
    chakrasDominantes: string[];
    elementosDominantes: string[];
    temasRepetidos: string[];
    cristaisFavoraveis: string[];
    cristaisDesafiadores: string[];
    direcaoPrincipal: string;
  };
  resumoParaOraculo: string;
}

const CRISTAIS: Cristal[] = [
  {
    id: 'quartzo-transparente',
    nome: 'Quartzo Transparente',
    cor: 'transparente',
    elemento: 'Todos',
    chakra: 'Coronário',
    vibracao: 'amplificação, clareza e integração',
    palavrasChave: ['clareza', 'amplificação', 'integração', 'foco', 'purificação'],
    significado:
      'Representa clareza, integração e capacidade de amplificar a intenção consciente.',
    luz:
      'foco, organização, limpeza simbólica, percepção e integração entre diferentes áreas.',
    sombra:
      'excesso de estímulo, dispersão amplificada e intenção mal definida.',
    amor:
      'pede clareza de sentimentos, sinceridade e alinhamento entre intenção e atitude.',
    trabalho:
      'favorece foco, organização e visão ampla de projetos.',
    prosperidade:
      'mostra que os resultados crescem quando existe direção clara.',
    espiritualidade:
      'simboliza integração, consciência e refinamento da intenção.',
    conselho:
      'defina com precisão o que deseja fortalecer.',
    alerta:
      'tudo que é amplificado precisa ser escolhido com responsabilidade.',
    usoSimbolico:
      'pode ser usado como símbolo de clareza durante reflexão ou meditação.',
    polaridade: 'favorável'
  },
  {
    id: 'ametista',
    nome: 'Ametista',
    cor: 'violeta',
    elemento: 'Ar e Espírito',
    chakra: 'Frontal e Coronário',
    vibracao: 'serenidade, discernimento e transmutação',
    palavrasChave: ['serenidade', 'intuição', 'discernimento', 'transmutação', 'proteção'],
    significado:
      'Representa serenidade, discernimento, percepção e transformação de padrões mentais.',
    luz:
      'calma, lucidez, intuição, autocontrole e amadurecimento espiritual.',
    sombra:
      'fuga da realidade, idealização e passividade excessiva.',
    amor:
      'orienta a reduzir ansiedade e observar a relação com mais lucidez.',
    trabalho:
      'favorece concentração, prudência e decisões menos impulsivas.',
    prosperidade:
      'pede estratégia, paciência e cuidado com expectativas irreais.',
    espiritualidade:
      'simboliza discernimento, silêncio interior e transmutação de padrões.',
    conselho:
      'acalme a mente antes de decidir.',
    alerta:
      'espiritualidade não deve ser usada para evitar decisões concretas.',
    usoSimbolico:
      'pode representar silêncio, proteção e concentração.',
    polaridade: 'favorável'
  },
  {
    id: 'quartzo-rosa',
    nome: 'Quartzo Rosa',
    cor: 'rosa',
    elemento: 'Água',
    chakra: 'Cardíaco',
    vibracao: 'acolhimento, afeto e amor-próprio',
    palavrasChave: ['amor', 'acolhimento', 'autoestima', 'cura emocional', 'gentileza'],
    significado:
      'Representa amor-próprio, acolhimento, ternura e reconstrução emocional.',
    luz:
      'afeto, compaixão, equilíbrio emocional, gentileza e abertura do coração.',
    sombra:
      'carência, dependência, idealização e dificuldade de estabelecer limites.',
    amor:
      'favorece reconciliação interna, autoestima e relações mais afetuosas.',
    trabalho:
      'pede relações profissionais mais humanas e respeitosas.',
    prosperidade:
      'mostra que segurança emocional influencia decisões materiais.',
    espiritualidade:
      'simboliza cura do coração e compaixão consciente.',
    conselho:
      'cuide de si com a mesma dedicação que oferece aos outros.',
    alerta:
      'amor sem limite pode transformar-se em abandono de si.',
    usoSimbolico:
      'pode representar amor-próprio durante práticas de reflexão.',
    polaridade: 'favorável'
  },
  {
    id: 'citrino',
    nome: 'Citrino',
    cor: 'amarelo dourado',
    elemento: 'Fogo',
    chakra: 'Plexo Solar',
    vibracao: 'confiança, criatividade e prosperidade',
    palavrasChave: ['prosperidade', 'confiança', 'criatividade', 'ação', 'otimismo'],
    significado:
      'Representa confiança, realização, criatividade e expansão material.',
    luz:
      'entusiasmo, iniciativa, prosperidade, autonomia e força de realização.',
    sombra:
      'vaidade, euforia, impulsividade e excesso de confiança.',
    amor:
      'pede autoestima, clareza de desejo e atitude madura.',
    trabalho:
      'favorece liderança, visibilidade, criatividade e iniciativa.',
    prosperidade:
      'é fortemente associado a expansão, organização e confiança material.',
    espiritualidade:
      'simboliza luz pessoal e responsabilidade pelo próprio poder.',
    conselho:
      'aja com confiança, mas mantenha planejamento.',
    alerta:
      'otimismo sem estrutura pode gerar desperdício.',
    usoSimbolico:
      'pode representar confiança e direcionamento para metas.',
    polaridade: 'favorável'
  },
  {
    id: 'turmalina-negra',
    nome: 'Turmalina Negra',
    cor: 'preto',
    elemento: 'Terra',
    chakra: 'Básico',
    vibracao: 'proteção, limite e enraizamento',
    palavrasChave: ['proteção', 'limite', 'enraizamento', 'defesa', 'estabilidade'],
    significado:
      'Representa proteção, limites, estabilidade e necessidade de manter os pés na realidade.',
    luz:
      'segurança, enraizamento, firmeza, proteção e discernimento.',
    sombra:
      'medo, fechamento, desconfiança excessiva e rigidez.',
    amor:
      'orienta a proteger limites emocionais sem bloquear a intimidade.',
    trabalho:
      'favorece prudência, disciplina e proteção de interesses.',
    prosperidade:
      'pede segurança, organização e prevenção de perdas.',
    espiritualidade:
      'simboliza proteção, aterramento e retorno ao corpo.',
    conselho:
      'fortaleça seus limites e verifique os fatos.',
    alerta:
      'não viva permanentemente em estado de defesa.',
    usoSimbolico:
      'pode representar proteção e aterramento em práticas pessoais.',
    polaridade: 'favorável'
  },
  {
    id: 'obsidiana',
    nome: 'Obsidiana',
    cor: 'preto profundo',
    elemento: 'Fogo e Terra',
    chakra: 'Básico',
    vibracao: 'verdade, corte e profundidade',
    palavrasChave: ['verdade', 'sombra', 'corte', 'profundidade', 'autoconhecimento'],
    significado:
      'Representa confronto com a verdade, corte de ilusões e investigação profunda.',
    luz:
      'lucidez, coragem, libertação, profundidade e transformação.',
    sombra:
      'dureza, obsessão, confronto excessivo e mergulho sem suporte.',
    amor:
      'revela padrões intensos, dependências ou verdades que precisam ser encaradas.',
    trabalho:
      'pede transparência e corte de práticas prejudiciais.',
    prosperidade:
      'aconselha identificar perdas ocultas e eliminar excessos.',
    espiritualidade:
      'simboliza trabalho de sombra e verdade interior.',
    conselho:
      'encare a verdade sem usar a verdade como arma.',
    alerta:
      'processos profundos exigem ritmo, suporte e responsabilidade.',
    usoSimbolico:
      'pode representar reflexão sobre padrões ocultos.',
    polaridade: 'desafiadora'
  },
  {
    id: 'selenita',
    nome: 'Selenita',
    cor: 'branco translúcido',
    elemento: 'Ar e Espírito',
    chakra: 'Coronário',
    vibracao: 'leveza, limpeza e elevação',
    palavrasChave: ['leveza', 'limpeza', 'clareza', 'elevação', 'paz'],
    significado:
      'Representa leveza, organização energética simbólica, paz e simplificação.',
    luz:
      'serenidade, clareza, pacificação, refinamento e leveza.',
    sombra:
      'fragilidade, fuga, idealização e falta de aterramento.',
    amor:
      'pede menos ruído emocional e mais sinceridade serena.',
    trabalho:
      'favorece organização mental e redução de excessos.',
    prosperidade:
      'mostra necessidade de simplificar processos e prioridades.',
    espiritualidade:
      'simboliza elevação, silêncio e limpeza simbólica.',
    conselho:
      'retire excessos e preserve o essencial.',
    alerta:
      'leveza não significa ignorar responsabilidades concretas.',
    usoSimbolico:
      'pode representar serenidade e limpeza durante contemplação.',
    polaridade: 'favorável'
  },
  {
    id: 'lapis-lazuli',
    nome: 'Lápis-Lazúli',
    cor: 'azul profundo',
    elemento: 'Ar',
    chakra: 'Laríngeo e Frontal',
    vibracao: 'verdade, expressão e sabedoria',
    palavrasChave: ['verdade', 'expressão', 'sabedoria', 'comunicação', 'visão'],
    significado:
      'Representa expressão verdadeira, sabedoria, visão e comunicação consciente.',
    luz:
      'clareza, inteligência, autenticidade, comunicação e discernimento.',
    sombra:
      'arrogância, rigidez de opinião, silêncio orgulhoso e comunicação cortante.',
    amor:
      'pede diálogo sincero e coragem para nomear sentimentos.',
    trabalho:
      'favorece comunicação, estudo, liderança intelectual e negociação.',
    prosperidade:
      'mostra ganhos ligados a conhecimento, voz e estratégia.',
    espiritualidade:
      'simboliza verdade interior e visão consciente.',
    conselho:
      'fale com clareza sem perder a escuta.',
    alerta:
      'a verdade sem empatia pode ferir e fechar caminhos.',
    usoSimbolico:
      'pode representar comunicação e discernimento.',
    polaridade: 'favorável'
  },
  {
    id: 'agua-marinha',
    nome: 'Água-Marinha',
    cor: 'azul claro',
    elemento: 'Água e Ar',
    chakra: 'Laríngeo',
    vibracao: 'calma, fluidez e comunicação',
    palavrasChave: ['calma', 'fluidez', 'comunicação', 'coragem', 'adaptação'],
    significado:
      'Representa comunicação serena, coragem emocional e adaptação.',
    luz:
      'tranquilidade, clareza, leveza, expressão e flexibilidade.',
    sombra:
      'evasão, passividade, dificuldade de confronto e excesso de adaptação.',
    amor:
      'favorece conversas calmas e resolução de mal-entendidos.',
    trabalho:
      'pede comunicação objetiva e adaptação sem perda de identidade.',
    prosperidade:
      'mostra crescimento quando existe fluxo e negociação clara.',
    espiritualidade:
      'simboliza serenidade, respiração e movimento emocional.',
    conselho:
      'fale com calma e mantenha sua posição.',
    alerta:
      'adaptar-se não significa aceitar qualquer condição.',
    usoSimbolico:
      'pode representar serenidade durante conversas importantes.',
    polaridade: 'favorável'
  },
  {
    id: 'olho-de-tigre',
    nome: 'Olho de Tigre',
    cor: 'dourado e marrom',
    elemento: 'Terra e Fogo',
    chakra: 'Plexo Solar',
    vibracao: 'foco, coragem e discernimento',
    palavrasChave: ['foco', 'coragem', 'estratégia', 'discernimento', 'proteção'],
    significado:
      'Representa foco, estratégia, coragem prática e percepção de riscos.',
    luz:
      'autoconfiança, concentração, prudência, ação e proteção.',
    sombra:
      'controle, desconfiança, rigidez e competitividade excessiva.',
    amor:
      'pede discernimento entre atração, realidade e expectativa.',
    trabalho:
      'favorece estratégia, liderança e decisões objetivas.',
    prosperidade:
      'é associado a planejamento, proteção financeira e foco em metas.',
    espiritualidade:
      'simboliza coragem com enraizamento.',
    conselho:
      'observe antes de agir e mantenha foco no objetivo real.',
    alerta:
      'não transforme prudência em vigilância obsessiva.',
    usoSimbolico:
      'pode representar foco e coragem em decisões.',
    polaridade: 'favorável'
  },
  {
    id: 'hematita',
    nome: 'Hematita',
    cor: 'cinza metálico',
    elemento: 'Terra',
    chakra: 'Básico',
    vibracao: 'estrutura, corpo e disciplina',
    palavrasChave: ['estrutura', 'disciplina', 'corpo', 'realidade', 'estabilidade'],
    significado:
      'Representa estrutura, disciplina, presença e retorno à realidade concreta.',
    luz:
      'firmeza, organização, responsabilidade, foco e estabilidade.',
    sombra:
      'rigidez, materialismo, autocobrança e excesso de controle.',
    amor:
      'pede atitudes concretas e estabilidade emocional.',
    trabalho:
      'favorece rotina, disciplina, execução e responsabilidade.',
    prosperidade:
      'mostra necessidade de orçamento, planejamento e consistência.',
    espiritualidade:
      'simboliza aterramento e integração entre consciência e corpo.',
    conselho:
      'transforme intenção em rotina concreta.',
    alerta:
      'disciplina sem flexibilidade pode tornar-se prisão.',
    usoSimbolico:
      'pode representar presença e organização.',
    polaridade: 'neutra'
  },
  {
    id: 'aventurina-verde',
    nome: 'Aventurina Verde',
    cor: 'verde',
    elemento: 'Terra e Água',
    chakra: 'Cardíaco',
    vibracao: 'crescimento, equilíbrio e oportunidade',
    palavrasChave: ['crescimento', 'equilíbrio', 'oportunidade', 'bem-estar', 'confiança'],
    significado:
      'Representa crescimento gradual, equilíbrio e abertura para oportunidades.',
    luz:
      'esperança, renovação, estabilidade, confiança e expansão moderada.',
    sombra:
      'acomodação, dependência da sorte e adiamento de decisões.',
    amor:
      'favorece cura, leveza e abertura para relações mais equilibradas.',
    trabalho:
      'mostra oportunidades que crescem com constância.',
    prosperidade:
      'é associada a crescimento gradual e administração equilibrada.',
    espiritualidade:
      'simboliza renovação e harmonia entre coração e realidade.',
    conselho:
      'aproveite oportunidades com constância, não apenas entusiasmo.',
    alerta:
      'não espere que a sorte substitua planejamento.',
    usoSimbolico:
      'pode representar crescimento e equilíbrio.',
    polaridade: 'favorável'
  },
  {
    id: 'pirita',
    nome: 'Pirita',
    cor: 'dourado metálico',
    elemento: 'Fogo e Terra',
    chakra: 'Plexo Solar',
    vibracao: 'realização, proteção material e estratégia',
    palavrasChave: ['realização', 'prosperidade', 'estratégia', 'proteção', 'ambição'],
    significado:
      'Representa realização, ambição estruturada, estratégia e proteção dos recursos.',
    luz:
      'prosperidade, iniciativa, organização, coragem e força material.',
    sombra:
      'ganância, aparência de riqueza, excesso de ambição e rigidez.',
    amor:
      'pede observar se segurança material está substituindo intimidade.',
    trabalho:
      'favorece liderança, negócios, metas e execução.',
    prosperidade:
      'é fortemente ligada a estratégia, recursos e construção material.',
    espiritualidade:
      'simboliza responsabilidade no uso do poder material.',
    conselho:
      'construa prosperidade com estratégia e ética.',
    alerta:
      'não confunda brilho externo com valor real.',
    usoSimbolico:
      'pode representar metas, organização e prosperidade consciente.',
    polaridade: 'favorável'
  },
  {
    id: 'cornalina',
    nome: 'Cornalina',
    cor: 'laranja avermelhado',
    elemento: 'Fogo',
    chakra: 'Sacral',
    vibracao: 'vitalidade, desejo e criatividade',
    palavrasChave: ['vitalidade', 'criatividade', 'desejo', 'coragem', 'movimento'],
    significado:
      'Representa vitalidade, desejo, criatividade, movimento e coragem para começar.',
    luz:
      'entusiasmo, magnetismo, iniciativa, prazer e expressão criativa.',
    sombra:
      'impulsividade, excesso, ansiedade e busca constante de estímulo.',
    amor:
      'indica atração, desejo e necessidade de maturidade emocional.',
    trabalho:
      'favorece criatividade, iniciativa e projetos novos.',
    prosperidade:
      'mostra ganhos por movimento, vendas e criatividade.',
    espiritualidade:
      'simboliza energia vital e integração do desejo.',
    conselho:
      'transforme impulso em criação consistente.',
    alerta:
      'não confunda intensidade com direção.',
    usoSimbolico:
      'pode representar criatividade e coragem.',
    polaridade: 'favorável'
  },
  {
    id: 'granada',
    nome: 'Granada',
    cor: 'vermelho profundo',
    elemento: 'Fogo e Terra',
    chakra: 'Básico',
    vibracao: 'paixão, resistência e compromisso',
    palavrasChave: ['paixão', 'resistência', 'compromisso', 'força', 'persistência'],
    significado:
      'Representa paixão, resistência, comprometimento e força para atravessar períodos exigentes.',
    luz:
      'coragem, lealdade, persistência, magnetismo e força.',
    sombra:
      'obsessão, ciúme, intensidade destrutiva e dificuldade de soltar.',
    amor:
      'indica vínculo intenso, desejo e necessidade de equilibrar paixão e liberdade.',
    trabalho:
      'favorece persistência, compromisso e conclusão de tarefas.',
    prosperidade:
      'mostra resultado por resistência e constância.',
    espiritualidade:
      'simboliza força vital e compromisso com o próprio caminho.',
    conselho:
      'use intensidade para sustentar, não para controlar.',
    alerta:
      'paixão sem limite pode transformar-se em prisão.',
    usoSimbolico:
      'pode representar coragem e persistência.',
    polaridade: 'neutra'
  },
  {
    id: 'pedra-da-lua',
    nome: 'Pedra da Lua',
    cor: 'branco leitoso',
    elemento: 'Água',
    chakra: 'Sacral e Coronário',
    vibracao: 'ciclos, intuição e sensibilidade',
    palavrasChave: ['intuição', 'ciclos', 'sensibilidade', 'receptividade', 'mudança'],
    significado:
      'Representa ciclos, sensibilidade, intuição e adaptação às mudanças internas.',
    luz:
      'percepção, acolhimento, criatividade, receptividade e renovação.',
    sombra:
      'instabilidade emocional, idealização, passividade e oscilação.',
    amor:
      'mostra sentimentos profundos, ciclos afetivos e necessidade de segurança emocional.',
    trabalho:
      'pede adaptação e respeito ao próprio ritmo.',
    prosperidade:
      'aconselha não decidir sob forte oscilação emocional.',
    espiritualidade:
      'simboliza intuição, ciclos e percepção do inconsciente.',
    conselho:
      'observe os ciclos antes de reagir.',
    alerta:
      'não transforme emoção momentânea em verdade definitiva.',
    usoSimbolico:
      'pode representar ciclos e sensibilidade.',
    polaridade: 'neutra'
  },
  {
    id: 'labradorita',
    nome: 'Labradorita',
    cor: 'cinza com reflexos',
    elemento: 'Água e Ar',
    chakra: 'Frontal',
    vibracao: 'mistério, percepção e transformação',
    palavrasChave: ['percepção', 'mistério', 'transformação', 'limite', 'intuição'],
    significado:
      'Representa percepção sutil, transformação e necessidade de distinguir aparência de essência.',
    luz:
      'intuição, criatividade, proteção simbólica, adaptação e visão.',
    sombra:
      'fantasia, confusão, projeção e fascínio pelo oculto.',
    amor:
      'pede cuidado com idealização e leitura excessiva de sinais.',
    trabalho:
      'favorece criatividade e percepção de tendências.',
    prosperidade:
      'aconselha verificar fatos antes de seguir uma impressão.',
    espiritualidade:
      'simboliza mistério, percepção e transformação de identidade.',
    conselho:
      'use a intuição como hipótese, não como prova.',
    alerta:
      'o brilho do mistério pode esconder falta de clareza.',
    usoSimbolico:
      'pode representar percepção e transição.',
    polaridade: 'neutra'
  },
  {
    id: 'malaquita',
    nome: 'Malaquita',
    cor: 'verde intenso',
    elemento: 'Terra e Água',
    chakra: 'Cardíaco',
    vibracao: 'transformação, verdade emocional e movimento',
    palavrasChave: ['transformação', 'verdade emocional', 'mudança', 'coragem', 'libertação'],
    significado:
      'Representa transformação emocional, revelação de padrões e coragem para mudar.',
    luz:
      'libertação, crescimento, verdade, renovação e consciência emocional.',
    sombra:
      'intensidade, dramatização, apego ao processo e confronto sem medida.',
    amor:
      'revela padrões afetivos que precisam ser transformados.',
    trabalho:
      'pede mudança consciente de hábitos e relações desgastantes.',
    prosperidade:
      'mostra que o crescimento exige cortar padrões improdutivos.',
    espiritualidade:
      'simboliza transformação profunda do coração.',
    conselho:
      'mude o padrão, não apenas a aparência da situação.',
    alerta:
      'transformação sem estrutura pode gerar novo desequilíbrio.',
    usoSimbolico:
      'pode representar mudança e verdade emocional.',
    polaridade: 'desafiadora'
  },
  {
    id: 'amazonita',
    nome: 'Amazonita',
    cor: 'verde azulado',
    elemento: 'Água e Ar',
    chakra: 'Cardíaco e Laríngeo',
    vibracao: 'verdade, equilíbrio e expressão',
    palavrasChave: ['verdade', 'equilíbrio', 'expressão', 'limites', 'harmonia'],
    significado:
      'Representa expressão equilibrada, verdade pessoal e alinhamento entre sentimento e palavra.',
    luz:
      'autenticidade, calma, comunicação, equilíbrio e coragem emocional.',
    sombra:
      'evasão, medo de conflito, silenciamento e adaptação excessiva.',
    amor:
      'favorece diálogo verdadeiro e limites afetivos saudáveis.',
    trabalho:
      'pede comunicação clara e respeito aos próprios valores.',
    prosperidade:
      'mostra que acordos melhores dependem de posicionamento.',
    espiritualidade:
      'simboliza coerência entre coração e voz.',
    conselho:
      'diga o que precisa ser dito com respeito e firmeza.',
    alerta:
      'evitar conflito pode prolongar situações injustas.',
    usoSimbolico:
      'pode representar verdade e equilíbrio.',
    polaridade: 'favorável'
  },
  {
    id: 'fluorita',
    nome: 'Fluorita',
    cor: 'verde, violeta ou multicolorida',
    elemento: 'Ar',
    chakra: 'Frontal',
    vibracao: 'organização, estudo e discernimento',
    palavrasChave: ['organização', 'estudo', 'discernimento', 'foco', 'ordem'],
    significado:
      'Representa organização mental, estudo, análise e separação entre informação útil e ruído.',
    luz:
      'foco, inteligência, método, aprendizagem e clareza.',
    sombra:
      'excesso de análise, perfeccionismo e paralisia mental.',
    amor:
      'pede observar fatos sem reduzir sentimentos a lógica fria.',
    trabalho:
      'favorece estudo, planejamento e resolução estruturada.',
    prosperidade:
      'mostra ganhos por organização e conhecimento.',
    espiritualidade:
      'simboliza discernimento e ordem interior.',
    conselho:
      'organize informações antes de decidir.',
    alerta:
      'pensar demais também pode impedir o movimento.',
    usoSimbolico:
      'pode representar estudo e foco.',
    polaridade: 'favorável'
  },
  {
    id: 'sodalita',
    nome: 'Sodalita',
    cor: 'azul',
    elemento: 'Ar',
    chakra: 'Laríngeo e Frontal',
    vibracao: 'razão, verdade e coerência',
    palavrasChave: ['razão', 'verdade', 'coerência', 'comunicação', 'autoconhecimento'],
    significado:
      'Representa coerência, racionalidade, verdade e organização das ideias.',
    luz:
      'clareza, sinceridade, entendimento, disciplina mental e comunicação.',
    sombra:
      'frieza, rigidez, isolamento intelectual e crítica excessiva.',
    amor:
      'pede diálogo claro sem abandonar a sensibilidade.',
    trabalho:
      'favorece análise, escrita, planejamento e negociação.',
    prosperidade:
      'mostra crescimento por conhecimento e decisões racionais.',
    espiritualidade:
      'simboliza honestidade interior e coerência.',
    conselho:
      'alinhe pensamento, palavra e atitude.',
    alerta:
      'não use racionalidade para evitar vulnerabilidade.',
    usoSimbolico:
      'pode representar coerência e comunicação.',
    polaridade: 'neutra'
  },
  {
    id: 'jaspe-vermelho',
    nome: 'Jaspe Vermelho',
    cor: 'vermelho terroso',
    elemento: 'Terra e Fogo',
    chakra: 'Básico',
    vibracao: 'resistência, estabilidade e ação',
    palavrasChave: ['resistência', 'estabilidade', 'ação', 'coragem', 'persistência'],
    significado:
      'Representa resistência, estabilidade, coragem e capacidade de agir de forma concreta.',
    luz:
      'firmeza, persistência, energia, disciplina e presença.',
    sombra:
      'teimosia, dureza, impulsividade e insistência improdutiva.',
    amor:
      'pede atitudes consistentes e respeito aos limites.',
    trabalho:
      'favorece execução, perseverança e construção.',
    prosperidade:
      'mostra resultado por disciplina e continuidade.',
    espiritualidade:
      'simboliza aterramento e coragem.',
    conselho:
      'mantenha constância sem perder flexibilidade.',
    alerta:
      'persistência não é obrigação de insistir no que acabou.',
    usoSimbolico:
      'pode representar força e estabilidade.',
    polaridade: 'favorável'
  },
  {
    id: 'onix',
    nome: 'Ônix',
    cor: 'preto',
    elemento: 'Terra',
    chakra: 'Básico',
    vibracao: 'autocontrole, limite e responsabilidade',
    palavrasChave: ['autocontrole', 'limite', 'responsabilidade', 'disciplina', 'proteção'],
    significado:
      'Representa autocontrole, limites, responsabilidade e capacidade de sustentar decisões.',
    luz:
      'disciplina, firmeza, proteção, maturidade e estabilidade.',
    sombra:
      'frieza, isolamento, rigidez e repressão emocional.',
    amor:
      'pede limites claros e responsabilidade afetiva.',
    trabalho:
      'favorece disciplina, estratégia e resistência.',
    prosperidade:
      'mostra necessidade de controle de gastos e compromisso.',
    espiritualidade:
      'simboliza limite, contenção e força interior.',
    conselho:
      'sustente sua decisão sem endurecer o coração.',
    alerta:
      'controle excessivo pode bloquear ajuda e intimidade.',
    usoSimbolico:
      'pode representar disciplina e proteção.',
    polaridade: 'neutra'
  },
  {
    id: 'rodonita',
    nome: 'Rodonita',
    cor: 'rosa com preto',
    elemento: 'Terra e Água',
    chakra: 'Cardíaco',
    vibracao: 'reparação, perdão e responsabilidade emocional',
    palavrasChave: ['perdão', 'reparação', 'equilíbrio emocional', 'limite', 'compaixão'],
    significado:
      'Representa reparação emocional, perdão consciente e responsabilidade pelos próprios padrões.',
    luz:
      'compaixão, equilíbrio, maturidade, reconciliação interna e restauração.',
    sombra:
      'culpa, ressentimento, repetição de feridas e tentativa de salvar todos.',
    amor:
      'pede reparação, diálogo e perdão sem retorno automático a padrões nocivos.',
    trabalho:
      'favorece mediação e correção de conflitos.',
    prosperidade:
      'mostra necessidade de reparar decisões e reorganizar relações.',
    espiritualidade:
      'simboliza compaixão com responsabilidade.',
    conselho:
      'perdoe sem abandonar o aprendizado e os limites.',
    alerta:
      'perdão não exige tolerar repetição de dano.',
    usoSimbolico:
      'pode representar reparação emocional.',
    polaridade: 'favorável'
  },
  {
    id: 'esmeralda',
    nome: 'Esmeralda',
    cor: 'verde vivo',
    elemento: 'Terra e Água',
    chakra: 'Cardíaco',
    vibracao: 'renovação, lealdade e abundância',
    palavrasChave: ['renovação', 'lealdade', 'abundância', 'verdade', 'crescimento'],
    significado:
      'Representa renovação, lealdade, crescimento e abundância acompanhada de valores.',
    luz:
      'prosperidade, amor maduro, fidelidade, crescimento e equilíbrio.',
    sombra:
      'ciúme, possessividade, expectativa elevada e apego.',
    amor:
      'favorece compromisso, crescimento e verdade afetiva.',
    trabalho:
      'mostra reconhecimento, crescimento e alianças de valor.',
    prosperidade:
      'é associada a abundância construída com constância e ética.',
    espiritualidade:
      'simboliza renovação do coração e coerência.',
    conselho:
      'cultive o que deseja preservar.',
    alerta:
      'não transforme valor em posse.',
    usoSimbolico:
      'pode representar crescimento e compromisso.',
    polaridade: 'favorável'
  },
  {
    id: 'pedra-do-sol',
    nome: 'Pedra do Sol',
    cor: 'laranja dourado',
    elemento: 'Fogo',
    chakra: 'Plexo Solar',
    vibracao: 'alegria, autonomia e visibilidade',
    palavrasChave: ['alegria', 'autonomia', 'visibilidade', 'confiança', 'sucesso'],
    significado:
      'Representa alegria, autonomia, confiança e capacidade de ocupar espaço.',
    luz:
      'otimismo, liderança, brilho, independência e criatividade.',
    sombra:
      'vaidade, ego, exposição excessiva e necessidade de aprovação.',
    amor:
      'pede autoestima e alegria sem dependência da validação do outro.',
    trabalho:
      'favorece visibilidade, liderança e reconhecimento.',
    prosperidade:
      'mostra expansão por iniciativa e confiança.',
    espiritualidade:
      'simboliza luz pessoal e autonomia.',
    conselho:
      'apareça com verdade, não como personagem.',
    alerta:
      'brilhar não exige apagar ninguém.',
    usoSimbolico:
      'pode representar confiança e alegria.',
    polaridade: 'favorável'
  },
  {
    id: 'azurita',
    nome: 'Azurita',
    cor: 'azul profundo',
    elemento: 'Ar e Água',
    chakra: 'Frontal',
    vibracao: 'visão, compreensão e profundidade',
    palavrasChave: ['visão', 'compreensão', 'profundidade', 'intuição', 'verdade'],
    significado:
      'Representa visão profunda, compreensão e investigação de causas.',
    luz:
      'discernimento, intuição, inteligência, percepção e estudo.',
    sombra:
      'obsessão mental, isolamento, interpretação excessiva e confusão.',
    amor:
      'pede compreender padrões antes de reagir.',
    trabalho:
      'favorece análise, pesquisa e estratégia.',
    prosperidade:
      'mostra ganhos por conhecimento especializado.',
    espiritualidade:
      'simboliza visão interior e investigação consciente.',
    conselho:
      'vá à causa, não apenas ao sintoma.',
    alerta:
      'profundidade sem aterramento pode virar confusão.',
    usoSimbolico:
      'pode representar investigação e discernimento.',
    polaridade: 'neutra'
  },
  {
    id: 'howlita',
    nome: 'Howlita',
    cor: 'branco com veios cinza',
    elemento: 'Ar',
    chakra: 'Coronário',
    vibracao: 'paciência, pausa e serenidade',
    palavrasChave: ['paciência', 'pausa', 'serenidade', 'observação', 'autocontrole'],
    significado:
      'Representa paciência, serenidade e necessidade de reduzir reatividade.',
    luz:
      'calma, reflexão, autocontrole, descanso e compreensão.',
    sombra:
      'passividade, demora excessiva, repressão e fuga de conflito.',
    amor:
      'pede reduzir reatividade e conversar depois que a emoção baixar.',
    trabalho:
      'favorece planejamento e pausa antes de responder sob pressão.',
    prosperidade:
      'aconselha evitar decisões financeiras impulsivas.',
    espiritualidade:
      'simboliza silêncio e serenidade.',
    conselho:
      'diminua a velocidade para enxergar melhor.',
    alerta:
      'paz não significa evitar toda decisão difícil.',
    usoSimbolico:
      'pode representar pausa e autocontrole.',
    polaridade: 'neutra'
  }
];

function normalizar(texto: string): string {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function limparNome(nome: string): string {
  return String(nome || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z]/g, '');
}

function somaTexto(texto: string): number {
  return Array.from(String(texto || '')).reduce(
    (total, caractere, indice) =>
      total + caractere.charCodeAt(0) * (indice + 1),
    0
  );
}

function gerarSemente(input: CristaisInput): number {
  const nome = limparNome(input.fullName);
  const nascimento = String(input.birthDate || '').replace(/\D/g, '');
  const pergunta = normalizar(input.question || '');

  return (
    somaTexto(nome) * 5 +
    somaTexto(nascimento) * 7 +
    somaTexto(pergunta) * 13 +
    nome.length * 17
  );
}

function detectarTema(pergunta: string): TemaCristais {
  const texto = normalizar(pergunta);

  const grupos: Array<[TemaCristais, string[]]> = [
    ['amor', ['amor', 'relacionamento', 'namoro', 'casamento', 'ex', 'volta', 'sentimento', 'paixao', 'saudade']],
    ['trabalho', ['trabalho', 'emprego', 'carreira', 'profissao', 'empresa', 'chefe', 'vaga']],
    ['prosperidade', ['dinheiro', 'prosperidade', 'financeiro', 'riqueza', 'negocio', 'lucro', 'venda']],
    ['espiritualidade', ['espiritual', 'energia', 'missao', 'meditacao', 'intuicao', 'chakra']],
    ['família', ['familia', 'filho', 'filha', 'casa', 'mae', 'pai', 'irmao']],
    ['proteção', ['protecao', 'inveja', 'perseguicao', 'falsidade', 'ameaca', 'demanda']],
    ['saúde', ['saude', 'corpo', 'tratamento', 'doenca', 'cansaco', 'bem estar']]
  ];

  for (const [tema, termos] of grupos) {
    if (termos.some((termo) => texto.includes(termo))) return tema;
  }

  return 'geral';
}

function selecionarCristal(
  semente: number,
  deslocamento: number,
  usados: Set<number>
): Cristal {
  let indice =
    Math.abs(
      semente +
      deslocamento * deslocamento * 11 +
      deslocamento * 23
    ) % CRISTAIS.length;

  while (usados.has(indice)) {
    indice = (indice + 1) % CRISTAIS.length;
  }

  usados.add(indice);

  return CRISTAIS[indice];
}

function interpretarPorTema(
  cristal: Cristal,
  tema: TemaCristais
): string {
  switch (tema) {
    case 'amor':
      return cristal.amor;
    case 'trabalho':
      return cristal.trabalho;
    case 'prosperidade':
      return cristal.prosperidade;
    case 'espiritualidade':
    case 'proteção':
      return cristal.espiritualidade;
    case 'família':
      return `${cristal.significado} No campo familiar, considere especialmente: ${cristal.conselho}`;
    case 'saúde':
      return `${cristal.significado} Em questões de saúde, esta leitura é simbólica e não substitui avaliação profissional.`;
    default:
      return cristal.significado;
  }
}

function criarPosicao(
  posicao: CristalSelecionado['posicao'],
  titulo: string,
  cristal: Cristal,
  tema: TemaCristais
): CristalSelecionado {
  return {
    posicao,
    titulo,
    cristal,
    interpretacaoTematica: interpretarPorTema(cristal, tema)
  };
}

function analisarLeitura(itens: CristalSelecionado[]) {
  const chakras = new Map<string, number>();
  const elementos = new Map<string, number>();
  const temas = new Map<string, number>();

  for (const item of itens) {
    chakras.set(
      item.cristal.chakra,
      (chakras.get(item.cristal.chakra) || 0) + 1
    );

    elementos.set(
      item.cristal.elemento,
      (elementos.get(item.cristal.elemento) || 0) + 1
    );

    for (const palavra of item.cristal.palavrasChave) {
      temas.set(
        palavra,
        (temas.get(palavra) || 0) + 1
      );
    }
  }

  const ordenar = (mapa: Map<string, number>, limite: number) =>
    Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([valor]) => valor);

  return {
    chakrasDominantes: ordenar(chakras, 3),
    elementosDominantes: ordenar(elementos, 3),
    temasRepetidos: Array.from(temas.entries())
      .filter(([, quantidade]) => quantidade >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([valor]) => valor),
    cristaisFavoraveis: itens
      .filter((item) => item.cristal.polaridade === 'favorável')
      .map((item) => item.cristal.nome),
    cristaisDesafiadores: itens
      .filter((item) => item.cristal.polaridade === 'desafiadora')
      .map((item) => item.cristal.nome)
  };
}

function formatarCristal(item: CristalSelecionado): string {
  const cristal = item.cristal;

  return `
═══════════════════════
${item.titulo.toUpperCase()}
═══════════════════════

Cristal:
${cristal.nome}

Cor:
${cristal.cor}

Elemento:
${cristal.elemento}

Chakra regente:
${cristal.chakra}

Vibração:
${cristal.vibracao}

Interpretação:
${item.interpretacaoTematica}

Significado:
${cristal.significado}

Luz:
${cristal.luz}

Sombra:
${cristal.sombra}

Conselho:
${cristal.conselho}

Alerta:
${cristal.alerta}

Uso energético recomendado:
${cristal.usoSimbolico}
`.trim();
}

export function buildCristaisSupremos(
  input: CristaisInput
): CristaisResultado {
  const entrada = {
    fullName: String(input.fullName || '').trim(),
    birthDate: String(input.birthDate || '').trim(),
    question: String(input.question || '').trim()
  };

  const tema = detectarTema(entrada.question);
  const semente = gerarSemente(entrada);
  const usados = new Set<number>();

  const construir = (
    posicao: CristalSelecionado['posicao'],
    titulo: string,
    deslocamento: number
  ) =>
    criarPosicao(
      posicao,
      titulo,
      selecionarCristal(semente, deslocamento, usados),
      tema
    );

  const essencia = construir(
    'essencia',
    'Essência da situação',
    3
  );

  const emocional = construir(
    'emocional',
    'Campo emocional',
    7
  );

  const mental = construir(
    'mental',
    'Campo mental',
    11
  );

  const material = construir(
    'material',
    'Campo material',
    17
  );

  const espiritual = construir(
    'espiritual',
    'Campo espiritual',
    23
  );

  const bloqueio = construir(
    'bloqueio',
    'Bloqueio principal',
    29
  );

  const integracao = construir(
    'integracao',
    'Integração e conselho',
    37
  );

  const itens = [
    essencia,
    emocional,
    mental,
    material,
    espiritual,
    bloqueio,
    integracao
  ];

  const analise = analisarLeitura(itens);

  const direcaoPrincipal =
    `A leitura pede integração por meio de ${integracao.cristal.nome}: ` +
    `${integracao.cristal.conselho}`;

  const resumoParaOraculo = `
CRISTAIS SUPREMOS

Método:
Mandala dos Sete Campos

Tema detectado:
${tema}

${formatarCristal(essencia)}

${formatarCristal(emocional)}

${formatarCristal(mental)}

${formatarCristal(material)}

${formatarCristal(espiritual)}

${formatarCristal(bloqueio)}

${formatarCristal(integracao)}

═══════════════════════
SÍNTESE
═══════════════════════

Chakras simbólicos dominantes:
${analise.chakrasDominantes.join(', ') || 'sem predominância'}

Elementos dominantes:
${analise.elementosDominantes.join(', ') || 'sem predominância'}

Temas repetidos:
${
  analise.temasRepetidos.length
    ? analise.temasRepetidos.join(', ')
    : 'sem repetição temática dominante'
}

Cristais favoráveis:
${
  analise.cristaisFavoraveis.length
    ? analise.cristaisFavoraveis.join(', ')
    : 'nenhuma predominância favorável isolada'
}

Cristais desafiadores:
${
  analise.cristaisDesafiadores.length
    ? analise.cristaisDesafiadores.join(', ')
    : 'nenhuma predominância desafiadora isolada'
}

Direção principal:
${direcaoPrincipal}

═══════════════════════
INSTRUÇÕES PARA O CONSULTOR
═══════════════════════

Interprete os cristais como símbolos de reflexão, linguagem e organização
dos diferentes campos da consulta.

Não apresente propriedades minerais, energéticas ou espirituais como fatos
científicos comprovados.

Não diga que selecionou, sorteou ou calculou cristais.

Não apresente a resposta como relatório técnico.

Cruze:

• a essência da situação;
• o campo emocional;
• o campo mental;
• o campo material;
• o campo espiritual;
• o bloqueio principal;
• a integração final.

Use chakras, cores e elementos apenas como linguagem simbólica.

Em questões de saúde, deixe claro que a leitura não substitui avaliação,
diagnóstico, tratamento ou acompanhamento profissional.

Não recomende abandonar medicamentos, terapias ou cuidados médicos.

Não prometa cura, proteção absoluta, riqueza, retorno amoroso
ou qualquer resultado inevitável.

Não afirme sentimentos ou intenções de terceiros como fatos.

Preserve o livre-arbítrio.

Responda de forma profunda, humana, clara, ética e coerente
com a personalidade do consultor selecionado.
`.trim();

  return {
    oracle: 'cristais',
    entrada,
    tema,
    metodo: {
      nome: 'Mandala dos Sete Campos',
      quantidadeCristais: 7,
      descricao:
        'Leitura simbólica dos campos essencial, emocional, mental, material, espiritual, bloqueio e integração.'
    },
    leitura: {
      essencia,
      emocional,
      mental,
      material,
      espiritual,
      bloqueio,
      integracao
    },
    sintese: {
      chakrasDominantes: analise.chakrasDominantes,
      elementosDominantes: analise.elementosDominantes,
      temasRepetidos: analise.temasRepetidos,
      cristaisFavoraveis: analise.cristaisFavoraveis,
      cristaisDesafiadores: analise.cristaisDesafiadores,
      direcaoPrincipal
    },
    resumoParaOraculo
  };
}

export const CRISTAIS_BASE = CRISTAIS;

export default buildCristaisSupremos;
