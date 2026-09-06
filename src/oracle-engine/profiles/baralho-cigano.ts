export interface BaralhoCiganoInput {
  fullName: string;
  birthDate: string;
  question?: string;
}

export type TemaBaralhoCigano =
  | 'amor'
  | 'prosperidade'
  | 'trabalho'
  | 'espiritualidade'
  | 'família'
  | 'saúde'
  | 'proteção'
  | 'geral';

export interface CartaBaralhoCigano {
  numero: number;
  id: string;
  nome: string;
  simbolo: string;
  palavrasChave: string[];
  significado: string;
  luz: string;
  sombra: string;
  amor: string;
  trabalho: string;
  dinheiro: string;
  espiritualidade: string;
  conselho: string;
  alerta: string;
  tempo: string;
  polaridade: 'positiva' | 'neutra' | 'desafiadora';
}

export interface PosicaoBaralhoCigano {
  posicao:
    | 'energia-central'
    | 'passado'
    | 'presente'
    | 'tendencia'
    | 'obstaculo'
    | 'caminho'
    | 'conselho';
  titulo: string;
  carta: CartaBaralhoCigano;
  interpretacaoTematica: string;
}

export interface BaralhoCiganoResultado {
  oracle: 'baralho-cigano';

  entrada: {
    fullName: string;
    birthDate: string;
    question: string;
  };

  tema: TemaBaralhoCigano;

  metodo: {
    nome: string;
    quantidadeCartas: number;
    descricao: string;
  };

  leitura: {
    energiaCentral: PosicaoBaralhoCigano;
    passado: PosicaoBaralhoCigano;
    presente: PosicaoBaralhoCigano;
    tendencia: PosicaoBaralhoCigano;
    obstaculo: PosicaoBaralhoCigano;
    caminho: PosicaoBaralhoCigano;
    conselho: PosicaoBaralhoCigano;
  };

  sintese: {
    cartasFavoraveis: string[];
    cartasDesafiadoras: string[];
    elementosRepetidos: string[];
    direcaoPrincipal: string;
  };

  resumoParaOraculo: string;
}

const CARTAS: CartaBaralhoCigano[] = [
  {
    numero: 1,
    id: 'cavaleiro',
    nome: 'O Cavaleiro',
    simbolo: 'movimento e chegada',
    palavrasChave: [
      'notícia',
      'movimento',
      'visita',
      'iniciativa',
      'novidade',
      'aproximação'
    ],
    significado:
      'Representa acontecimentos que se aproximam, mensagens, visitas, movimento e o início de uma ação concreta.',
    luz:
      'agilidade, oportunidade, notícia favorável, coragem para agir e aproximação.',
    sombra:
      'pressa, ansiedade, instabilidade, promessas rápidas e ações sem continuidade.',
    amor:
      'indica aproximação, contato, convite, reencontro ou alguém tomando iniciativa.',
    trabalho:
      'mostra novidades profissionais, propostas, entrevistas, deslocamentos ou projetos começando.',
    dinheiro:
      'aponta movimentação financeira e oportunidades que exigem resposta rápida.',
    espiritualidade:
      'representa sinais chegando e caminhos começando a se movimentar.',
    conselho:
      'esteja preparado para agir quando a oportunidade chegar.',
    alerta:
      'não confunda velocidade com segurança; observe se existe consistência.',
    tempo: 'rápido, de poucos dias a poucas semanas.',
    polaridade: 'positiva'
  },
  {
    numero: 2,
    id: 'trevo',
    nome: 'O Trevo',
    simbolo: 'sorte breve e pequenos obstáculos',
    palavrasChave: [
      'sorte',
      'oportunidade',
      'imprevisto',
      'risco',
      'brevidade',
      'solução'
    ],
    significado:
      'Representa uma oportunidade passageira, pequenos obstáculos e situações que podem mudar rapidamente.',
    luz:
      'sorte inesperada, solução simples, leveza, oportunidade rápida e capacidade de adaptação.',
    sombra:
      'instabilidade, contratempos, riscos mal avaliados e perda de oportunidade.',
    amor:
      'indica encontros leves, oportunidades afetivas ou instabilidade que precisa ser observada.',
    trabalho:
      'mostra chance inesperada, tarefa temporária ou pequeno obstáculo facilmente superável.',
    dinheiro:
      'pode trazer ganho rápido, mas também risco de desperdício ou instabilidade.',
    espiritualidade:
      'ensina a aproveitar os sinais sem depender apenas da sorte.',
    conselho:
      'aproveite a oportunidade, mas não baseie tudo no acaso.',
    alerta:
      'o que aparece rapidamente também pode desaparecer rapidamente.',
    tempo: 'muito rápido e de curta duração.',
    polaridade: 'neutra'
  },
  {
    numero: 3,
    id: 'navio',
    nome: 'O Navio',
    simbolo: 'viagem, expansão e distância',
    palavrasChave: [
      'viagem',
      'mudança',
      'distância',
      'expansão',
      'comércio',
      'novos horizontes'
    ],
    significado:
      'Representa viagens, mudanças, expansão, distância física ou emocional e busca por novos horizontes.',
    luz:
      'crescimento, liberdade, descoberta, expansão e novas possibilidades.',
    sombra:
      'distanciamento, saudade, fuga, demora e instabilidade emocional.',
    amor:
      'pode indicar relacionamento à distância, afastamento, viagem ou necessidade de renovar a relação.',
    trabalho:
      'favorece negócios, comércio, expansão profissional, mudança de cidade ou atuação internacional.',
    dinheiro:
      'indica crescimento por movimento, vendas, comércio ou novos mercados.',
    espiritualidade:
      'representa jornada interior e ampliação da consciência.',
    conselho:
      'saia do lugar conhecido e permita-se explorar novas possibilidades.',
    alerta:
      'não use a mudança apenas como fuga de problemas não resolvidos.',
    tempo: 'gradual, ligado a semanas ou meses.',
    polaridade: 'positiva'
  },
  {
    numero: 4,
    id: 'casa',
    nome: 'A Casa',
    simbolo: 'estrutura, família e segurança',
    palavrasChave: [
      'lar',
      'família',
      'segurança',
      'estrutura',
      'estabilidade',
      'intimidade'
    ],
    significado:
      'Representa o lar, a família, as bases emocionais, a segurança e tudo aquilo que oferece proteção e estabilidade.',
    luz:
      'acolhimento, proteção, união familiar, estabilidade e estrutura sólida.',
    sombra:
      'acomodação, controle familiar, dependência, rigidez e medo de sair da zona de conforto.',
    amor:
      'indica estabilidade, construção de vida a dois, convivência ou influência familiar.',
    trabalho:
      'favorece negócios familiares, trabalho em casa, estabilidade e construção de carreira.',
    dinheiro:
      'mostra segurança patrimonial, planejamento e necessidade de preservar recursos.',
    espiritualidade:
      'representa proteção ancestral e fortalecimento das próprias raízes.',
    conselho:
      'fortaleça suas bases antes de buscar grandes expansões.',
    alerta:
      'não permita que segurança se transforme em prisão.',
    tempo: 'estável e de desenvolvimento gradual.',
    polaridade: 'positiva'
  },
  {
    numero: 5,
    id: 'arvore',
    nome: 'A Árvore',
    simbolo: 'crescimento, raízes e vitalidade',
    palavrasChave: [
      'crescimento',
      'saúde',
      'raízes',
      'vitalidade',
      'tempo',
      'evolução'
    ],
    significado:
      'Representa crescimento lento e consistente, saúde, raízes, ancestralidade e amadurecimento.',
    luz:
      'vitalidade, estabilidade, cura, desenvolvimento e conexão profunda.',
    sombra:
      'lentidão, estagnação, padrões familiares repetidos e problemas antigos.',
    amor:
      'indica vínculo profundo, relacionamento duradouro e crescimento gradual.',
    trabalho:
      'mostra carreira que se fortalece com paciência, experiência e constância.',
    dinheiro:
      'aponta prosperidade gradual e necessidade de planejamento de longo prazo.',
    espiritualidade:
      'representa enraizamento, ancestralidade e fortalecimento energético.',
    conselho:
      'respeite o tempo natural das coisas e cuide das raízes do problema.',
    alerta:
      'não espere resultados imediatos em processos que exigem maturação.',
    tempo: 'lento, de meses a períodos mais longos.',
    polaridade: 'positiva'
  },
  {
    numero: 6,
    id: 'nuvens',
    nome: 'As Nuvens',
    simbolo: 'confusão, dúvida e instabilidade',
    palavrasChave: [
      'confusão',
      'dúvida',
      'instabilidade',
      'incerteza',
      'ansiedade',
      'falta de clareza'
    ],
    significado:
      'Representa confusão, dúvidas, instabilidade emocional ou situações em que ainda faltam informações.',
    luz:
      'percepção de que algo precisa ser esclarecido antes de qualquer decisão.',
    sombra:
      'ansiedade, enganos, pensamentos negativos, instabilidade e falta de direção.',
    amor:
      'indica dúvidas, mal-entendidos, afastamento emocional ou dificuldade de comunicação.',
    trabalho:
      'mostra cenário incerto, informações incompletas ou ambiente profissional confuso.',
    dinheiro:
      'recomenda cautela com decisões financeiras enquanto não houver clareza.',
    espiritualidade:
      'representa campo energético carregado pela ansiedade ou pelo excesso de pensamentos.',
    conselho:
      'espere a situação clarear antes de tomar decisões definitivas.',
    alerta:
      'não transforme suposições em certezas.',
    tempo: 'variável e instável.',
    polaridade: 'desafiadora'
  },
  {
    numero: 7,
    id: 'cobra',
    nome: 'A Cobra',
    simbolo: 'estratégia, desejo e complexidade',
    palavrasChave: [
      'estratégia',
      'sedução',
      'complexidade',
      'ciúme',
      'inteligência',
      'rivalidade'
    ],
    significado:
      'Representa inteligência estratégica, desejo, sedução, situações complexas e necessidade de observar intenções ocultas.',
    luz:
      'sabedoria, magnetismo, estratégia, percepção e capacidade de transformação.',
    sombra:
      'ciúme, manipulação, rivalidade, falsidade, inveja e jogos emocionais.',
    amor:
      'pode indicar desejo intenso, triângulos, ciúmes ou uma dinâmica afetiva complexa.',
    trabalho:
      'aconselha estratégia diante de concorrência, política interna ou interesses ocultos.',
    dinheiro:
      'exige atenção com propostas sedutoras, dívidas ou negociações pouco transparentes.',
    espiritualidade:
      'representa transformação, cura e necessidade de proteção contra influências negativas.',
    conselho:
      'observe cuidadosamente as intenções antes de confiar.',
    alerta:
      'não aja por ciúme, vingança ou desejo de controle.',
    tempo: 'variável, conforme a complexidade da situação.',
    polaridade: 'desafiadora'
  },
  {
    numero: 8,
    id: 'caixao',
    nome: 'O Caixão',
    simbolo: 'encerramento e transformação',
    palavrasChave: [
      'fim',
      'encerramento',
      'transformação',
      'desapego',
      'renascimento',
      'transição'
    ],
    significado:
      'Representa encerramentos, mudanças profundas e a necessidade de deixar algo terminar para que um novo ciclo possa nascer.',
    luz:
      'libertação, transformação, limpeza, desapego e renovação.',
    sombra:
      'perda, resistência ao fim, tristeza, desgaste e apego ao que já terminou.',
    amor:
      'pode indicar fim de ciclo, transformação profunda ou necessidade de abandonar padrões antigos.',
    trabalho:
      'mostra encerramento de função, projeto ou fase profissional.',
    dinheiro:
      'aconselha cortar perdas, dívidas ou hábitos financeiros prejudiciais.',
    espiritualidade:
      'representa morte simbólica, limpeza e renascimento interior.',
    conselho:
      'aceite o encerramento necessário e abra espaço para o novo.',
    alerta:
      'não prolongue situações que já perderam sua função.',
    tempo: 'marca o término de um ciclo.',
    polaridade: 'desafiadora'
  },
  {
    numero: 9,
    id: 'buque',
    nome: 'O Buquê',
    simbolo: 'alegria, presente e reconhecimento',
    palavrasChave: [
      'alegria',
      'presente',
      'beleza',
      'convite',
      'reconhecimento',
      'harmonia'
    ],
    significado:
      'Representa alegria, presentes, convites, reconhecimento, encanto e situações agradáveis.',
    luz:
      'felicidade, beleza, gentileza, recompensa, celebração e magnetismo.',
    sombra:
      'vaidade, superficialidade, necessidade de aprovação e encantamento passageiro.',
    amor:
      'indica romance, convite, reconciliação, carinho ou demonstração de afeto.',
    trabalho:
      'mostra reconhecimento, ambiente agradável, elogio ou oportunidade criativa.',
    dinheiro:
      'pode indicar presente, bônus, ganho agradável ou recompensa.',
    espiritualidade:
      'representa gratidão, harmonia e abertura para receber bênçãos.',
    conselho:
      'receba as coisas boas com gratidão e compartilhe alegria.',
    alerta:
      'não se deixe conduzir apenas pela aparência.',
    tempo: 'próximo e favorável.',
    polaridade: 'positiva'
  },
  {
    numero: 10,
    id: 'foice',
    nome: 'A Foice',
    simbolo: 'corte, decisão e acontecimento súbito',
    palavrasChave: [
      'corte',
      'decisão',
      'ruptura',
      'colheita',
      'rapidez',
      'separação'
    ],
    significado:
      'Representa corte, decisão rápida, separação, colheita e acontecimentos que exigem reação imediata.',
    luz:
      'libertação, decisão firme, retirada do que faz mal e colheita de resultados.',
    sombra:
      'ruptura dolorosa, impulsividade, acidente, agressividade e perda repentina.',
    amor:
      'pode indicar separação, conversa definitiva ou corte de um padrão destrutivo.',
    trabalho:
      'mostra demissão, encerramento, decisão urgente ou necessidade de eliminar excessos.',
    dinheiro:
      'aconselha cortar gastos, prejuízos ou compromissos financeiros arriscados.',
    espiritualidade:
      'representa limpeza rápida e ruptura com influências negativas.',
    conselho:
      'corte com consciência aquilo que não pode mais continuar.',
    alerta:
      'não tome decisões irreversíveis movido apenas pela raiva.',
    tempo: 'imediato ou muito rápido.',
    polaridade: 'desafiadora'
  },
  {
    numero: 11,
    id: 'chicote',
    nome: 'O Chicote',
    simbolo: 'repetição, conflito e intensidade',
    palavrasChave: [
      'conflito',
      'repetição',
      'discussão',
      'intensidade',
      'disciplina',
      'tensão'
    ],
    significado:
      'Representa padrões repetitivos, discussões, tensão, cobrança e intensidade física ou emocional.',
    luz:
      'disciplina, energia, coragem para enfrentar conflitos e capacidade de romper padrões.',
    sombra:
      'brigas, agressividade, obsessão, culpa, punição e repetição de sofrimento.',
    amor:
      'indica atração intensa, discussões recorrentes ou uma relação presa a ciclos repetitivos.',
    trabalho:
      'mostra pressão, competição, cobrança ou necessidade de maior disciplina.',
    dinheiro:
      'aponta repetição de erros financeiros ou conflitos por recursos.',
    espiritualidade:
      'representa padrão energético repetido que precisa ser reconhecido e transformado.',
    conselho:
      'interrompa o padrão antes que ele volte a causar o mesmo sofrimento.',
    alerta:
      'não alimente conflitos apenas para provar que está certo.',
    tempo: 'repetitivo ou cíclico.',
    polaridade: 'desafiadora'
  },
  {
    numero: 12,
    id: 'passaros',
    nome: 'Os Pássaros',
    simbolo: 'conversa, ansiedade e troca',
    palavrasChave: [
      'comunicação',
      'conversa',
      'ansiedade',
      'encontro',
      'negociação',
      'agitação'
    ],
    significado:
      'Representa conversas, trocas, encontros, negociações e agitação mental.',
    luz:
      'diálogo, comunicação, acordos, movimento social e troca de ideias.',
    sombra:
      'ansiedade, fofoca, nervosismo, ruído de comunicação e conversas vazias.',
    amor:
      'indica diálogo importante, mensagens, encontro ou necessidade de conversar com sinceridade.',
    trabalho:
      'favorece reuniões, negociações, entrevistas, contatos e atividades de comunicação.',
    dinheiro:
      'mostra negociações e decisões que dependem de boa comunicação.',
    espiritualidade:
      'aconselha silenciar a mente para distinguir intuição de ansiedade.',
    conselho:
      'converse com clareza e escute antes de concluir.',
    alerta:
      'evite fofocas, exposição e excesso de pensamentos.',
    tempo: 'rápido e movimentado.',
    polaridade: 'neutra'
  },
  {
    numero: 13,
    id: 'crianca',
    nome: 'A Criança',
    simbolo: 'começo, inocência e novidade',
    palavrasChave: [
      'início',
      'novidade',
      'inocência',
      'simplicidade',
      'aprendizado',
      'leveza'
    ],
    significado:
      'Representa novos começos, inocência, aprendizado, simplicidade e situações ainda em desenvolvimento.',
    luz:
      'renovação, espontaneidade, esperança, curiosidade e oportunidade de começar.',
    sombra:
      'imaturidade, ingenuidade, irresponsabilidade e falta de experiência.',
    amor:
      'indica relação começando, renovação afetiva ou comportamento emocional imaturo.',
    trabalho:
      'mostra novo emprego, projeto inicial, estágio ou fase de aprendizado.',
    dinheiro:
      'aconselha começar pequeno e desenvolver segurança gradualmente.',
    espiritualidade:
      'representa pureza, renovação e necessidade de olhar a situação sem preconceitos.',
    conselho:
      'comece com simplicidade e permita-se aprender.',
    alerta:
      'não trate uma situação séria com ingenuidade.',
    tempo: 'início recente ou futuro próximo.',
    polaridade: 'positiva'
  },
  {
    numero: 14,
    id: 'raposa',
    nome: 'A Raposa',
    simbolo: 'estratégia, trabalho e cautela',
    palavrasChave: [
      'cautela',
      'estratégia',
      'trabalho',
      'esperteza',
      'observação',
      'interesse'
    ],
    significado:
      'Representa estratégia, inteligência prática, ambiente profissional e necessidade de cautela.',
    luz:
      'esperteza, adaptação, análise, profissionalismo e capacidade de proteger interesses.',
    sombra:
      'falsidade, oportunismo, engano, exploração e excesso de desconfiança.',
    amor:
      'aconselha observar atitudes e interesses antes de confiar plenamente.',
    trabalho:
      'é fortemente ligada à profissão, estratégia, rotina e relações de interesse.',
    dinheiro:
      'pede análise cuidadosa de contratos, propostas e negociações.',
    espiritualidade:
      'representa discernimento e necessidade de não confundir medo com intuição.',
    conselho:
      'use inteligência e verifique os fatos antes de agir.',
    alerta:
      'cuidado com interesses ocultos, inclusive os próprios.',
    tempo: 'ligado à rotina e ao desenvolvimento estratégico.',
    polaridade: 'neutra'
  },
  {
    numero: 15,
    id: 'urso',
    nome: 'O Urso',
    simbolo: 'poder, proteção e domínio',
    palavrasChave: [
      'força',
      'poder',
      'proteção',
      'autoridade',
      'ciúme',
      'controle'
    ],
    significado:
      'Representa força, poder, proteção, autoridade, recursos e figuras dominantes.',
    luz:
      'liderança, coragem, proteção, prosperidade e capacidade de defender.',
    sombra:
      'controle, possessividade, ciúme, autoritarismo e abuso de poder.',
    amor:
      'pode indicar proteção intensa, ciúme, possessividade ou parceiro dominante.',
    trabalho:
      'representa liderança, chefia, influência, poder de decisão ou competição.',
    dinheiro:
      'é favorável para recursos e prosperidade, mas alerta contra ganância e controle.',
    espiritualidade:
      'representa força protetora e necessidade de usar poder com responsabilidade.',
    conselho:
      'proteja o que é importante sem sufocar pessoas ou situações.',
    alerta:
      'não confunda cuidado com domínio.',
    tempo: 'forte e persistente.',
    polaridade: 'neutra'
  },
  {
    numero: 16,
    id: 'estrelas',
    nome: 'As Estrelas',
    simbolo: 'orientação, esperança e inspiração',
    palavrasChave: [
      'esperança',
      'orientação',
      'inspiração',
      'espiritualidade',
      'clareza',
      'visibilidade'
    ],
    significado:
      'Representa esperança, orientação, inspiração, clareza espiritual e conexão com objetivos elevados.',
    luz:
      'fé, proteção, direção, criatividade, sucesso e confiança no caminho.',
    sombra:
      'idealização, excesso de expectativas, fuga da realidade e espera passiva.',
    amor:
      'indica esperança, conexão inspiradora, cura afetiva e visão de futuro.',
    trabalho:
      'favorece criatividade, tecnologia, comunicação, visibilidade e reconhecimento.',
    dinheiro:
      'mostra perspectivas positivas quando existe planejamento e direção.',
    espiritualidade:
      'é uma carta de orientação, intuição, proteção e conexão superior.',
    conselho:
      'siga sua direção com fé, mas transforme inspiração em ação.',
    alerta:
      'não viva apenas de expectativas ou sinais sem atitude concreta.',
    tempo: 'progressivo e favorável.',
    polaridade: 'positiva'
  },
  {
    numero: 17,
    id: 'cegonha',
    nome: 'A Cegonha',
    simbolo: 'mudança, renovação e melhoria',
    palavrasChave: [
      'mudança',
      'renovação',
      'melhoria',
      'transição',
      'movimento',
      'fertilidade'
    ],
    significado:
      'Representa mudanças, melhorias, renovação, transições e chegada de uma nova fase.',
    luz:
      'evolução, crescimento, mudança favorável, criatividade e renovação.',
    sombra:
      'instabilidade, ansiedade pela mudança e dificuldade de se adaptar.',
    amor:
      'indica evolução da relação, reconciliação, mudança de status ou renovação afetiva.',
    trabalho:
      'mostra mudança de função, emprego, ambiente ou método de trabalho.',
    dinheiro:
      'aponta melhoria gradual após reorganização.',
    espiritualidade:
      'representa renovação energética e passagem para um novo ciclo.',
    conselho:
      'aceite as mudanças que conduzem ao crescimento.',
    alerta:
      'não mude apenas por insatisfação momentânea.',
    tempo: 'próximo e progressivo.',
    polaridade: 'positiva'
  },
  {
    numero: 18,
    id: 'cao',
    nome: 'O Cão',
    simbolo: 'amizade, lealdade e apoio',
    palavrasChave: [
      'amizade',
      'lealdade',
      'confiança',
      'apoio',
      'companheirismo',
      'proteção'
    ],
    significado:
      'Representa amizade, lealdade, confiança, apoio e pessoas que permanecem ao lado do consulente.',
    luz:
      'fidelidade, parceria, ajuda sincera, proteção e confiança.',
    sombra:
      'dependência, submissão, confiança ingênua e amizade desequilibrada.',
    amor:
      'indica companheirismo, fidelidade e vínculo baseado em amizade.',
    trabalho:
      'mostra colega confiável, parceria profissional ou apoio importante.',
    dinheiro:
      'aconselha buscar ajuda ou parceria com pessoas confiáveis.',
    espiritualidade:
      'representa proteção, fidelidade aos próprios valores e apoio espiritual.',
    conselho:
      'valorize quem demonstra lealdade por atitudes.',
    alerta:
      'não confunda lealdade com obrigação de aceitar tudo.',
    tempo: 'constante e duradouro.',
    polaridade: 'positiva'
  },
  {
    numero: 19,
    id: 'torre',
    nome: 'A Torre',
    simbolo: 'isolamento, instituição e autonomia',
    palavrasChave: [
      'isolamento',
      'instituição',
      'autoridade',
      'distância',
      'autonomia',
      'proteção'
    ],
    significado:
      'Representa isolamento, instituições, autoridade, distância e necessidade de preservar espaço pessoal.',
    luz:
      'autonomia, segurança, visão elevada, estrutura e limites saudáveis.',
    sombra:
      'solidão, frieza, distanciamento, burocracia e dificuldade de conexão.',
    amor:
      'indica afastamento, necessidade de espaço ou dificuldade de intimidade.',
    trabalho:
      'representa empresas, órgãos públicos, instituições e estruturas hierárquicas.',
    dinheiro:
      'mostra estabilidade institucional, mas também burocracia ou demora.',
    espiritualidade:
      'aconselha recolhimento consciente e fortalecimento dos limites energéticos.',
    conselho:
      'preserve sua individualidade sem se fechar completamente.',
    alerta:
      'não transforme proteção em isolamento emocional.',
    tempo: 'lento e institucional.',
    polaridade: 'neutra'
  },
  {
    numero: 20,
    id: 'jardim',
    nome: 'O Jardim',
    simbolo: 'vida social, público e encontros',
    palavrasChave: [
      'sociedade',
      'público',
      'evento',
      'encontro',
      'rede',
      'visibilidade'
    ],
    significado:
      'Representa vida social, eventos, redes, público, encontros e exposição.',
    luz:
      'popularidade, oportunidades sociais, convivência, divulgação e abertura.',
    sombra:
      'superficialidade, exposição excessiva, influência alheia e aparência.',
    amor:
      'indica encontros, vida social ativa ou relação exposta ao público.',
    trabalho:
      'favorece divulgação, eventos, internet, contatos e atividades com público.',
    dinheiro:
      'aponta ganhos por redes, clientes, público ou parcerias.',
    espiritualidade:
      'representa troca coletiva e necessidade de escolher bem os ambientes.',
    conselho:
      'circule, faça contatos e permita que seu trabalho seja visto.',
    alerta:
      'não exponha sua vida além do necessário.',
    tempo: 'ligado a eventos e encontros próximos.',
    polaridade: 'positiva'
  },
  {
    numero: 21,
    id: 'montanha',
    nome: 'A Montanha',
    simbolo: 'obstáculo, resistência e demora',
    palavrasChave: [
      'obstáculo',
      'bloqueio',
      'demora',
      'resistência',
      'desafio',
      'persistência'
    ],
    significado:
      'Representa obstáculos, bloqueios, demora, resistência e desafios que exigem esforço prolongado.',
    luz:
      'perseverança, força, superação, disciplina e capacidade de resistir.',
    sombra:
      'paralisação, teimosia, atraso, isolamento e dificuldade aparentemente intransponível.',
    amor:
      'indica distância, bloqueio emocional ou dificuldade de aproximação.',
    trabalho:
      'mostra barreiras, concorrência, demora ou projeto que exige persistência.',
    dinheiro:
      'aponta restrição, atraso ou necessidade de planejamento rigoroso.',
    espiritualidade:
      'representa prova de resistência e fortalecimento interior.',
    conselho:
      'avalie se deve escalar o obstáculo, contorná-lo ou escolher outro caminho.',
    alerta:
      'não insista pela força quando uma estratégia diferente é necessária.',
    tempo: 'lento e demorado.',
    polaridade: 'desafiadora'
  },
  {
    numero: 22,
    id: 'caminhos',
    nome: 'Os Caminhos',
    simbolo: 'escolha, alternativas e decisão',
    palavrasChave: [
      'escolha',
      'decisão',
      'alternativas',
      'livre-arbítrio',
      'possibilidades',
      'direção'
    ],
    significado:
      'Representa escolhas, alternativas, decisões e diferentes possibilidades disponíveis.',
    luz:
      'liberdade, novas opções, autonomia e capacidade de escolher conscientemente.',
    sombra:
      'indecisão, dispersão, medo de escolher e perda de oportunidades.',
    amor:
      'indica decisão afetiva, mais de uma possibilidade ou necessidade de definir prioridades.',
    trabalho:
      'mostra alternativas profissionais, mudança de carreira ou decisão importante.',
    dinheiro:
      'aconselha comparar opções e consequências antes de investir.',
    espiritualidade:
      'representa livre-arbítrio e responsabilidade pelas escolhas.',
    conselho:
      'escolha pelo que está alinhado com seus valores, não apenas pelo caminho mais fácil.',
    alerta:
      'adiar indefinidamente também produz consequências.',
    tempo: 'depende da decisão do consulente.',
    polaridade: 'neutra'
  },
  {
    numero: 23,
    id: 'ratos',
    nome: 'Os Ratos',
    simbolo: 'desgaste, perda e preocupação',
    palavrasChave: [
      'desgaste',
      'perda',
      'ansiedade',
      'roubo',
      'preocupação',
      'deterioração'
    ],
    significado:
      'Representa perdas graduais, desgaste, ansiedade, preocupações e situações que consomem energia.',
    luz:
      'capacidade de perceber rapidamente onde existe desperdício e corrigir o problema.',
    sombra:
      'roubo, estresse, perda, deterioração, medo e esgotamento.',
    amor:
      'indica desgaste emocional, ansiedade, desconfiança ou relação que está consumindo energia.',
    trabalho:
      'mostra estresse, perda de produtividade, ambiente desgastante ou pequenos prejuízos.',
    dinheiro:
      'alerta para gastos ocultos, perdas graduais, dívidas ou desperdício.',
    espiritualidade:
      'representa drenagem energética causada por preocupação ou ambiente nocivo.',
    conselho:
      'identifique o que está consumindo sua energia e interrompa a perda.',
    alerta:
      'não ignore pequenos problemas que estão crescendo silenciosamente.',
    tempo: 'gradual e contínuo.',
    polaridade: 'desafiadora'
  },
  {
    numero: 24,
    id: 'coracao',
    nome: 'O Coração',
    simbolo: 'amor, sentimentos e alegria',
    palavrasChave: [
      'amor',
      'afeto',
      'sentimento',
      'paixão',
      'alegria',
      'generosidade'
    ],
    significado:
      'Representa amor, sentimentos verdadeiros, alegria, paixão e decisões guiadas pelo coração.',
    luz:
      'amor sincero, felicidade, afeto, generosidade e abertura emocional.',
    sombra:
      'carência, idealização, dependência emocional e decisões puramente sentimentais.',
    amor:
      'é uma das cartas mais favoráveis para sentimentos, paixão, união e reciprocidade.',
    trabalho:
      'indica satisfação profissional, vocação ou trabalho realizado com paixão.',
    dinheiro:
      'mostra generosidade e escolhas financeiras influenciadas por sentimentos.',
    espiritualidade:
      'representa cura emocional, amor-próprio e abertura do coração.',
    conselho:
      'escute seus sentimentos sem abandonar o discernimento.',
    alerta:
      'não confunda intensidade emocional com garantia de permanência.',
    tempo: 'próximo e emocionalmente significativo.',
    polaridade: 'positiva'
  },
  {
    numero: 25,
    id: 'alianca',
    nome: 'A Aliança',
    simbolo: 'compromisso, contrato e união',
    palavrasChave: [
      'compromisso',
      'contrato',
      'parceria',
      'união',
      'acordo',
      'ciclo'
    ],
    significado:
      'Representa compromissos, contratos, parcerias, uniões e acordos que ligam pessoas ou interesses.',
    luz:
      'cooperação, compromisso, fidelidade, parceria e acordo benéfico.',
    sombra:
      'dependência, obrigação, repetição de ciclos e acordos desequilibrados.',
    amor:
      'indica compromisso, namoro, casamento, reconciliação ou fortalecimento de união.',
    trabalho:
      'favorece contratos, sociedades, clientes e parcerias profissionais.',
    dinheiro:
      'mostra acordo financeiro, sociedade ou compromisso de longo prazo.',
    espiritualidade:
      'representa pactos pessoais, promessas e responsabilidade com o próprio caminho.',
    conselho:
      'assuma apenas compromissos que possa sustentar com verdade.',
    alerta:
      'não permaneça em um acordo apenas por medo de romper o ciclo.',
    tempo: 'duradouro ou cíclico.',
    polaridade: 'positiva'
  },
  {
    numero: 26,
    id: 'livro',
    nome: 'O Livro',
    simbolo: 'segredo, conhecimento e estudo',
    palavrasChave: [
      'segredo',
      'conhecimento',
      'estudo',
      'mistério',
      'informação',
      'aprendizado'
    ],
    significado:
      'Representa segredos, informações ainda não reveladas, estudo, conhecimento e assuntos reservados.',
    luz:
      'aprendizado, sabedoria, pesquisa, descoberta e desenvolvimento intelectual.',
    sombra:
      'segredo prejudicial, omissão, falta de informação e conhecimento usado para manipular.',
    amor:
      'indica sentimentos ocultos, relação discreta ou algo que ainda precisa ser revelado.',
    trabalho:
      'favorece estudos, cursos, especialização, documentos e informações confidenciais.',
    dinheiro:
      'aconselha analisar contratos e conhecer todos os detalhes antes de decidir.',
    espiritualidade:
      'representa conhecimento oculto e aprendizado que exige preparação.',
    conselho:
      'busque informação antes de formar uma conclusão.',
    alerta:
      'não pressione uma revelação antes de estar preparado para lidar com ela.',
    tempo: 'depende da descoberta ou revelação.',
    polaridade: 'neutra'
  },
  {
    numero: 27,
    id: 'carta',
    nome: 'A Carta',
    simbolo: 'mensagem, documento e comunicação',
    palavrasChave: [
      'mensagem',
      'documento',
      'notícia',
      'comunicação',
      'contrato',
      'registro'
    ],
    significado:
      'Representa mensagens, documentos, notícias, comunicação escrita e informações formais.',
    luz:
      'clareza, notícia favorável, resposta, contrato e comunicação objetiva.',
    sombra:
      'informação incompleta, atraso de resposta, documento problemático ou mensagem fria.',
    amor:
      'indica mensagem, declaração, conversa escrita ou contato importante.',
    trabalho:
      'favorece contratos, propostas, e-mails, documentos e processos seletivos.',
    dinheiro:
      'mostra boleto, contrato, aprovação, comprovante ou negociação formal.',
    espiritualidade:
      'representa sinal claro que precisa ser lido com atenção.',
    conselho:
      'leia, escreva e confirme as informações importantes.',
    alerta:
      'não tome decisões com base em mensagens ambíguas.',
    tempo: 'rápido, ligado à chegada de uma comunicação.',
    polaridade: 'neutra'
  },
  {
    numero: 28,
    id: 'homem',
    nome: 'O Homem',
    simbolo: 'figura masculina ou energia ativa',
    palavrasChave: [
      'homem',
      'consulente',
      'parceiro',
      'ação',
      'racionalidade',
      'presença'
    ],
    significado:
      'Representa uma figura masculina importante, o próprio consulente ou uma energia de ação e objetividade.',
    luz:
      'iniciativa, presença, racionalidade, proteção e capacidade de decisão.',
    sombra:
      'rigidez, distanciamento emocional, controle e dificuldade de demonstrar sentimentos.',
    amor:
      'pode representar parceiro, interesse afetivo ou homem ligado à pergunta.',
    trabalho:
      'indica chefe, colega, cliente ou figura masculina influente.',
    dinheiro:
      'mostra decisão ou influência de um homem em questões materiais.',
    espiritualidade:
      'representa energia ativa, direção e necessidade de agir.',
    conselho:
      'observe as atitudes concretas da pessoa representada.',
    alerta:
      'não atribua automaticamente identidade específica sem contexto suficiente.',
    tempo: 'relacionado às ações da pessoa representada.',
    polaridade: 'neutra'
  },
  {
    numero: 29,
    id: 'mulher',
    nome: 'A Mulher',
    simbolo: 'figura feminina ou energia receptiva',
    palavrasChave: [
      'mulher',
      'consulente',
      'parceira',
      'intuição',
      'sensibilidade',
      'presença'
    ],
    significado:
      'Representa uma figura feminina importante, a própria consulente ou uma energia intuitiva e receptiva.',
    luz:
      'sensibilidade, percepção, criatividade, acolhimento e inteligência emocional.',
    sombra:
      'insegurança, passividade, excesso de sensibilidade e dificuldade de estabelecer limites.',
    amor:
      'pode representar parceira, interesse afetivo ou mulher ligada à pergunta.',
    trabalho:
      'indica chefe, colega, cliente ou figura feminina influente.',
    dinheiro:
      'mostra decisão ou influência de uma mulher em questões materiais.',
    espiritualidade:
      'representa energia receptiva, intuição e percepção dos sinais.',
    conselho:
      'observe os sentimentos e as atitudes concretas da pessoa representada.',
    alerta:
      'não atribua automaticamente identidade específica sem contexto suficiente.',
    tempo: 'relacionado às ações da pessoa representada.',
    polaridade: 'neutra'
  },
  {
    numero: 30,
    id: 'lirios',
    nome: 'Os Lírios',
    simbolo: 'paz, maturidade e harmonia',
    palavrasChave: [
      'paz',
      'maturidade',
      'harmonia',
      'serenidade',
      'experiência',
      'sensualidade'
    ],
    significado:
      'Representa paz, maturidade, experiência, harmonia, dignidade e sensualidade consciente.',
    luz:
      'serenidade, sabedoria, conciliação, respeito e equilíbrio.',
    sombra:
      'frieza, acomodação, silêncio excessivo e moralismo.',
    amor:
      'indica relação madura, paz, intimidade, sensualidade e reconciliação.',
    trabalho:
      'mostra experiência, respeito, ambiente equilibrado ou atuação de pessoa mais velha.',
    dinheiro:
      'favorece estabilidade e administração prudente.',
    espiritualidade:
      'representa paz interior, maturidade e elevação de conduta.',
    conselho:
      'conduza a situação com calma, dignidade e maturidade.',
    alerta:
      'não use a paz como desculpa para evitar conversas necessárias.',
    tempo: 'lento, estável e maduro.',
    polaridade: 'positiva'
  },
  {
    numero: 31,
    id: 'sol',
    nome: 'O Sol',
    simbolo: 'sucesso, clareza e vitalidade',
    palavrasChave: [
      'sucesso',
      'clareza',
      'vitalidade',
      'vitória',
      'reconhecimento',
      'energia'
    ],
    significado:
      'Representa sucesso, clareza, vitalidade, reconhecimento e resultados positivos.',
    luz:
      'vitória, alegria, prosperidade, força, verdade e expansão.',
    sombra:
      'orgulho, excesso de confiança, exposição e esgotamento por excesso de atividade.',
    amor:
      'indica felicidade, transparência, união e forte atração.',
    trabalho:
      'favorece sucesso, promoção, reconhecimento, liderança e expansão.',
    dinheiro:
      'é muito favorável para prosperidade e resultados materiais.',
    espiritualidade:
      'representa luz, proteção, clareza e fortalecimento energético.',
    conselho:
      'avance com confiança e compartilhe sua luz com humildade.',
    alerta:
      'não permita que o orgulho prejudique uma fase favorável.',
    tempo: 'rápido e favorável.',
    polaridade: 'positiva'
  },
  {
    numero: 32,
    id: 'lua',
    nome: 'A Lua',
    simbolo: 'emoção, intuição e reconhecimento',
    palavrasChave: [
      'intuição',
      'emoção',
      'sensibilidade',
      'reconhecimento',
      'imaginação',
      'ciclos'
    ],
    significado:
      'Representa emoções, intuição, imaginação, reconhecimento e ciclos internos.',
    luz:
      'sensibilidade, criatividade, prestígio, percepção e conexão emocional.',
    sombra:
      'ilusão, ansiedade, instabilidade emocional, medo e idealização.',
    amor:
      'indica sentimentos profundos, romantismo, saudade ou oscilação emocional.',
    trabalho:
      'favorece criatividade, reconhecimento e atividades ligadas à imagem ou sensibilidade.',
    dinheiro:
      'aconselha não decidir apenas pelo estado emocional do momento.',
    espiritualidade:
      'representa intuição, sonhos, ciclos e percepção do inconsciente.',
    conselho:
      'escute a intuição, mas confirme com fatos.',
    alerta:
      'não transforme medo ou desejo em previsão.',
    tempo: 'cíclico, aproximadamente um mês ou uma fase emocional.',
    polaridade: 'neutra'
  },
  {
    numero: 33,
    id: 'chave',
    nome: 'A Chave',
    simbolo: 'solução, certeza e abertura',
    palavrasChave: [
      'solução',
      'abertura',
      'certeza',
      'resposta',
      'oportunidade',
      'libertação'
    ],
    significado:
      'Representa solução, abertura, resposta importante e possibilidade de resolver uma questão.',
    luz:
      'sucesso, clareza, libertação, oportunidade e confirmação.',
    sombra:
      'excesso de certeza, tentativa de controlar o resultado e solução usada de forma precipitada.',
    amor:
      'indica abertura afetiva, solução de conflito ou resposta decisiva.',
    trabalho:
      'mostra oportunidade importante, solução profissional ou acesso a nova posição.',
    dinheiro:
      'favorece resolução, liberação, aprovação ou estratégia eficaz.',
    espiritualidade:
      'representa desbloqueio, compreensão e acesso a um novo nível de consciência.',
    conselho:
      'use a oportunidade com responsabilidade.',
    alerta:
      'a chave abre a porta, mas ainda é necessário atravessá-la.',
    tempo: 'próximo e decisivo.',
    polaridade: 'positiva'
  },
  {
    numero: 34,
    id: 'peixes',
    nome: 'Os Peixes',
    simbolo: 'dinheiro, fluxo e abundância',
    palavrasChave: [
      'dinheiro',
      'abundância',
      'negócios',
      'fluxo',
      'independência',
      'recursos'
    ],
    significado:
      'Representa dinheiro, negócios, abundância, recursos e capacidade de circular livremente.',
    luz:
      'prosperidade, ganhos, independência, expansão e boa circulação financeira.',
    sombra:
      'ganância, instabilidade, gastos excessivos e apego material.',
    amor:
      'indica relação que precisa de liberdade ou forte troca de valores e desejos.',
    trabalho:
      'favorece negócios, vendas, empreendedorismo e atividades autônomas.',
    dinheiro:
      'é uma das cartas mais favoráveis para ganhos, recursos e expansão financeira.',
    espiritualidade:
      'representa fluxo e necessidade de equilibrar prosperidade com propósito.',
    conselho:
      'mantenha seus recursos em movimento com organização.',
    alerta:
      'não permita que o dinheiro controle todas as suas escolhas.',
    tempo: 'contínuo e ligado ao fluxo da situação.',
    polaridade: 'positiva'
  },
  {
    numero: 35,
    id: 'ancora',
    nome: 'A Âncora',
    simbolo: 'estabilidade, trabalho e permanência',
    palavrasChave: [
      'estabilidade',
      'trabalho',
      'segurança',
      'permanência',
      'firmeza',
      'resistência'
    ],
    significado:
      'Representa estabilidade, trabalho, segurança, permanência e aquilo que mantém a pessoa firme.',
    luz:
      'segurança, fidelidade, constância, resistência e realização profissional.',
    sombra:
      'estagnação, apego, rotina pesada, imobilidade e medo de mudar.',
    amor:
      'indica vínculo estável e duradouro, mas pode mostrar acomodação.',
    trabalho:
      'é muito favorável para emprego, carreira, estabilidade e consolidação.',
    dinheiro:
      'aponta segurança e resultados construídos com constância.',
    espiritualidade:
      'representa enraizamento, firmeza e necessidade de manter o centro.',
    conselho:
      'permaneça firme no que tem fundamento, mas revise o que virou estagnação.',
    alerta:
      'não fique preso apenas porque algo parece seguro.',
    tempo: 'longo, estável e duradouro.',
    polaridade: 'positiva'
  },
  {
    numero: 36,
    id: 'cruz',
    nome: 'A Cruz',
    simbolo: 'prova, responsabilidade e aprendizado',
    palavrasChave: [
      'prova',
      'responsabilidade',
      'destino',
      'aprendizado',
      'peso',
      'fé'
    ],
    significado:
      'Representa provas, responsabilidades, aprendizado profundo, fé e situações que exigem maturidade.',
    luz:
      'superação, fé, propósito, sabedoria e encerramento de uma prova.',
    sombra:
      'sofrimento, culpa, peso, vitimismo e manutenção desnecessária da dor.',
    amor:
      'indica relação de aprendizado intenso, responsabilidade ou peso emocional.',
    trabalho:
      'mostra obrigação difícil, missão, cobrança ou período de grande responsabilidade.',
    dinheiro:
      'aconselha responsabilidade e enfrentamento consciente de compromissos.',
    espiritualidade:
      'representa fé, prova de amadurecimento e busca de significado.',
    conselho:
      'reconheça o aprendizado sem transformar sofrimento em identidade.',
    alerta:
      'não carregue sozinho um peso que pode ser reorganizado ou compartilhado.',
    tempo: 'até a conclusão do aprendizado ou responsabilidade.',
    polaridade: 'desafiadora'
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

function gerarSemente(input: BaralhoCiganoInput): number {
  const nome = limparNome(input.fullName);
  const nascimento = String(input.birthDate || '').replace(/\D/g, '');
  const pergunta = normalizar(input.question || '');

  return (
    somaTexto(nome) +
    somaTexto(nascimento) * 3 +
    somaTexto(pergunta) * 7 +
    nome.length * 11 +
    nascimento.length * 13
  );
}

function detectarTema(pergunta: string): TemaBaralhoCigano {
  const texto = normalizar(pergunta);

  if (
    [
      'amor',
      'relacionamento',
      'namoro',
      'casamento',
      'ex',
      'volta',
      'reconciliacao',
      'sentimento',
      'paixao',
      'ficante',
      'saudade'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'amor';
  }

  if (
    [
      'dinheiro',
      'financeiro',
      'prosperidade',
      'riqueza',
      'venda',
      'negocio',
      'lucro'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'prosperidade';
  }

  if (
    [
      'trabalho',
      'emprego',
      'carreira',
      'profissao',
      'chefe',
      'empresa',
      'vaga'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'trabalho';
  }

  if (
    [
      'espiritual',
      'energia',
      'guia',
      'entidade',
      'mediunidade',
      'caminho espiritual'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'espiritualidade';
  }

  if (
    ['familia', 'filho', 'filha', 'casa', 'mae', 'pai', 'irmao'].some(
      (termo) => texto.includes(termo)
    )
  ) {
    return 'família';
  }

  if (
    [
      'saude',
      'doenca',
      'tratamento',
      'corpo',
      'cansaco',
      'bem estar'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'saúde';
  }

  if (
    [
      'inveja',
      'protecao',
      'demanda',
      'olho gordo',
      'perseguicao',
      'falsidade'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'proteção';
  }

  return 'geral';
}

function selecionarCarta(
  semente: number,
  deslocamento: number,
  usadas: Set<number>
): CartaBaralhoCigano {
  let indice =
    Math.abs(semente + deslocamento * deslocamento + deslocamento * 17) %
    CARTAS.length;

  while (usadas.has(indice)) {
    indice = (indice + 1) % CARTAS.length;
  }

  usadas.add(indice);

  return CARTAS[indice];
}

function interpretarPorTema(
  carta: CartaBaralhoCigano,
  tema: TemaBaralhoCigano
): string {
  switch (tema) {
    case 'amor':
      return carta.amor;

    case 'trabalho':
      return carta.trabalho;

    case 'prosperidade':
      return carta.dinheiro;

    case 'espiritualidade':
    case 'proteção':
      return carta.espiritualidade;

    case 'família':
      return `${carta.significado} No campo familiar, observe especialmente: ${carta.conselho}`;

    case 'saúde':
      return `${carta.significado} Em temas de saúde, esta carta deve ser entendida como orientação simbólica, sem substituir avaliação profissional.`;

    default:
      return carta.significado;
  }
}

function criarPosicao(
  posicao: PosicaoBaralhoCigano['posicao'],
  titulo: string,
  carta: CartaBaralhoCigano,
  tema: TemaBaralhoCigano
): PosicaoBaralhoCigano {
  return {
    posicao,
    titulo,
    carta,
    interpretacaoTematica: interpretarPorTema(carta, tema)
  };
}

function analisarElementos(
  cartas: CartaBaralhoCigano[]
): {
  cartasFavoraveis: string[];
  cartasDesafiadoras: string[];
  elementosRepetidos: string[];
} {
  const cartasFavoraveis = cartas
    .filter((carta) => carta.polaridade === 'positiva')
    .map((carta) => carta.nome);

  const cartasDesafiadoras = cartas
    .filter((carta) => carta.polaridade === 'desafiadora')
    .map((carta) => carta.nome);

  const ocorrencias = new Map<string, number>();

  for (const carta of cartas) {
    for (const palavra of carta.palavrasChave) {
      ocorrencias.set(palavra, (ocorrencias.get(palavra) || 0) + 1);
    }
  }

  const elementosRepetidos = Array.from(ocorrencias.entries())
    .filter(([, quantidade]) => quantidade >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([palavra]) => palavra)
    .slice(0, 8);

  return {
    cartasFavoraveis,
    cartasDesafiadoras,
    elementosRepetidos
  };
}

function construirDirecaoPrincipal(
  favoraveis: string[],
  desafiadoras: string[],
  conselho: CartaBaralhoCigano
): string {
  if (favoraveis.length > desafiadoras.length) {
    return `A leitura possui predominância favorável. O avanço depende de aplicar o conselho de ${conselho.nome}: ${conselho.conselho}`;
  }

  if (desafiadoras.length > favoraveis.length) {
    return `A leitura apresenta obstáculos importantes, mas não determina fracasso. A principal direção é seguir o conselho de ${conselho.nome}: ${conselho.conselho}`;
  }

  return `A leitura mostra equilíbrio entre oportunidades e desafios. A direção central está em ${conselho.nome}: ${conselho.conselho}`;
}

function formatarCarta(posicao: PosicaoBaralhoCigano): string {
  const { carta } = posicao;

  return `
═══════════════════════
${posicao.titulo.toUpperCase()}
═══════════════════════

Carta ${carta.numero}: ${carta.nome}

Símbolo:
${carta.simbolo}

Interpretação:
${posicao.interpretacaoTematica}

Significado:
${carta.significado}

Luz:
${carta.luz}

Sombra:
${carta.sombra}

Conselho:
${carta.conselho}

Alerta:
${carta.alerta}

Tempo estimado nas cartas:
${carta.tempo}
`.trim();
}

export function buildBaralhoCiganoSupremo(
  input: BaralhoCiganoInput
): BaralhoCiganoResultado {
  const entrada = {
    fullName: String(input.fullName || '').trim(),
    birthDate: String(input.birthDate || '').trim(),
    question: String(input.question || '').trim()
  };

  const tema = detectarTema(entrada.question);
  const semente = gerarSemente(entrada);
  const usadas = new Set<number>();

  const energiaCentral = criarPosicao(
    'energia-central',
    'Energia central',
    selecionarCarta(semente, 3, usadas),
    tema
  );

  const passado = criarPosicao(
    'passado',
    'Influência do passado',
    selecionarCarta(semente, 7, usadas),
    tema
  );

  const presente = criarPosicao(
    'presente',
    'Situação presente',
    selecionarCarta(semente, 13, usadas),
    tema
  );

  const tendencia = criarPosicao(
    'tendencia',
    'Tendência do caminho',
    selecionarCarta(semente, 19, usadas),
    tema
  );

  const obstaculo = criarPosicao(
    'obstaculo',
    'Obstáculo principal',
    selecionarCarta(semente, 23, usadas),
    tema
  );

  const caminho = criarPosicao(
    'caminho',
    'Caminho favorável',
    selecionarCarta(semente, 29, usadas),
    tema
  );

  const conselho = criarPosicao(
    'conselho',
    'Conselho final',
    selecionarCarta(semente, 31, usadas),
    tema
  );

  const cartasSelecionadas = [
    energiaCentral.carta,
    passado.carta,
    presente.carta,
    tendencia.carta,
    obstaculo.carta,
    caminho.carta,
    conselho.carta
  ];

  const analise = analisarElementos(cartasSelecionadas);

  const direcaoPrincipal = construirDirecaoPrincipal(
    analise.cartasFavoraveis,
    analise.cartasDesafiadoras,
    conselho.carta
  );

  const resumoParaOraculo = `
BARALHO CIGANO SUPREMO

Método:
Mandala dos Sete Caminhos

Tema detectado:
${tema}

${formatarCarta(energiaCentral)}

${formatarCarta(passado)}

${formatarCarta(presente)}

${formatarCarta(tendencia)}

${formatarCarta(obstaculo)}

${formatarCarta(caminho)}

${formatarCarta(conselho)}

═══════════════════════
CONVERGÊNCIAS
═══════════════════════

Cartas favoráveis:
${
  analise.cartasFavoraveis.length
    ? analise.cartasFavoraveis.join(', ')
    : 'nenhuma predominância favorável isolada'
}

Cartas desafiadoras:
${
  analise.cartasDesafiadoras.length
    ? analise.cartasDesafiadoras.join(', ')
    : 'nenhuma predominância desafiadora isolada'
}

Temas repetidos:
${
  analise.elementosRepetidos.length
    ? analise.elementosRepetidos.join(', ')
    : 'sem repetição temática dominante'
}

Direção principal:
${direcaoPrincipal}

═══════════════════════
INSTRUÇÕES PARA O CONSULTOR
═══════════════════════

Interprete o Baralho Cigano conforme a identidade, personalidade, linguagem,
tom de voz e estilo do consultor selecionado.

Use as cartas como bastidor interno da consulta.

Não diga que selecionou, sorteou ou calculou cartas.

Não descreva a leitura como algoritmo, sistema ou relatório técnico.

Não leia cada carta de forma isolada.

Cruze:

• a energia central;
• a influência do passado;
• a situação presente;
• a tendência;
• o obstáculo;
• o caminho favorável;
• o conselho final.

Dê maior importância aos significados que se repetem entre duas ou mais cartas.

Considere a posição ocupada por cada carta.

Uma carta desafiadora na posição de obstáculo descreve o problema.

Uma carta desafiadora na posição de conselho pode indicar aquilo que precisa
ser interrompido, evitado ou transformado.

Uma carta favorável na posição de tendência mostra possibilidade de evolução,
mas não deve ser apresentada como garantia absoluta.

Responda diretamente à pergunta do consulente.

Apresente:

• o cenário atual;
• as influências do passado;
• os sentimentos e padrões relevantes;
• os bloqueios;
• as possibilidades;
• a atitude mais favorável;
• uma orientação prática final.

Não afirme pensamentos, sentimentos ou ações de outra pessoa como fatos
comprovados.

Não prometa retorno amoroso, casamento, separação, traição, gravidez,
riqueza, cura ou qualquer acontecimento futuro como certeza.

Preserve o livre-arbítrio.

A resposta deve ser profunda, natural, humana, coerente e personalizada.
`.trim();

  return {
    oracle: 'baralho-cigano',

    entrada,

    tema,

    metodo: {
      nome: 'Mandala dos Sete Caminhos',
      quantidadeCartas: 7,
      descricao:
        'Leitura com energia central, passado, presente, tendência, obstáculo, caminho favorável e conselho final.'
    },

    leitura: {
      energiaCentral,
      passado,
      presente,
      tendencia,
      obstaculo,
      caminho,
      conselho
    },

    sintese: {
      cartasFavoraveis: analise.cartasFavoraveis,
      cartasDesafiadoras: analise.cartasDesafiadoras,
      elementosRepetidos: analise.elementosRepetidos,
      direcaoPrincipal
    },

    resumoParaOraculo
  };
}

export const BARALHO_CIGANO_CARTAS = CARTAS;

export default buildBaralhoCiganoSupremo;