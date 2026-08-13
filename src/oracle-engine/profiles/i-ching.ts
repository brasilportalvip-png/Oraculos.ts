export interface IChingInput {
  fullName: string;
  birthDate: string;
  question?: string;
}
export type TemaIChing = 'amor'|'trabalho'|'prosperidade'|'espiritualidade'|'família'|'proteção'|'saúde'|'geral';
export interface HexagramaIChing {
  numero:number; id:string; nomeChines:string; nome:string; simbolo:string; estrutura:string; linhas:string;
  palavrasChave:string[]; essencia:string; significado:string; luz:string; sombra:string; conselho:string; alerta:string; tempo:string;
}
export interface LinhaIChing {
  posicao:1|2|3|4|5|6; valor:6|7|8|9; natureza:'yin'|'yang'; mutavel:boolean; interpretacao:string;
}
export interface IChingResultado {
  oracle:'i-ching';
  entrada:{fullName:string;birthDate:string;question:string};
  tema:TemaIChing;
  metodo:{nome:string;descricao:string};
  linhas:LinhaIChing[];
  hexagramaPrincipal:HexagramaIChing;
  hexagramaTransformado:HexagramaIChing|null;
  linhasMutaveis:LinhaIChing[];
  sintese:{energiaInicial:string;movimento:string;direcaoPrincipal:string};
  resumoParaOraculo:string;
}
const HEXAGRAMAS: HexagramaIChing[] = [
  {
    numero: 1,
    id: 'qian',
    nomeChines: 'Qian',
    nome: 'O Criativo',
    simbolo: String.fromCodePoint(0x4dc0 + 0),
    estrutura: 'Céu sobre Céu',
    linhas: '111111',
    palavrasChave: 'força criadora, iniciativa e perseverança'.split(', '),
    essencia: 'força criadora, iniciativa e perseverança',
    significado: 'Este hexagrama expressa força criadora, iniciativa e perseverança.',
    luz: 'força criadora, iniciativa e perseverança quando vividos com consciência e medida.',
    sombra: 'excesso de controle, orgulho e ação sem escuta.',
    conselho: 'agir com firmeza, responsabilidade e constância.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 2,
    id: 'kun',
    nomeChines: 'Kun',
    nome: 'O Receptivo',
    simbolo: String.fromCodePoint(0x4dc0 + 1),
    estrutura: 'Terra sobre Terra',
    linhas: '000000',
    palavrasChave: 'receptividade, sustentação e capacidade de nutrir'.split(', '),
    essencia: 'receptividade, sustentação e capacidade de nutrir',
    significado: 'Este hexagrama expressa receptividade, sustentação e capacidade de nutrir.',
    luz: 'receptividade, sustentação e capacidade de nutrir quando vividos com consciência e medida.',
    sombra: 'passividade, submissão e falta de direção.',
    conselho: 'acolher, organizar e permitir que o processo amadureça.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 3,
    id: 'zhun',
    nomeChines: 'Zhun',
    nome: 'A Dificuldade Inicial',
    simbolo: String.fromCodePoint(0x4dc0 + 2),
    estrutura: 'Água sobre Trovão',
    linhas: '100010',
    palavrasChave: 'começo difícil, crescimento e organização do caos'.split(', '),
    essencia: 'começo difícil, crescimento e organização do caos',
    significado: 'Este hexagrama expressa começo difícil, crescimento e organização do caos.',
    luz: 'começo difícil, crescimento e organização do caos quando vividos com consciência e medida.',
    sombra: 'pressa, confusão e desistência prematura.',
    conselho: 'avançar com paciência, ajuda e planejamento.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 4,
    id: 'meng',
    nomeChines: 'Meng',
    nome: 'A Inexperiência',
    simbolo: String.fromCodePoint(0x4dc0 + 3),
    estrutura: 'Montanha sobre Água',
    linhas: '010001',
    palavrasChave: 'aprendizado, formação e necessidade de orientação'.split(', '),
    essencia: 'aprendizado, formação e necessidade de orientação',
    significado: 'Este hexagrama expressa aprendizado, formação e necessidade de orientação.',
    luz: 'aprendizado, formação e necessidade de orientação quando vividos com consciência e medida.',
    sombra: 'teimosia, ingenuidade e repetição de erros.',
    conselho: 'perguntar, estudar e aceitar limites do conhecimento.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 5,
    id: 'xu',
    nomeChines: 'Xu',
    nome: 'A Espera',
    simbolo: String.fromCodePoint(0x4dc0 + 4),
    estrutura: 'Água sobre Céu',
    linhas: '111010',
    palavrasChave: 'espera ativa, confiança e preparação'.split(', '),
    essencia: 'espera ativa, confiança e preparação',
    significado: 'Este hexagrama expressa espera ativa, confiança e preparação.',
    luz: 'espera ativa, confiança e preparação quando vividos com consciência e medida.',
    sombra: 'ansiedade, precipitação e tentativa de forçar resultados.',
    conselho: 'fortalecer recursos enquanto o momento certo não chega.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 6,
    id: 'song',
    nomeChines: 'Song',
    nome: 'O Conflito',
    simbolo: String.fromCodePoint(0x4dc0 + 5),
    estrutura: 'Céu sobre Água',
    linhas: '010111',
    palavrasChave: 'divergência, disputa e necessidade de clareza'.split(', '),
    essencia: 'divergência, disputa e necessidade de clareza',
    significado: 'Este hexagrama expressa divergência, disputa e necessidade de clareza.',
    luz: 'divergência, disputa e necessidade de clareza quando vividos com consciência e medida.',
    sombra: 'escalada de confronto, orgulho e desgaste.',
    conselho: 'buscar mediação, fatos e limites justos.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 7,
    id: 'shi',
    nomeChines: 'Shi',
    nome: 'O Exército',
    simbolo: String.fromCodePoint(0x4dc0 + 6),
    estrutura: 'Terra sobre Água',
    linhas: '010000',
    palavrasChave: 'disciplina, organização e liderança em tempos difíceis'.split(', '),
    essencia: 'disciplina, organização e liderança em tempos difíceis',
    significado: 'Este hexagrama expressa disciplina, organização e liderança em tempos difíceis.',
    luz: 'disciplina, organização e liderança em tempos difíceis quando vividos com consciência e medida.',
    sombra: 'autoritarismo, desordem e uso indevido da força.',
    conselho: 'definir comando, estratégia e responsabilidade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 8,
    id: 'bi',
    nomeChines: 'Bi',
    nome: 'A União',
    simbolo: String.fromCodePoint(0x4dc0 + 7),
    estrutura: 'Água sobre Terra',
    linhas: '000010',
    palavrasChave: 'união, pertencimento e alianças'.split(', '),
    essencia: 'união, pertencimento e alianças',
    significado: 'Este hexagrama expressa união, pertencimento e alianças.',
    luz: 'união, pertencimento e alianças quando vividos com consciência e medida.',
    sombra: 'dependência, exclusão e alianças sem verdade.',
    conselho: 'aproximar-se de vínculos confiáveis e objetivos comuns.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 9,
    id: 'xiao-chu',
    nomeChines: 'Xiao Chu',
    nome: 'O Pequeno Poder de Domar',
    simbolo: String.fromCodePoint(0x4dc0 + 8),
    estrutura: 'Vento sobre Céu',
    linhas: '111011',
    palavrasChave: 'contenção leve, refinamento e progresso gradual'.split(', '),
    essencia: 'contenção leve, refinamento e progresso gradual',
    significado: 'Este hexagrama expressa contenção leve, refinamento e progresso gradual.',
    luz: 'contenção leve, refinamento e progresso gradual quando vividos com consciência e medida.',
    sombra: 'impaciência, controle sutil e avanço prematuro.',
    conselho: 'aperfeiçoar detalhes e acumular força.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 10,
    id: 'lu',
    nomeChines: 'Lu',
    nome: 'A Conduta',
    simbolo: String.fromCodePoint(0x4dc0 + 9),
    estrutura: 'Céu sobre Lago',
    linhas: '110111',
    palavrasChave: 'comportamento correto, respeito e prudência'.split(', '),
    essencia: 'comportamento correto, respeito e prudência',
    significado: 'Este hexagrama expressa comportamento correto, respeito e prudência.',
    luz: 'comportamento correto, respeito e prudência quando vividos com consciência e medida.',
    sombra: 'imprudência, provocação e falta de limites.',
    conselho: 'agir com consciência das consequências.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 11,
    id: 'tai',
    nomeChines: 'Tai',
    nome: 'A Paz',
    simbolo: String.fromCodePoint(0x4dc0 + 10),
    estrutura: 'Terra sobre Céu',
    linhas: '111000',
    palavrasChave: 'harmonia, circulação e prosperidade'.split(', '),
    essencia: 'harmonia, circulação e prosperidade',
    significado: 'Este hexagrama expressa harmonia, circulação e prosperidade.',
    luz: 'harmonia, circulação e prosperidade quando vividos com consciência e medida.',
    sombra: 'acomodação e confiança excessiva.',
    conselho: 'cooperar e manter o equilíbrio entre forças.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 12,
    id: 'pi',
    nomeChines: 'Pi',
    nome: 'A Estagnação',
    simbolo: String.fromCodePoint(0x4dc0 + 11),
    estrutura: 'Céu sobre Terra',
    linhas: '000111',
    palavrasChave: 'bloqueio, separação e interrupção de fluxo'.split(', '),
    essencia: 'bloqueio, separação e interrupção de fluxo',
    significado: 'Este hexagrama expressa bloqueio, separação e interrupção de fluxo.',
    luz: 'bloqueio, separação e interrupção de fluxo quando vividos com consciência e medida.',
    sombra: 'isolamento, rigidez e insistência improdutiva.',
    conselho: 'preservar integridade e esperar mudança de ciclo.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 13,
    id: 'tong-ren',
    nomeChines: 'Tong Ren',
    nome: 'A Comunhão com os Homens',
    simbolo: String.fromCodePoint(0x4dc0 + 12),
    estrutura: 'Céu sobre Fogo',
    linhas: '101111',
    palavrasChave: 'comunidade, cooperação e objetivos compartilhados'.split(', '),
    essencia: 'comunidade, cooperação e objetivos compartilhados',
    significado: 'Este hexagrama expressa comunidade, cooperação e objetivos compartilhados.',
    luz: 'comunidade, cooperação e objetivos compartilhados quando vividos com consciência e medida.',
    sombra: 'facções, competição e exclusão.',
    conselho: 'agir com transparência e espírito coletivo.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 14,
    id: 'da-you',
    nomeChines: 'Da You',
    nome: 'A Grande Posse',
    simbolo: String.fromCodePoint(0x4dc0 + 13),
    estrutura: 'Fogo sobre Céu',
    linhas: '111101',
    palavrasChave: 'abundância, influência e responsabilidade'.split(', '),
    essencia: 'abundância, influência e responsabilidade',
    significado: 'Este hexagrama expressa abundância, influência e responsabilidade.',
    luz: 'abundância, influência e responsabilidade quando vividos com consciência e medida.',
    sombra: 'vaidade, desperdício e domínio.',
    conselho: 'administrar poder e recursos com humildade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 15,
    id: 'qian',
    nomeChines: 'Qian',
    nome: 'A Modéstia',
    simbolo: String.fromCodePoint(0x4dc0 + 14),
    estrutura: 'Terra sobre Montanha',
    linhas: '001000',
    palavrasChave: 'humildade, equilíbrio e mérito silencioso'.split(', '),
    essencia: 'humildade, equilíbrio e mérito silencioso',
    significado: 'Este hexagrama expressa humildade, equilíbrio e mérito silencioso.',
    luz: 'humildade, equilíbrio e mérito silencioso quando vividos com consciência e medida.',
    sombra: 'autodepreciação ou falsa modéstia.',
    conselho: 'reduzir excessos e agir sem ostentação.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 16,
    id: 'yu',
    nomeChines: 'Yu',
    nome: 'O Entusiasmo',
    simbolo: String.fromCodePoint(0x4dc0 + 15),
    estrutura: 'Trovão sobre Terra',
    linhas: '000100',
    palavrasChave: 'motivação, mobilização e energia coletiva'.split(', '),
    essencia: 'motivação, mobilização e energia coletiva',
    significado: 'Este hexagrama expressa motivação, mobilização e energia coletiva.',
    luz: 'motivação, mobilização e energia coletiva quando vividos com consciência e medida.',
    sombra: 'euforia, ilusão e falta de continuidade.',
    conselho: 'transformar entusiasmo em ação organizada.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 17,
    id: 'sui',
    nomeChines: 'Sui',
    nome: 'O Seguir',
    simbolo: String.fromCodePoint(0x4dc0 + 16),
    estrutura: 'Lago sobre Trovão',
    linhas: '100110',
    palavrasChave: 'adaptação, acompanhamento e resposta ao momento'.split(', '),
    essencia: 'adaptação, acompanhamento e resposta ao momento',
    significado: 'Este hexagrama expressa adaptação, acompanhamento e resposta ao momento.',
    luz: 'adaptação, acompanhamento e resposta ao momento quando vividos com consciência e medida.',
    sombra: 'conformismo, dependência e direção alheia.',
    conselho: 'seguir o que é correto sem perder discernimento.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 18,
    id: 'gu',
    nomeChines: 'Gu',
    nome: 'O Trabalho sobre o Corrompido',
    simbolo: String.fromCodePoint(0x4dc0 + 17),
    estrutura: 'Montanha sobre Vento',
    linhas: '011001',
    palavrasChave: 'correção de padrões antigos e reparação'.split(', '),
    essencia: 'correção de padrões antigos e reparação',
    significado: 'Este hexagrama expressa correção de padrões antigos e reparação.',
    luz: 'correção de padrões antigos e reparação quando vividos com consciência e medida.',
    sombra: 'culpa, repetição e recusa de reparar.',
    conselho: 'investigar causas e restaurar o que foi negligenciado.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 19,
    id: 'lin',
    nomeChines: 'Lin',
    nome: 'A Aproximação',
    simbolo: String.fromCodePoint(0x4dc0 + 18),
    estrutura: 'Terra sobre Lago',
    linhas: '110000',
    palavrasChave: 'aproximação, crescimento e influência favorável'.split(', '),
    essencia: 'aproximação, crescimento e influência favorável',
    significado: 'Este hexagrama expressa aproximação, crescimento e influência favorável.',
    luz: 'aproximação, crescimento e influência favorável quando vividos com consciência e medida.',
    sombra: 'controle, invasão e entusiasmo sem medida.',
    conselho: 'chegar com abertura, presença e responsabilidade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 20,
    id: 'guan',
    nomeChines: 'Guan',
    nome: 'A Contemplação',
    simbolo: String.fromCodePoint(0x4dc0 + 19),
    estrutura: 'Vento sobre Terra',
    linhas: '000011',
    palavrasChave: 'observação, exemplo e visão ampla'.split(', '),
    essencia: 'observação, exemplo e visão ampla',
    significado: 'Este hexagrama expressa observação, exemplo e visão ampla.',
    luz: 'observação, exemplo e visão ampla quando vividos com consciência e medida.',
    sombra: 'passividade, julgamento distante e indecisão.',
    conselho: 'recuar para enxergar o conjunto.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 21,
    id: 'shi-he',
    nomeChines: 'Shi He',
    nome: 'Morder Através',
    simbolo: String.fromCodePoint(0x4dc0 + 20),
    estrutura: 'Fogo sobre Trovão',
    linhas: '100101',
    palavrasChave: 'decisão, justiça e remoção de obstáculos'.split(', '),
    essencia: 'decisão, justiça e remoção de obstáculos',
    significado: 'Este hexagrama expressa decisão, justiça e remoção de obstáculos.',
    luz: 'decisão, justiça e remoção de obstáculos quando vividos com consciência e medida.',
    sombra: 'punição excessiva, dureza e impulsividade.',
    conselho: 'agir com clareza e medida para resolver o bloqueio.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 22,
    id: 'bi',
    nomeChines: 'Bi',
    nome: 'A Graça',
    simbolo: String.fromCodePoint(0x4dc0 + 21),
    estrutura: 'Montanha sobre Fogo',
    linhas: '101001',
    palavrasChave: 'beleza, forma e expressão adequada'.split(', '),
    essencia: 'beleza, forma e expressão adequada',
    significado: 'Este hexagrama expressa beleza, forma e expressão adequada.',
    luz: 'beleza, forma e expressão adequada quando vividos com consciência e medida.',
    sombra: 'superficialidade, aparência e vaidade.',
    conselho: 'cuidar da apresentação sem ocultar a essência.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 23,
    id: 'bo',
    nomeChines: 'Bo',
    nome: 'A Desintegração',
    simbolo: String.fromCodePoint(0x4dc0 + 22),
    estrutura: 'Montanha sobre Terra',
    linhas: '000001',
    palavrasChave: 'desgaste, perda de sustentação e queda de estruturas'.split(', '),
    essencia: 'desgaste, perda de sustentação e queda de estruturas',
    significado: 'Este hexagrama expressa desgaste, perda de sustentação e queda de estruturas.',
    luz: 'desgaste, perda de sustentação e queda de estruturas quando vividos com consciência e medida.',
    sombra: 'negação, apego e colapso prolongado.',
    conselho: 'retirar apoio do que não se sustenta e preservar o essencial.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 24,
    id: 'fu',
    nomeChines: 'Fu',
    nome: 'O Retorno',
    simbolo: String.fromCodePoint(0x4dc0 + 23),
    estrutura: 'Terra sobre Trovão',
    linhas: '100000',
    palavrasChave: 'retorno ao centro, renovação e recomeço'.split(', '),
    essencia: 'retorno ao centro, renovação e recomeço',
    significado: 'Este hexagrama expressa retorno ao centro, renovação e recomeço.',
    luz: 'retorno ao centro, renovação e recomeço quando vividos com consciência e medida.',
    sombra: 'repetição automática e retorno ao mesmo erro.',
    conselho: 'retomar o caminho correto com simplicidade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 25,
    id: 'wu-wang',
    nomeChines: 'Wu Wang',
    nome: 'A Inocência',
    simbolo: String.fromCodePoint(0x4dc0 + 24),
    estrutura: 'Céu sobre Trovão',
    linhas: '100111',
    palavrasChave: 'espontaneidade correta, integridade e autenticidade'.split(', '),
    essencia: 'espontaneidade correta, integridade e autenticidade',
    significado: 'Este hexagrama expressa espontaneidade correta, integridade e autenticidade.',
    luz: 'espontaneidade correta, integridade e autenticidade quando vividos com consciência e medida.',
    sombra: 'imprudência, ingenuidade e intenção escondida.',
    conselho: 'agir sem artifício e responder ao real.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 26,
    id: 'da-chu',
    nomeChines: 'Da Chu',
    nome: 'O Grande Poder de Domar',
    simbolo: String.fromCodePoint(0x4dc0 + 25),
    estrutura: 'Montanha sobre Céu',
    linhas: '111001',
    palavrasChave: 'acúmulo de força, estudo e autocontrole'.split(', '),
    essencia: 'acúmulo de força, estudo e autocontrole',
    significado: 'Este hexagrama expressa acúmulo de força, estudo e autocontrole.',
    luz: 'acúmulo de força, estudo e autocontrole quando vividos com consciência e medida.',
    sombra: 'repressão, rigidez e retenção excessiva.',
    conselho: 'preparar-se profundamente antes de agir.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 27,
    id: 'yi',
    nomeChines: 'Yi',
    nome: 'A Nutrição',
    simbolo: String.fromCodePoint(0x4dc0 + 26),
    estrutura: 'Montanha sobre Trovão',
    linhas: '100001',
    palavrasChave: 'alimentação, palavras e aquilo que sustenta'.split(', '),
    essencia: 'alimentação, palavras e aquilo que sustenta',
    significado: 'Este hexagrama expressa alimentação, palavras e aquilo que sustenta.',
    luz: 'alimentação, palavras e aquilo que sustenta quando vividos com consciência e medida.',
    sombra: 'excessos, carência e nutrição inadequada.',
    conselho: 'observar o que entra e o que sai de sua vida.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 28,
    id: 'da-guo',
    nomeChines: 'Da Guo',
    nome: 'A Preponderância do Grande',
    simbolo: String.fromCodePoint(0x4dc0 + 27),
    estrutura: 'Lago sobre Vento',
    linhas: '011110',
    palavrasChave: 'sobrecarga, ponto crítico e decisão extraordinária'.split(', '),
    essencia: 'sobrecarga, ponto crítico e decisão extraordinária',
    significado: 'Este hexagrama expressa sobrecarga, ponto crítico e decisão extraordinária.',
    luz: 'sobrecarga, ponto crítico e decisão extraordinária quando vividos com consciência e medida.',
    sombra: 'colapso, exagero e peso insustentável.',
    conselho: 'reforçar a estrutura e agir com coragem.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 29,
    id: 'kan',
    nomeChines: 'Kan',
    nome: 'O Abismal',
    simbolo: String.fromCodePoint(0x4dc0 + 28),
    estrutura: 'Água sobre Água',
    linhas: '010010',
    palavrasChave: 'perigo repetido, profundidade e aprendizado pela experiência'.split(', '),
    essencia: 'perigo repetido, profundidade e aprendizado pela experiência',
    significado: 'Este hexagrama expressa perigo repetido, profundidade e aprendizado pela experiência.',
    luz: 'perigo repetido, profundidade e aprendizado pela experiência quando vividos com consciência e medida.',
    sombra: 'medo, repetição de risco e perda de direção.',
    conselho: 'manter coerência e atravessar com atenção.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 30,
    id: 'li',
    nomeChines: 'Li',
    nome: 'O Aderir',
    simbolo: String.fromCodePoint(0x4dc0 + 29),
    estrutura: 'Fogo sobre Fogo',
    linhas: '101101',
    palavrasChave: 'clareza, consciência e dependência correta'.split(', '),
    essencia: 'clareza, consciência e dependência correta',
    significado: 'Este hexagrama expressa clareza, consciência e dependência correta.',
    luz: 'clareza, consciência e dependência correta quando vividos com consciência e medida.',
    sombra: 'apego, vaidade e brilho sem substância.',
    conselho: 'cultivar lucidez e vínculo com o que ilumina.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 31,
    id: 'xian',
    nomeChines: 'Xian',
    nome: 'A Influência',
    simbolo: String.fromCodePoint(0x4dc0 + 30),
    estrutura: 'Lago sobre Montanha',
    linhas: '001110',
    palavrasChave: 'atração, influência mútua e sensibilidade'.split(', '),
    essencia: 'atração, influência mútua e sensibilidade',
    significado: 'Este hexagrama expressa atração, influência mútua e sensibilidade.',
    luz: 'atração, influência mútua e sensibilidade quando vividos com consciência e medida.',
    sombra: 'sedução manipulativa e dependência emocional.',
    conselho: 'aproximar-se com receptividade e respeito.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 32,
    id: 'heng',
    nomeChines: 'Heng',
    nome: 'A Duração',
    simbolo: String.fromCodePoint(0x4dc0 + 31),
    estrutura: 'Trovão sobre Vento',
    linhas: '011100',
    palavrasChave: 'constância, continuidade e compromisso'.split(', '),
    essencia: 'constância, continuidade e compromisso',
    significado: 'Este hexagrama expressa constância, continuidade e compromisso.',
    luz: 'constância, continuidade e compromisso quando vividos com consciência e medida.',
    sombra: 'rotina vazia, teimosia e instabilidade.',
    conselho: 'manter o que é correto sem endurecer.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 33,
    id: 'dun',
    nomeChines: 'Dun',
    nome: 'A Retirada',
    simbolo: String.fromCodePoint(0x4dc0 + 32),
    estrutura: 'Céu sobre Montanha',
    linhas: '001111',
    palavrasChave: 'recuo estratégico, preservação e limites'.split(', '),
    essencia: 'recuo estratégico, preservação e limites',
    significado: 'Este hexagrama expressa recuo estratégico, preservação e limites.',
    luz: 'recuo estratégico, preservação e limites quando vividos com consciência e medida.',
    sombra: 'fuga, covardia e isolamento improdutivo.',
    conselho: 'afastar-se com dignidade para proteger força.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 34,
    id: 'da-zhuang',
    nomeChines: 'Da Zhuang',
    nome: 'O Poder do Grande',
    simbolo: String.fromCodePoint(0x4dc0 + 33),
    estrutura: 'Trovão sobre Céu',
    linhas: '111100',
    palavrasChave: 'força, expansão e capacidade de ação'.split(', '),
    essencia: 'força, expansão e capacidade de ação',
    significado: 'Este hexagrama expressa força, expansão e capacidade de ação.',
    luz: 'força, expansão e capacidade de ação quando vividos com consciência e medida.',
    sombra: 'arrogância, imposição e excesso.',
    conselho: 'usar poder com justiça e autocontrole.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 35,
    id: 'jin',
    nomeChines: 'Jin',
    nome: 'O Progresso',
    simbolo: String.fromCodePoint(0x4dc0 + 34),
    estrutura: 'Fogo sobre Terra',
    linhas: '000101',
    palavrasChave: 'avanço, visibilidade e reconhecimento'.split(', '),
    essencia: 'avanço, visibilidade e reconhecimento',
    significado: 'Este hexagrama expressa avanço, visibilidade e reconhecimento.',
    luz: 'avanço, visibilidade e reconhecimento quando vividos com consciência e medida.',
    sombra: 'vaidade, pressa e dependência de aprovação.',
    conselho: 'apresentar-se com clareza e constância.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 36,
    id: 'ming-yi',
    nomeChines: 'Ming Yi',
    nome: 'O Obscurecimento da Luz',
    simbolo: String.fromCodePoint(0x4dc0 + 35),
    estrutura: 'Terra sobre Fogo',
    linhas: '101000',
    palavrasChave: 'proteção da luz em ambiente difícil'.split(', '),
    essencia: 'proteção da luz em ambiente difícil',
    significado: 'Este hexagrama expressa proteção da luz em ambiente difícil.',
    luz: 'proteção da luz em ambiente difícil quando vividos com consciência e medida.',
    sombra: 'autocensura, medo e apagamento pessoal.',
    conselho: 'preservar valores sem exposição imprudente.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 37,
    id: 'jia-ren',
    nomeChines: 'Jia Ren',
    nome: 'A Família',
    simbolo: String.fromCodePoint(0x4dc0 + 36),
    estrutura: 'Vento sobre Fogo',
    linhas: '101011',
    palavrasChave: 'papéis, vínculos e ordem no ambiente íntimo'.split(', '),
    essencia: 'papéis, vínculos e ordem no ambiente íntimo',
    significado: 'Este hexagrama expressa papéis, vínculos e ordem no ambiente íntimo.',
    luz: 'papéis, vínculos e ordem no ambiente íntimo quando vividos com consciência e medida.',
    sombra: 'controle doméstico, rigidez e padrões herdados.',
    conselho: 'definir responsabilidades e cultivar respeito.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 38,
    id: 'kui',
    nomeChines: 'Kui',
    nome: 'A Oposição',
    simbolo: String.fromCodePoint(0x4dc0 + 37),
    estrutura: 'Fogo sobre Lago',
    linhas: '110101',
    palavrasChave: 'diferenças, contraste e perspectivas divergentes'.split(', '),
    essencia: 'diferenças, contraste e perspectivas divergentes',
    significado: 'Este hexagrama expressa diferenças, contraste e perspectivas divergentes.',
    luz: 'diferenças, contraste e perspectivas divergentes quando vividos com consciência e medida.',
    sombra: 'polarização, hostilidade e afastamento.',
    conselho: 'buscar pontos de encontro sem negar diferenças.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 39,
    id: 'jian',
    nomeChines: 'Jian',
    nome: 'O Impedimento',
    simbolo: String.fromCodePoint(0x4dc0 + 38),
    estrutura: 'Água sobre Montanha',
    linhas: '001010',
    palavrasChave: 'obstáculo, dificuldade e necessidade de ajuda'.split(', '),
    essencia: 'obstáculo, dificuldade e necessidade de ajuda',
    significado: 'Este hexagrama expressa obstáculo, dificuldade e necessidade de ajuda.',
    luz: 'obstáculo, dificuldade e necessidade de ajuda quando vividos com consciência e medida.',
    sombra: 'insistência cega, isolamento e frustração.',
    conselho: 'mudar a rota, pedir apoio e rever estratégia.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 40,
    id: 'xie',
    nomeChines: 'Xie',
    nome: 'A Liberação',
    simbolo: String.fromCodePoint(0x4dc0 + 39),
    estrutura: 'Trovão sobre Água',
    linhas: '010100',
    palavrasChave: 'alívio, soltura e resolução de tensão'.split(', '),
    essencia: 'alívio, soltura e resolução de tensão',
    significado: 'Este hexagrama expressa alívio, soltura e resolução de tensão.',
    luz: 'alívio, soltura e resolução de tensão quando vividos com consciência e medida.',
    sombra: 'relaxamento prematuro e repetição do problema.',
    conselho: 'resolver rapidamente o que já pode ser liberado.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 41,
    id: 'sun',
    nomeChines: 'Sun',
    nome: 'A Diminuição',
    simbolo: String.fromCodePoint(0x4dc0 + 40),
    estrutura: 'Montanha sobre Lago',
    linhas: '110001',
    palavrasChave: 'redução, simplificação e sacrifício consciente'.split(', '),
    essencia: 'redução, simplificação e sacrifício consciente',
    significado: 'Este hexagrama expressa redução, simplificação e sacrifício consciente.',
    luz: 'redução, simplificação e sacrifício consciente quando vividos com consciência e medida.',
    sombra: 'perda sem propósito, privação e ressentimento.',
    conselho: 'retirar excessos para fortalecer o essencial.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 42,
    id: 'yi',
    nomeChines: 'Yi',
    nome: 'O Aumento',
    simbolo: String.fromCodePoint(0x4dc0 + 41),
    estrutura: 'Vento sobre Trovão',
    linhas: '100011',
    palavrasChave: 'crescimento, benefício e expansão compartilhada'.split(', '),
    essencia: 'crescimento, benefício e expansão compartilhada',
    significado: 'Este hexagrama expressa crescimento, benefício e expansão compartilhada.',
    luz: 'crescimento, benefício e expansão compartilhada quando vividos com consciência e medida.',
    sombra: 'ganância, expansão sem base e desperdício.',
    conselho: 'investir no que amplia valor coletivo.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 43,
    id: 'guai',
    nomeChines: 'Guai',
    nome: 'A Determinação',
    simbolo: String.fromCodePoint(0x4dc0 + 42),
    estrutura: 'Lago sobre Céu',
    linhas: '111110',
    palavrasChave: 'decisão, declaração e ruptura com o prejudicial'.split(', '),
    essencia: 'decisão, declaração e ruptura com o prejudicial',
    significado: 'Este hexagrama expressa decisão, declaração e ruptura com o prejudicial.',
    luz: 'decisão, declaração e ruptura com o prejudicial quando vividos com consciência e medida.',
    sombra: 'agressividade, exposição e radicalismo.',
    conselho: 'falar com clareza e agir sem violência.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 44,
    id: 'gou',
    nomeChines: 'Gou',
    nome: 'O Encontro',
    simbolo: String.fromCodePoint(0x4dc0 + 43),
    estrutura: 'Céu sobre Vento',
    linhas: '011111',
    palavrasChave: 'encontro súbito, influência forte e atração'.split(', '),
    essencia: 'encontro súbito, influência forte e atração',
    significado: 'Este hexagrama expressa encontro súbito, influência forte e atração.',
    luz: 'encontro súbito, influência forte e atração quando vividos com consciência e medida.',
    sombra: 'sedução perigosa, invasão e perda de limites.',
    conselho: 'reconhecer rapidamente a natureza do que chega.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 45,
    id: 'cui',
    nomeChines: 'Cui',
    nome: 'A Reunião',
    simbolo: String.fromCodePoint(0x4dc0 + 44),
    estrutura: 'Lago sobre Terra',
    linhas: '000110',
    palavrasChave: 'convergência, reunião e força coletiva'.split(', '),
    essencia: 'convergência, reunião e força coletiva',
    significado: 'Este hexagrama expressa convergência, reunião e força coletiva.',
    luz: 'convergência, reunião e força coletiva quando vividos com consciência e medida.',
    sombra: 'multidão sem propósito, disputa e dependência.',
    conselho: 'organizar pessoas em torno de um centro verdadeiro.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 46,
    id: 'sheng',
    nomeChines: 'Sheng',
    nome: 'A Ascensão',
    simbolo: String.fromCodePoint(0x4dc0 + 45),
    estrutura: 'Terra sobre Vento',
    linhas: '011000',
    palavrasChave: 'crescimento gradual, esforço e elevação'.split(', '),
    essencia: 'crescimento gradual, esforço e elevação',
    significado: 'Este hexagrama expressa crescimento gradual, esforço e elevação.',
    luz: 'crescimento gradual, esforço e elevação quando vividos com consciência e medida.',
    sombra: 'ambição apressada e desgaste.',
    conselho: 'avançar passo a passo com apoio adequado.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 47,
    id: 'kun',
    nomeChines: 'Kun',
    nome: 'A Opressão',
    simbolo: String.fromCodePoint(0x4dc0 + 46),
    estrutura: 'Lago sobre Água',
    linhas: '010110',
    palavrasChave: 'restrição, exaustão e teste de caráter'.split(', '),
    essencia: 'restrição, exaustão e teste de caráter',
    significado: 'Este hexagrama expressa restrição, exaustão e teste de caráter.',
    luz: 'restrição, exaustão e teste de caráter quando vividos com consciência e medida.',
    sombra: 'desânimo, isolamento e vitimismo.',
    conselho: 'preservar verdade interior e reorganizar recursos.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 48,
    id: 'jing',
    nomeChines: 'Jing',
    nome: 'O Poço',
    simbolo: String.fromCodePoint(0x4dc0 + 47),
    estrutura: 'Água sobre Vento',
    linhas: '011010',
    palavrasChave: 'fonte comum, recursos profundos e serviço'.split(', '),
    essencia: 'fonte comum, recursos profundos e serviço',
    significado: 'Este hexagrama expressa fonte comum, recursos profundos e serviço.',
    luz: 'fonte comum, recursos profundos e serviço quando vividos com consciência e medida.',
    sombra: 'recurso inacessível, negligência e desperdício.',
    conselho: 'cuidar da fonte que sustenta a todos.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 49,
    id: 'ge',
    nomeChines: 'Ge',
    nome: 'A Revolução',
    simbolo: String.fromCodePoint(0x4dc0 + 48),
    estrutura: 'Lago sobre Fogo',
    linhas: '101110',
    palavrasChave: 'mudança de ordem, reforma e transformação'.split(', '),
    essencia: 'mudança de ordem, reforma e transformação',
    significado: 'Este hexagrama expressa mudança de ordem, reforma e transformação.',
    luz: 'mudança de ordem, reforma e transformação quando vividos com consciência e medida.',
    sombra: 'rebeldia, ruptura prematura e caos.',
    conselho: 'mudar no momento certo com legitimidade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 50,
    id: 'ding',
    nomeChines: 'Ding',
    nome: 'O Caldeirão',
    simbolo: String.fromCodePoint(0x4dc0 + 49),
    estrutura: 'Fogo sobre Vento',
    linhas: '011101',
    palavrasChave: 'transformação cultural, nutrição e refinamento'.split(', '),
    essencia: 'transformação cultural, nutrição e refinamento',
    significado: 'Este hexagrama expressa transformação cultural, nutrição e refinamento.',
    luz: 'transformação cultural, nutrição e refinamento quando vividos com consciência e medida.',
    sombra: 'instabilidade, forma sem conteúdo e má preparação.',
    conselho: 'transformar matéria bruta em valor elevado.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 51,
    id: 'zhen',
    nomeChines: 'Zhen',
    nome: 'O Incitar',
    simbolo: String.fromCodePoint(0x4dc0 + 50),
    estrutura: 'Trovão sobre Trovão',
    linhas: '100100',
    palavrasChave: 'choque, despertar e movimento repentino'.split(', '),
    essencia: 'choque, despertar e movimento repentino',
    significado: 'Este hexagrama expressa choque, despertar e movimento repentino.',
    luz: 'choque, despertar e movimento repentino quando vividos com consciência e medida.',
    sombra: 'pânico, impulsividade e repetição de sustos.',
    conselho: 'recuperar presença e responder com consciência.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 52,
    id: 'gen',
    nomeChines: 'Gen',
    nome: 'A Quietude',
    simbolo: String.fromCodePoint(0x4dc0 + 51),
    estrutura: 'Montanha sobre Montanha',
    linhas: '001001',
    palavrasChave: 'parada, meditação e limite'.split(', '),
    essencia: 'parada, meditação e limite',
    significado: 'Este hexagrama expressa parada, meditação e limite.',
    luz: 'parada, meditação e limite quando vividos com consciência e medida.',
    sombra: 'estagnação, repressão e isolamento.',
    conselho: 'aquietar-se no momento correto.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 53,
    id: 'jian',
    nomeChines: 'Jian',
    nome: 'O Desenvolvimento Gradual',
    simbolo: String.fromCodePoint(0x4dc0 + 52),
    estrutura: 'Vento sobre Montanha',
    linhas: '001011',
    palavrasChave: 'progresso lento, maturidade e etapas corretas'.split(', '),
    essencia: 'progresso lento, maturidade e etapas corretas',
    significado: 'Este hexagrama expressa progresso lento, maturidade e etapas corretas.',
    luz: 'progresso lento, maturidade e etapas corretas quando vividos com consciência e medida.',
    sombra: 'pressa, comparação e ansiedade.',
    conselho: 'respeitar sequência, tempo e preparação.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 54,
    id: 'gui-mei',
    nomeChines: 'Gui Mei',
    nome: 'A Jovem que se Casa',
    simbolo: String.fromCodePoint(0x4dc0 + 53),
    estrutura: 'Trovão sobre Lago',
    linhas: '110100',
    palavrasChave: 'posição secundária, desejo e adaptação'.split(', '),
    essencia: 'posição secundária, desejo e adaptação',
    significado: 'Este hexagrama expressa posição secundária, desejo e adaptação.',
    luz: 'posição secundária, desejo e adaptação quando vividos com consciência e medida.',
    sombra: 'dependência, precipitação e acordos desiguais.',
    conselho: 'compreender limites e agir sem ilusão.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 55,
    id: 'feng',
    nomeChines: 'Feng',
    nome: 'A Abundância',
    simbolo: String.fromCodePoint(0x4dc0 + 54),
    estrutura: 'Trovão sobre Fogo',
    linhas: '101100',
    palavrasChave: 'plenitude, intensidade e momento máximo'.split(', '),
    essencia: 'plenitude, intensidade e momento máximo',
    significado: 'Este hexagrama expressa plenitude, intensidade e momento máximo.',
    luz: 'plenitude, intensidade e momento máximo quando vividos com consciência e medida.',
    sombra: 'excesso, saturação e medo do declínio.',
    conselho: 'usar o auge com clareza e responsabilidade.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 56,
    id: 'lu',
    nomeChines: 'Lu',
    nome: 'O Viajante',
    simbolo: String.fromCodePoint(0x4dc0 + 55),
    estrutura: 'Fogo sobre Montanha',
    linhas: '001101',
    palavrasChave: 'transitoriedade, viagem e adaptação'.split(', '),
    essencia: 'transitoriedade, viagem e adaptação',
    significado: 'Este hexagrama expressa transitoriedade, viagem e adaptação.',
    luz: 'transitoriedade, viagem e adaptação quando vividos com consciência e medida.',
    sombra: 'instabilidade, solidão e imprudência.',
    conselho: 'agir com respeito e não criar raízes prematuras.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 57,
    id: 'xun',
    nomeChines: 'Xun',
    nome: 'O Suave',
    simbolo: String.fromCodePoint(0x4dc0 + 56),
    estrutura: 'Vento sobre Vento',
    linhas: '011011',
    palavrasChave: 'penetração gradual, influência e persistência'.split(', '),
    essencia: 'penetração gradual, influência e persistência',
    significado: 'Este hexagrama expressa penetração gradual, influência e persistência.',
    luz: 'penetração gradual, influência e persistência quando vividos com consciência e medida.',
    sombra: 'indecisão, submissão e influência invisível.',
    conselho: 'avançar de forma sutil e constante.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 58,
    id: 'dui',
    nomeChines: 'Dui',
    nome: 'O Alegre',
    simbolo: String.fromCodePoint(0x4dc0 + 57),
    estrutura: 'Lago sobre Lago',
    linhas: '110110',
    palavrasChave: 'alegria, comunicação e abertura'.split(', '),
    essencia: 'alegria, comunicação e abertura',
    significado: 'Este hexagrama expressa alegria, comunicação e abertura.',
    luz: 'alegria, comunicação e abertura quando vividos com consciência e medida.',
    sombra: 'superficialidade, sedução e fala vazia.',
    conselho: 'trocar com sinceridade e leveza.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 59,
    id: 'huan',
    nomeChines: 'Huan',
    nome: 'A Dispersão',
    simbolo: String.fromCodePoint(0x4dc0 + 58),
    estrutura: 'Vento sobre Água',
    linhas: '010011',
    palavrasChave: 'dissolução de bloqueios e reconexão'.split(', '),
    essencia: 'dissolução de bloqueios e reconexão',
    significado: 'Este hexagrama expressa dissolução de bloqueios e reconexão.',
    luz: 'dissolução de bloqueios e reconexão quando vividos com consciência e medida.',
    sombra: 'dispersão, fuga e perda de foco.',
    conselho: 'desfazer rigidez e reunir o que importa.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 60,
    id: 'jie',
    nomeChines: 'Jie',
    nome: 'A Limitação',
    simbolo: String.fromCodePoint(0x4dc0 + 59),
    estrutura: 'Água sobre Lago',
    linhas: '110010',
    palavrasChave: 'limites, medida e organização'.split(', '),
    essencia: 'limites, medida e organização',
    significado: 'Este hexagrama expressa limites, medida e organização.',
    luz: 'limites, medida e organização quando vividos com consciência e medida.',
    sombra: 'restrição excessiva, rigidez e sufocamento.',
    conselho: 'estabelecer regras úteis e proporcionais.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 61,
    id: 'zhong-fu',
    nomeChines: 'Zhong Fu',
    nome: 'A Verdade Interior',
    simbolo: String.fromCodePoint(0x4dc0 + 60),
    estrutura: 'Vento sobre Lago',
    linhas: '110011',
    palavrasChave: 'sinceridade, confiança e coerência'.split(', '),
    essencia: 'sinceridade, confiança e coerência',
    significado: 'Este hexagrama expressa sinceridade, confiança e coerência.',
    luz: 'sinceridade, confiança e coerência quando vividos com consciência e medida.',
    sombra: 'ingenuidade, autoengano e confiança sem critério.',
    conselho: 'alinhar palavra, intenção e ação.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 62,
    id: 'xiao-guo',
    nomeChines: 'Xiao Guo',
    nome: 'A Preponderância do Pequeno',
    simbolo: String.fromCodePoint(0x4dc0 + 61),
    estrutura: 'Trovão sobre Montanha',
    linhas: '001100',
    palavrasChave: 'atenção aos detalhes e ação modesta'.split(', '),
    essencia: 'atenção aos detalhes e ação modesta',
    significado: 'Este hexagrama expressa atenção aos detalhes e ação modesta.',
    luz: 'atenção aos detalhes e ação modesta quando vividos com consciência e medida.',
    sombra: 'minúcia excessiva, ansiedade e ambição inadequada.',
    conselho: 'corrigir pequenas coisas e evitar grandes riscos.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 63,
    id: 'ji-ji',
    nomeChines: 'Ji Ji',
    nome: 'Após a Conclusão',
    simbolo: String.fromCodePoint(0x4dc0 + 62),
    estrutura: 'Água sobre Fogo',
    linhas: '101010',
    palavrasChave: 'ordem alcançada e necessidade de manutenção'.split(', '),
    essencia: 'ordem alcançada e necessidade de manutenção',
    significado: 'Este hexagrama expressa ordem alcançada e necessidade de manutenção.',
    luz: 'ordem alcançada e necessidade de manutenção quando vividos com consciência e medida.',
    sombra: 'relaxamento, desordem e perda do que foi conquistado.',
    conselho: 'vigiar detalhes depois do sucesso.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  },
  {
    numero: 64,
    id: 'wei-ji',
    nomeChines: 'Wei Ji',
    nome: 'Antes da Conclusão',
    simbolo: String.fromCodePoint(0x4dc0 + 63),
    estrutura: 'Fogo sobre Água',
    linhas: '010101',
    palavrasChave: 'transição final, potencial e cuidado'.split(', '),
    essencia: 'transição final, potencial e cuidado',
    significado: 'Este hexagrama expressa transição final, potencial e cuidado.',
    luz: 'transição final, potencial e cuidado quando vividos com consciência e medida.',
    sombra: 'precipitação, confusão e abandono no último passo.',
    conselho: 'manter atenção até completar a passagem.',
    alerta: 'Evite transformar esta orientação em certeza absoluta ou agir sem observar o contexto.',
    tempo: 'O tempo é simbólico e depende da maturação indicada pelo conjunto da leitura.'
  }
];
function normalizar(texto:string):string{return String(texto||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
function limparNome(nome:string):string{return String(nome||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z]/g,'');}
function somaTexto(texto:string):number{return Array.from(String(texto||'')).reduce((t,c,i)=>t+c.charCodeAt(0)*(i+1),0);}
function gerarSemente(input:IChingInput):number{
  const n=limparNome(input.fullName),d=String(input.birthDate||'').replace(/\D/g,''),p=normalizar(input.question||'');
  return somaTexto(n)*3+somaTexto(d)*5+somaTexto(p)*11+n.length*17+d.length*23;
}
function detectarTema(pergunta:string):TemaIChing{
  const t=normalizar(pergunta);
  const grupos:Array<[TemaIChing,string[]]>=[
    ['amor',['amor','relacionamento','namoro','casamento','ex','volta','sentimento','paixao','saudade']],
    ['trabalho',['trabalho','emprego','carreira','profissao','empresa','chefe','vaga']],
    ['prosperidade',['dinheiro','prosperidade','financeiro','riqueza','negocio','lucro','venda']],
    ['espiritualidade',['espiritual','energia','missao','caminho','meditacao','sabedoria']],
    ['família',['familia','filho','filha','casa','mae','pai','irmao']],
    ['proteção',['protecao','inveja','perseguicao','falsidade','ameaca']],
    ['saúde',['saude','corpo','tratamento','doenca','cansaco','bem estar']]
  ];
  for(const [tema,termos] of grupos){if(termos.some(x=>t.includes(x)))return tema;} return 'geral';
}
function interpretarLinha(pos:number,v:6|7|8|9):string{
  const fases=['início e fundamento','relação com o ambiente imediato','passagem entre intenção e ação','entrada no campo externo','centro de decisão e responsabilidade','culminação, excesso ou encerramento'];
  const m=v===6?'yin mutável: receptividade no limite, tendendo à ação':v===9?'yang mutável: ação no limite, tendendo à receptividade':v===7?'yang estável: ação mantida com disciplina':'yin estável: receptividade e observação preservadas';
  return `Linha ${pos}, ligada a ${fases[pos-1]}. ${m}.`;
}
function gerarLinhas(semente:number):LinhaIChing[]{
  const out:LinhaIChing[]=[];
  for(let i=0;i<6;i++){const b=Math.abs(semente+(i+1)*97+Math.floor(semente/(i+3))*13)%16;
    const valor:6|7|8|9=b===0?6:b<=5?7:b<=10?8:9;
    out.push({posicao:(i+1) as 1|2|3|4|5|6,valor,natureza:valor===7||valor===9?'yang':'yin',mutavel:valor===6||valor===9,interpretacao:interpretarLinha(i+1,valor)});
  } return out;
}
function padrao(linhas:LinhaIChing[],transformar:boolean):string{
  return linhas.map(l=>{const y=l.natureza==='yang';return transformar&&l.mutavel?!y? '1':'0':y?'1':'0';}).join('');
}
function localizar(p:string):HexagramaIChing{return HEXAGRAMAS.find(h=>h.linhas===p)||HEXAGRAMAS[0];}
function interpretarTema(h:HexagramaIChing,tema:TemaIChing):string{
  switch(tema){
    case'amor':return `No campo afetivo, ${h.nome} orienta a observar reciprocidade, ritmo e verdade nas atitudes. ${h.conselho}`;
    case'trabalho':return `No trabalho, ${h.nome} aponta para estratégia, responsabilidade e adaptação. ${h.conselho}`;
    case'prosperidade':return `Na prosperidade, ${h.nome} pede organização dos recursos e atenção ao tempo correto. ${h.conselho}`;
    case'espiritualidade':case'proteção':return `No campo espiritual, ${h.nome} convida ao alinhamento interior e à conduta consciente. ${h.conselho}`;
    case'família':return `Na família, ${h.nome} pede revisão de papéis, limites e responsabilidades. ${h.conselho}`;
    case'saúde':return `Em questões de saúde, a leitura é simbólica e não substitui avaliação profissional. ${h.conselho}`;
    default:return `${h.significado} ${h.conselho}`;
  }
}
function formatar(t:string,h:HexagramaIChing):string{return `
═══════════════════════
${t.toUpperCase()}
═══════════════════════
Hexagrama ${h.numero}: ${h.nome} (${h.nomeChines})
Símbolo: ${h.simbolo}
Estrutura: ${h.estrutura}
Essência: ${h.essencia}
Significado: ${h.significado}
Luz: ${h.luz}
Sombra: ${h.sombra}
Conselho: ${h.conselho}
Alerta: ${h.alerta}`.trim();}
export function buildIChingSupremo(input:IChingInput):IChingResultado{
  const entrada={fullName:String(input.fullName||'').trim(),birthDate:String(input.birthDate||'').trim(),question:String(input.question||'').trim()};
  const tema=detectarTema(entrada.question),linhas=gerarLinhas(gerarSemente(entrada)),linhasMutaveis=linhas.filter(l=>l.mutavel);
  const hexagramaPrincipal=localizar(padrao(linhas,false));
  const hexagramaTransformado=linhasMutaveis.length?localizar(padrao(linhas,true)):null;
  const energiaInicial=interpretarTema(hexagramaPrincipal,tema);
  const movimento=linhasMutaveis.length?`Há ${linhasMutaveis.length} linha(s) mutável(is): ${linhasMutaveis.map(l=>l.posicao).join(', ')}.`:'Não há linhas mutáveis; aprofunde a orientação principal.';
  const direcaoPrincipal=hexagramaTransformado?`A situação parte de ${hexagramaPrincipal.nome} e tende a ${hexagramaTransformado.nome}. ${hexagramaTransformado.conselho}`:`A direção permanece em ${hexagramaPrincipal.nome}. ${hexagramaPrincipal.conselho}`;
  const resumoParaOraculo=`
I CHING SUPREMO
Método: Seis Linhas e Transformação
Tema detectado: ${tema}

${formatar('Hexagrama principal',hexagramaPrincipal)}

LINHAS:
${linhas.map(l=>`Linha ${l.posicao} — valor ${l.valor} — ${l.natureza}${l.mutavel?' mutável':''}\n${l.interpretacao}`).join('\n\n')}

${hexagramaTransformado?formatar('Hexagrama transformado',hexagramaTransformado):'Não existe hexagrama transformado nesta leitura.'}

SÍNTESE:
Energia inicial: ${energiaInicial}
Movimento: ${movimento}
Direção principal: ${direcaoPrincipal}

INSTRUÇÕES PARA O CONSULTOR:
Use o hexagrama principal como retrato da situação atual, as linhas mutáveis como pontos de transformação e o hexagrama transformado como direção possível, nunca destino inevitável.
Não diga que calculou, sorteou ou gerou linhas. Não fale como relatório técnico. Não invente hexagramas ou linhas.
Responda diretamente à pergunta, preserve o livre-arbítrio e não apresente sentimentos de terceiros ou acontecimentos futuros como fatos comprovados.
A resposta deve ser profunda, clara, ética, humana e natural.`.trim();
  return{oracle:'i-ching',entrada,tema,metodo:{nome:'Seis Linhas e Transformação',descricao:'Leitura com seis linhas, linhas mutáveis e hexagrama transformado.'},linhas,hexagramaPrincipal,hexagramaTransformado,linhasMutaveis,sintese:{energiaInicial,movimento,direcaoPrincipal},resumoParaOraculo};
}
export const I_CHING_HEXAGRAMAS=HEXAGRAMAS;
export default buildIChingSupremo;