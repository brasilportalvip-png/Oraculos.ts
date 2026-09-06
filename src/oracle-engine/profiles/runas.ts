export interface RunasInput {
  fullName: string;
  birthDate: string;
  question?: string;
}

export type TemaRunas =
  | 'amor'
  | 'trabalho'
  | 'prosperidade'
  | 'espiritualidade'
  | 'família'
  | 'proteção'
  | 'saúde'
  | 'geral';

export type PolaridadeRuna =
  | 'favorável'
  | 'neutra'
  | 'desafiadora';

export interface Runa {
  numero: number;
  id: string;
  nome: string;
  simbolo: string;
  fonema: string;
  aett: 'Freyr' | 'Heimdall' | 'Tyr';
  elemento: string;
  palavrasChave: string[];
  essencia: string;
  significado: string;
  luz: string;
  sombra: string;
  invertida: string;
  amor: string;
  trabalho: string;
  prosperidade: string;
  espiritualidade: string;
  conselho: string;
  alerta: string;
  tempo: string;
  polaridade: PolaridadeRuna;
}

export interface RunaSelecionada {
  posicao:
    | 'origem'
    | 'presente'
    | 'forca'
    | 'obstaculo'
    | 'caminho'
    | 'tendencia'
    | 'conselho';

  titulo: string;
  runa: Runa;
  invertida: boolean;
  interpretacaoTematica: string;
}

export interface RunasResultado {
  oracle: 'runas';

  entrada: {
    fullName: string;
    birthDate: string;
    question: string;
  };

  tema: TemaRunas;

  metodo: {
    nome: string;
    quantidadeRunas: number;
    descricao: string;
  };

  leitura: {
    origem: RunaSelecionada;
    presente: RunaSelecionada;
    forca: RunaSelecionada;
    obstaculo: RunaSelecionada;
    caminho: RunaSelecionada;
    tendencia: RunaSelecionada;
    conselho: RunaSelecionada;
  };

  sintese: {
    runasFavoraveis: string[];
    runasDesafiadoras: string[];
    aettsPresentes: string[];
    elementosDominantes: string[];
    temasRepetidos: string[];
    direcaoPrincipal: string;
  };

  resumoParaOraculo: string;
}

const RUNAS: Runa[] = [
  {
    numero: 1,
    id: 'fehu',
    nome: 'Fehu',
    simbolo: 'ᚠ',
    fonema: 'F',
    aett: 'Freyr',
    elemento: 'Fogo e Terra',
    palavrasChave: [
      'riqueza',
      'recursos',
      'movimento',
      'prosperidade',
      'valor',
      'realização'
    ],
    essencia:
      'A energia dos recursos que precisam circular para gerar crescimento.',
    significado:
      'Representa bens, recursos, prosperidade, força produtiva e capacidade de transformar esforço em resultado.',
    luz:
      'abundância, ganhos, produtividade, valorização, prosperidade e início material favorável.',
    sombra:
      'ganância, apego, desperdício, ansiedade financeira e uso irresponsável dos recursos.',
    invertida:
      'Pode indicar perda, bloqueio financeiro, desperdício, atraso ou necessidade de reorganizar prioridades materiais.',
    amor:
      'Mostra relação que precisa trocar afeto e valor de maneira equilibrada. Também pode indicar atração e construção conjunta.',
    trabalho:
      'Favorece produtividade, remuneração, novas oportunidades e valorização profissional.',
    prosperidade:
      'É uma runa forte para ganhos e expansão, desde que o recurso seja bem administrado.',
    espiritualidade:
      'Ensina que prosperidade também envolve energia, gratidão e responsabilidade.',
    conselho:
      'Faça seus recursos circularem com consciência e invista naquilo que produz valor real.',
    alerta:
      'Não confunda prosperidade com acúmulo, controle ou ostentação.',
    tempo: 'rápido a moderado, ligado ao início de um movimento.',
    polaridade: 'favorável'
  },

  {
    numero: 2,
    id: 'uruz',
    nome: 'Uruz',
    simbolo: 'ᚢ',
    fonema: 'U',
    aett: 'Freyr',
    elemento: 'Terra',
    palavrasChave: [
      'força',
      'vitalidade',
      'resistência',
      'transformação',
      'coragem',
      'recuperação'
    ],
    essencia:
      'A força vital bruta que precisa ser dirigida com consciência.',
    significado:
      'Representa vitalidade, resistência, coragem, recuperação e transformação por meio da experiência.',
    luz:
      'força, saúde simbólica, renovação, poder pessoal, coragem e capacidade de superar.',
    sombra:
      'agressividade, teimosia, domínio, exaustão e uso descontrolado da força.',
    invertida:
      'Pode mostrar baixa energia, insegurança, desgaste, oportunidade perdida ou resistência interna.',
    amor:
      'Indica atração intensa, força emocional e necessidade de transformar padrões desgastados.',
    trabalho:
      'Mostra capacidade de suportar desafios e reconstruir uma posição profissional.',
    prosperidade:
      'A prosperidade depende de disciplina, resistência e ação consistente.',
    espiritualidade:
      'Representa fortalecimento interior e recuperação do próprio centro.',
    conselho:
      'Use sua força para construir, não para controlar ou destruir.',
    alerta:
      'Não ignore sinais de desgaste físico ou emocional.',
    tempo: 'gradual, conforme a recuperação da força.',
    polaridade: 'favorável'
  },

  {
    numero: 3,
    id: 'thurisaz',
    nome: 'Thurisaz',
    simbolo: 'ᚦ',
    fonema: 'TH',
    aett: 'Freyr',
    elemento: 'Fogo',
    palavrasChave: [
      'defesa',
      'confronto',
      'força',
      'limite',
      'reação',
      'proteção'
    ],
    essencia:
      'A força defensiva que interrompe, confronta e exige consciência antes da ação.',
    significado:
      'Representa proteção, confronto, limites, forças intensas e situações que pedem pausa antes de reagir.',
    luz:
      'defesa, coragem, rompimento de bloqueios, proteção e poder de estabelecer limites.',
    sombra:
      'conflito, agressividade, impulsividade, provocação e destruição desnecessária.',
    invertida:
      'Pode indicar vulnerabilidade, medo do confronto, defesa enfraquecida ou reação mal direcionada.',
    amor:
      'Aponta tensão, necessidade de limites e risco de confronto emocional.',
    trabalho:
      'Recomenda cautela com disputas, competição e decisões tomadas sob pressão.',
    prosperidade:
      'Pede proteção dos recursos e análise cuidadosa antes de assumir riscos.',
    espiritualidade:
      'Simboliza defesa energética e confronto com padrões que já não podem continuar.',
    conselho:
      'Pare, observe e escolha conscientemente quando agir.',
    alerta:
      'Uma reação impulsiva pode criar um problema maior que o original.',
    tempo: 'imediato, quando um limite precisa ser definido.',
    polaridade: 'desafiadora'
  },

  {
    numero: 4,
    id: 'ansuz',
    nome: 'Ansuz',
    simbolo: 'ᚨ',
    fonema: 'A',
    aett: 'Freyr',
    elemento: 'Ar',
    palavrasChave: [
      'comunicação',
      'sabedoria',
      'mensagem',
      'inspiração',
      'conselho',
      'verdade'
    ],
    essencia:
      'A palavra que transmite conhecimento, orientação e consciência.',
    significado:
      'Representa comunicação, aprendizado, mensagens, inspiração, conselho e uso responsável da palavra.',
    luz:
      'clareza, sabedoria, diálogo, notícia importante, inspiração e entendimento.',
    sombra:
      'manipulação, mentira, ruído, promessa vazia, fofoca e interpretação errada.',
    invertida:
      'Pode mostrar falha de comunicação, engano, conselho ruim ou dificuldade de compreender sinais.',
    amor:
      'Indica conversa necessária, mensagem, revelação ou reconexão por meio do diálogo.',
    trabalho:
      'Favorece entrevistas, ensino, comunicação, contratos e orientação profissional.',
    prosperidade:
      'Mostra oportunidade ligada a informação, negociação ou conhecimento.',
    espiritualidade:
      'Representa inspiração e necessidade de ouvir com discernimento.',
    conselho:
      'Fale com verdade e escute além das palavras.',
    alerta:
      'Não aceite toda mensagem como verdade sem observar sua origem.',
    tempo: 'rápido, ligado à chegada de informação.',
    polaridade: 'favorável'
  },

  {
    numero: 5,
    id: 'raidho',
    nome: 'Raidho',
    simbolo: 'ᚱ',
    fonema: 'R',
    aett: 'Freyr',
    elemento: 'Ar',
    palavrasChave: [
      'jornada',
      'movimento',
      'direção',
      'viagem',
      'ritmo',
      'decisão'
    ],
    essencia:
      'O caminho percorrido de forma consciente, ordenada e alinhada.',
    significado:
      'Representa viagem, movimento, direção, progresso e necessidade de alinhar intenção e ação.',
    luz:
      'avanço, mudança positiva, organização, direção correta e desenvolvimento.',
    sombra:
      'desvio, pressa, perda de direção, atraso e movimento sem propósito.',
    invertida:
      'Pode indicar atraso, caminho bloqueado, mudança inadequada ou necessidade de rever a rota.',
    amor:
      'Mostra evolução da relação, reencontro, viagem ou necessidade de alinhar caminhos.',
    trabalho:
      'Favorece mudança de cargo, deslocamento, negociação e progresso estruturado.',
    prosperidade:
      'O crescimento vem quando existe planejamento e direção.',
    espiritualidade:
      'Representa jornada de aprendizado e alinhamento com o próprio caminho.',
    conselho:
      'Defina a direção antes de acelerar.',
    alerta:
      'Não continue apenas porque já começou; confirme se o caminho ainda faz sentido.',
    tempo: 'moderado, ligado a deslocamento e progresso.',
    polaridade: 'favorável'
  },

  {
    numero: 6,
    id: 'kenaz',
    nome: 'Kenaz',
    simbolo: 'ᚲ',
    fonema: 'K',
    aett: 'Freyr',
    elemento: 'Fogo',
    palavrasChave: [
      'clareza',
      'criatividade',
      'conhecimento',
      'revelação',
      'habilidade',
      'transformação'
    ],
    essencia:
      'A chama que ilumina, revela e transforma conhecimento em criação.',
    significado:
      'Representa clareza, criatividade, aprendizado, revelação, habilidade e abertura da consciência.',
    luz:
      'inspiração, entendimento, solução, talento, criatividade e verdade revelada.',
    sombra:
      'arrogância intelectual, obsessão, exposição, desgaste e uso destrutivo do conhecimento.',
    invertida:
      'Pode indicar falta de clareza, bloqueio criativo, perda de entusiasmo ou informação oculta.',
    amor:
      'Mostra revelação de sentimentos, atração, compreensão e renovação da intimidade.',
    trabalho:
      'Favorece criatividade, especialização, aprendizado e solução de problemas.',
    prosperidade:
      'Indica ganhos por talento, conhecimento ou capacidade de inovar.',
    espiritualidade:
      'Representa iluminação interior e compreensão de padrões antes ocultos.',
    conselho:
      'Use o que você compreendeu para criar uma mudança concreta.',
    alerta:
      'A clareza exige responsabilidade; não use conhecimento para manipular.',
    tempo: 'rápido quando a compreensão acontece.',
    polaridade: 'favorável'
  },

  {
    numero: 7,
    id: 'gebo',
    nome: 'Gebo',
    simbolo: 'ᚷ',
    fonema: 'G',
    aett: 'Freyr',
    elemento: 'Ar',
    palavrasChave: [
      'troca',
      'parceria',
      'presente',
      'reciprocidade',
      'aliança',
      'equilíbrio'
    ],
    essencia:
      'A troca equilibrada em que dar e receber possuem igual dignidade.',
    significado:
      'Representa parceria, presente, aliança, reciprocidade, compromisso e equilíbrio nas trocas.',
    luz:
      'união, cooperação, generosidade, acordo, parceria e reciprocidade.',
    sombra:
      'dependência, obrigação, troca desigual, cobrança e manipulação por dívida emocional.',
    invertida:
      'Tradicionalmente é uma runa simétrica; quando aparece em posição desafiadora, alerta para desequilíbrio nas trocas.',
    amor:
      'É favorável para união, reciprocidade, compromisso e vínculo equilibrado.',
    trabalho:
      'Indica parceria, contrato, colaboração e cooperação produtiva.',
    prosperidade:
      'Mostra ganhos por acordos equilibrados e alianças confiáveis.',
    espiritualidade:
      'Ensina que toda troca cria responsabilidade e vínculo.',
    conselho:
      'Observe se existe equilíbrio real entre aquilo que você oferece e recebe.',
    alerta:
      'Não transforme amor, ajuda ou presente em dívida ou controle.',
    tempo: 'ligado à formação de um acordo.',
    polaridade: 'favorável'
  },

  {
    numero: 8,
    id: 'wunjo',
    nome: 'Wunjo',
    simbolo: 'ᚹ',
    fonema: 'W',
    aett: 'Freyr',
    elemento: 'Ar',
    palavrasChave: [
      'alegria',
      'harmonia',
      'sucesso',
      'pertencimento',
      'satisfação',
      'união'
    ],
    essencia:
      'A alegria que nasce da harmonia entre o indivíduo e seu ambiente.',
    significado:
      'Representa alegria, harmonia, satisfação, sucesso e sentimento de pertencimento.',
    luz:
      'felicidade, união, bem-estar, reconhecimento, paz e resultado positivo.',
    sombra:
      'acomodação, dependência da aprovação, prazer passageiro e aparência de felicidade.',
    invertida:
      'Pode mostrar tristeza, afastamento, desarmonia, frustração ou dificuldade de reconhecer o que está funcionando.',
    amor:
      'É favorável para felicidade, reconciliação, harmonia e convivência afetiva.',
    trabalho:
      'Mostra satisfação, equipe unida, reconhecimento e ambiente favorável.',
    prosperidade:
      'Indica resultado positivo e prazer pelos frutos alcançados.',
    espiritualidade:
      'Representa paz interior e integração com o próprio caminho.',
    conselho:
      'Valorize a harmonia sem deixar de enfrentar o que precisa ser corrigido.',
    alerta:
      'Não sustente uma aparência de felicidade para evitar conversas difíceis.',
    tempo: 'próximo e favorável.',
    polaridade: 'favorável'
  },

  {
    numero: 9,
    id: 'hagalaz',
    nome: 'Hagalaz',
    simbolo: 'ᚺ',
    fonema: 'H',
    aett: 'Heimdall',
    elemento: 'Gelo e Ar',
    palavrasChave: [
      'ruptura',
      'crise',
      'força natural',
      'mudança',
      'libertação',
      'reconstrução'
    ],
    essencia:
      'A força inesperada que rompe estruturas e obriga uma reorganização.',
    significado:
      'Representa ruptura, crise, mudança inevitável, acontecimentos externos e transformação por quebra de estruturas.',
    luz:
      'libertação, despertar, quebra de padrões, verdade e reconstrução.',
    sombra:
      'perda, caos, interrupção, instabilidade e resistência à mudança.',
    invertida:
      'É geralmente considerada simétrica; em posição desafiadora reforça a necessidade de adaptação e proteção.',
    amor:
      'Pode indicar crise, revelação, ruptura de padrão ou mudança profunda na relação.',
    trabalho:
      'Mostra alteração inesperada, interrupção ou necessidade de reconstruir planos.',
    prosperidade:
      'Aconselha proteger recursos e evitar riscos durante períodos instáveis.',
    espiritualidade:
      'Representa limpeza brusca e quebra do que já não possui sustentação.',
    conselho:
      'Proteja o essencial e reorganize-se a partir da realidade atual.',
    alerta:
      'Não tente controlar aquilo que exige adaptação.',
    tempo: 'repentino e imprevisível.',
    polaridade: 'desafiadora'
  },

  {
    numero: 10,
    id: 'nauthiz',
    nome: 'Nauthiz',
    simbolo: 'ᚾ',
    fonema: 'N',
    aett: 'Heimdall',
    elemento: 'Fogo e Gelo',
    palavrasChave: [
      'necessidade',
      'restrição',
      'disciplina',
      'resistência',
      'aprendizado',
      'escassez'
    ],
    essencia:
      'A necessidade que revela limites e ensina disciplina.',
    significado:
      'Representa restrição, necessidade, falta, resistência e amadurecimento por meio dos limites.',
    luz:
      'disciplina, perseverança, autocontrole, criatividade diante da falta e força interior.',
    sombra:
      'frustração, carência, ansiedade, privação, dependência e sensação de aprisionamento.',
    invertida:
      'É frequentemente tratada como simétrica; em posição difícil aponta negação das próprias necessidades.',
    amor:
      'Mostra carência, distância, necessidade de limites ou relação mantida por dependência.',
    trabalho:
      'Indica restrição, cobrança, falta de recursos ou período que exige disciplina.',
    prosperidade:
      'Pede contenção de gastos, organização e uso consciente dos recursos.',
    espiritualidade:
      'Ensina a reconhecer necessidades reais e diferenciar desejo de dependência.',
    conselho:
      'Trabalhe com o que está disponível e fortaleça sua disciplina.',
    alerta:
      'Não tente preencher uma falta interna com controle, consumo ou dependência.',
    tempo: 'lento, enquanto a restrição não for compreendida.',
    polaridade: 'desafiadora'
  },

  {
    numero: 11,
    id: 'isa',
    nome: 'Isa',
    simbolo: 'ᛁ',
    fonema: 'I',
    aett: 'Heimdall',
    elemento: 'Gelo',
    palavrasChave: [
      'pausa',
      'congelamento',
      'concentração',
      'espera',
      'silêncio',
      'autocontrole'
    ],
    essencia:
      'A imobilidade que preserva energia e impede movimentos precipitados.',
    significado:
      'Representa pausa, congelamento, concentração, espera e necessidade de não forçar acontecimentos.',
    luz:
      'foco, autocontrole, preservação, observação e capacidade de esperar.',
    sombra:
      'paralisação, frieza, isolamento, bloqueio e medo de agir.',
    invertida:
      'É simétrica; em posição desafiadora mostra estagnação ou resistência prolongada.',
    amor:
      'Indica afastamento, silêncio, frieza ou fase em que a relação não avança.',
    trabalho:
      'Mostra projeto parado, demora ou necessidade de revisão antes de prosseguir.',
    prosperidade:
      'Aconselha preservar recursos e evitar movimentações impulsivas.',
    espiritualidade:
      'Representa recolhimento e concentração da energia.',
    conselho:
      'Não force o movimento; use a pausa para compreender e preparar.',
    alerta:
      'A espera útil não deve virar medo permanente de agir.',
    tempo: 'indefinido enquanto a energia permanecer congelada.',
    polaridade: 'desafiadora'
  },

  {
    numero: 12,
    id: 'jera',
    nome: 'Jera',
    simbolo: 'ᛃ',
    fonema: 'J/Y',
    aett: 'Heimdall',
    elemento: 'Terra',
    palavrasChave: [
      'colheita',
      'ciclo',
      'resultado',
      'tempo',
      'recompensa',
      'maturação'
    ],
    essencia:
      'A colheita que chega como consequência do que foi cultivado ao longo do tempo.',
    significado:
      'Representa ciclos, colheita, recompensa, resultados graduais e o tempo necessário para amadurecer.',
    luz:
      'resultado, prosperidade gradual, justiça natural, recompensa e conclusão favorável.',
    sombra:
      'impaciência, repetição de padrões, demora e colheita de escolhas inadequadas.',
    invertida:
      'É geralmente simétrica; em posição desafiadora mostra atraso ou necessidade de mudar o cultivo.',
    amor:
      'Indica amadurecimento da relação e resultados construídos por atitudes constantes.',
    trabalho:
      'Mostra reconhecimento, conclusão de projeto e retorno pelo esforço realizado.',
    prosperidade:
      'É favorável para resultados graduais e sustentáveis.',
    espiritualidade:
      'Ensina que toda escolha gera consequências e ciclos.',
    conselho:
      'Continue cultivando com constância e respeite o tempo do processo.',
    alerta:
      'Não espere colher algo diferente mantendo exatamente o mesmo padrão.',
    tempo: 'cíclico, gradual e ligado à maturação.',
    polaridade: 'favorável'
  },

  {
    numero: 13,
    id: 'eihwaz',
    nome: 'Eihwaz',
    simbolo: 'ᛇ',
    fonema: 'EI',
    aett: 'Heimdall',
    elemento: 'Terra e Espírito',
    palavrasChave: [
      'resistência',
      'transformação',
      'proteção',
      'transição',
      'estrutura',
      'perseverança'
    ],
    essencia:
      'O eixo resistente que sustenta transformações profundas.',
    significado:
      'Representa resistência, proteção, transformação, transição e capacidade de atravessar mudanças sem perder o centro.',
    luz:
      'perseverança, estabilidade, defesa, amadurecimento e transformação consciente.',
    sombra:
      'rigidez, medo da mudança, tensão prolongada e apego ao controle.',
    invertida:
      'É geralmente considerada simétrica; em posição difícil alerta para resistência excessiva.',
    amor:
      'Mostra relação em transformação que exige maturidade, paciência e verdade.',
    trabalho:
      'Indica período de transição que pode fortalecer a carreira se houver estratégia.',
    prosperidade:
      'Pede estrutura, proteção e decisões voltadas ao longo prazo.',
    espiritualidade:
      'Representa proteção, passagem entre ciclos e fortalecimento interior.',
    conselho:
      'Mantenha o centro enquanto permite que a transformação aconteça.',
    alerta:
      'Não confunda resistência com obrigação de suportar indefinidamente.',
    tempo: 'lento e profundo.',
    polaridade: 'neutra'
  },

  {
    numero: 14,
    id: 'perthro',
    nome: 'Perthro',
    simbolo: 'ᛈ',
    fonema: 'P',
    aett: 'Heimdall',
    elemento: 'Água',
    palavrasChave: [
      'mistério',
      'possibilidade',
      'segredo',
      'destino',
      'revelação',
      'incerteza'
    ],
    essencia:
      'O mistério que contém possibilidades ainda não reveladas.',
    significado:
      'Representa mistério, segredos, possibilidade, destino em formação e informações que ainda não estão disponíveis.',
    luz:
      'descoberta, revelação, intuição, oportunidade inesperada e abertura para o desconhecido.',
    sombra:
      'ilusão, segredo prejudicial, risco, dependência da sorte e falta de informação.',
    invertida:
      'Pode indicar segredo mantido, revelação difícil, risco mal avaliado ou tentativa de controlar o desconhecido.',
    amor:
      'Indica sentimentos ocultos, relação reservada ou situação ainda indefinida.',
    trabalho:
      'Mostra oportunidade não revelada, informação confidencial ou cenário incerto.',
    prosperidade:
      'Pede cautela com apostas, riscos e promessas sem dados suficientes.',
    espiritualidade:
      'Representa mistério, intuição e aceitação de que nem tudo pode ser conhecido imediatamente.',
    conselho:
      'Observe, investigue e não force uma resposta antes do tempo.',
    alerta:
      'Não trate possibilidade como certeza.',
    tempo: 'indefinido, ligado à revelação.',
    polaridade: 'neutra'
  },

  {
    numero: 15,
    id: 'algiz',
    nome: 'Algiz',
    simbolo: 'ᛉ',
    fonema: 'Z/R',
    aett: 'Heimdall',
    elemento: 'Ar',
    palavrasChave: [
      'proteção',
      'defesa',
      'consciência',
      'limite',
      'vigilância',
      'apoio'
    ],
    essencia:
      'A postura consciente que protege sem impedir o contato com o mundo.',
    significado:
      'Representa proteção, alerta, defesa, conexão, apoio e necessidade de manter limites conscientes.',
    luz:
      'proteção, intuição, segurança, apoio, consciência e capacidade de evitar riscos.',
    sombra:
      'medo, defesa excessiva, paranoia, isolamento e sensação de ameaça constante.',
    invertida:
      'Pode indicar vulnerabilidade, limites enfraquecidos, exposição ou alerta ignorado.',
    amor:
      'Mostra necessidade de proteger limites emocionais e construir confiança com segurança.',
    trabalho:
      'Indica proteção de interesses, apoio e cautela diante de riscos.',
    prosperidade:
      'Aconselha preservar recursos, documentos e informações importantes.',
    espiritualidade:
      'É uma runa simbólica de proteção e consciência energética.',
    conselho:
      'Mantenha-se aberto, mas não abandone seus limites.',
    alerta:
      'Proteção não significa viver permanentemente em estado de medo.',
    tempo: 'atua enquanto o cuidado for mantido.',
    polaridade: 'favorável'
  },

  {
    numero: 16,
    id: 'sowilo',
    nome: 'Sowilo',
    simbolo: 'ᛊ',
    fonema: 'S',
    aett: 'Heimdall',
    elemento: 'Fogo',
    palavrasChave: [
      'sol',
      'sucesso',
      'clareza',
      'vitalidade',
      'vitória',
      'direção'
    ],
    essencia:
      'A luz que revela o caminho e fortalece a realização.',
    significado:
      'Representa sucesso, clareza, vitalidade, verdade, direção e força de realização.',
    luz:
      'vitória, energia, confiança, reconhecimento, clareza e expansão.',
    sombra:
      'orgulho, vaidade, excesso de atividade, autoritarismo e esgotamento.',
    invertida:
      'É simétrica; em posição desafiadora alerta para excesso de confiança ou desgaste.',
    amor:
      'É favorável para clareza, felicidade, atração e desenvolvimento positivo.',
    trabalho:
      'Mostra reconhecimento, sucesso, liderança e conclusão favorável.',
    prosperidade:
      'Favorece resultados, visibilidade e crescimento material.',
    espiritualidade:
      'Representa consciência, verdade e fortalecimento da energia.',
    conselho:
      'Avance com clareza e use sua força com humildade.',
    alerta:
      'Não deixe o orgulho ou a pressa consumir uma fase favorável.',
    tempo: 'rápido e favorável.',
    polaridade: 'favorável'
  },

  {
    numero: 17,
    id: 'tiwaz',
    nome: 'Tiwaz',
    simbolo: 'ᛏ',
    fonema: 'T',
    aett: 'Tyr',
    elemento: 'Ar e Fogo',
    palavrasChave: [
      'justiça',
      'coragem',
      'disciplina',
      'honra',
      'vitória',
      'sacrifício'
    ],
    essencia:
      'A coragem disciplinada que age por princípio e aceita responsabilidade.',
    significado:
      'Representa justiça, honra, coragem, disciplina, liderança e vitória conquistada por retidão.',
    luz:
      'integridade, decisão, coragem, justiça, estratégia e conquista.',
    sombra:
      'rigidez, conflito, autoritarismo, orgulho moral e sacrifício sem equilíbrio.',
    invertida:
      'Pode indicar injustiça, perda de direção, desânimo, conflito ou uso inadequado da autoridade.',
    amor:
      'Pede honestidade, posicionamento e responsabilidade nas escolhas afetivas.',
    trabalho:
      'Favorece liderança, competição justa, processos legais e decisões firmes.',
    prosperidade:
      'O resultado depende de disciplina, mérito e estratégia.',
    espiritualidade:
      'Representa compromisso com valores e responsabilidade pelo próprio caminho.',
    conselho:
      'Escolha a atitude correta mesmo quando ela exigir coragem.',
    alerta:
      'Não transforme convicção em rigidez ou desejo de vencer a qualquer preço.',
    tempo: 'moderado, ligado à ação disciplinada.',
    polaridade: 'favorável'
  },

  {
    numero: 18,
    id: 'berkano',
    nome: 'Berkano',
    simbolo: 'ᛒ',
    fonema: 'B',
    aett: 'Tyr',
    elemento: 'Terra',
    palavrasChave: [
      'nascimento',
      'crescimento',
      'cuidado',
      'cura',
      'renovação',
      'fertilidade'
    ],
    essencia:
      'O crescimento protegido que necessita cuidado e tempo.',
    significado:
      'Representa nascimento, crescimento, cuidado, renovação, fertilidade simbólica e desenvolvimento.',
    luz:
      'cura, proteção, acolhimento, criatividade, crescimento e novo ciclo.',
    sombra:
      'dependência, excesso de proteção, imaturidade, estagnação e dificuldade de deixar crescer.',
    invertida:
      'Pode indicar bloqueio de crescimento, conflito familiar, negligência ou projeto mal cuidado.',
    amor:
      'Favorece renovação, construção afetiva, cuidado e aprofundamento do vínculo.',
    trabalho:
      'Mostra projeto novo, aprendizado, desenvolvimento e crescimento gradual.',
    prosperidade:
      'Indica oportunidade que precisa ser cultivada com paciência.',
    espiritualidade:
      'Representa cura, renovação e acolhimento da própria vulnerabilidade.',
    conselho:
      'Cuide do que está nascendo sem tentar controlar cada etapa.',
    alerta:
      'Proteção excessiva também pode impedir o crescimento.',
    tempo: 'gradual, ligado a nascimento e desenvolvimento.',
    polaridade: 'favorável'
  },

  {
    numero: 19,
    id: 'ehwaz',
    nome: 'Ehwaz',
    simbolo: 'ᛖ',
    fonema: 'E',
    aett: 'Tyr',
    elemento: 'Terra e Ar',
    palavrasChave: [
      'movimento',
      'parceria',
      'confiança',
      'progresso',
      'mudança',
      'cooperação'
    ],
    essencia:
      'O movimento que acontece por confiança, cooperação e ritmo compartilhado.',
    significado:
      'Representa progresso, mudança, parceria, confiança e movimento coordenado.',
    luz:
      'avanço, cooperação, lealdade, adaptação e mudança favorável.',
    sombra:
      'desconfiança, instabilidade, dependência e falta de coordenação.',
    invertida:
      'Pode indicar atraso, parceria desequilibrada, resistência ou mudança mal planejada.',
    amor:
      'Mostra parceria, evolução conjunta e necessidade de confiança recíproca.',
    trabalho:
      'Favorece equipe, mudança de função, viagem e progresso por cooperação.',
    prosperidade:
      'O crescimento acontece por parceria e ação coordenada.',
    espiritualidade:
      'Representa alinhamento entre intenção e movimento.',
    conselho:
      'Avance com quem demonstra confiança por atitudes.',
    alerta:
      'Não entregue sua direção a uma parceria sem reciprocidade.',
    tempo: 'moderado e progressivo.',
    polaridade: 'favorável'
  },

  {
    numero: 20,
    id: 'mannaz',
    nome: 'Mannaz',
    simbolo: 'ᛗ',
    fonema: 'M',
    aett: 'Tyr',
    elemento: 'Ar',
    palavrasChave: [
      'humanidade',
      'identidade',
      'cooperação',
      'consciência',
      'comunidade',
      'autoconhecimento'
    ],
    essencia:
      'A consciência de si que se desenvolve por meio das relações humanas.',
    significado:
      'Representa identidade, humanidade, inteligência, relações, comunidade e autoconhecimento.',
    luz:
      'cooperação, consciência, apoio, inteligência, integração e desenvolvimento pessoal.',
    sombra:
      'ego, isolamento, dependência da opinião, comparação e perda de identidade.',
    invertida:
      'Pode indicar isolamento, conflito social, baixa autoestima ou dificuldade de pedir ajuda.',
    amor:
      'Pede maturidade, diálogo e preservação da identidade dentro da relação.',
    trabalho:
      'Favorece equipe, networking, estudo e desenvolvimento de competências.',
    prosperidade:
      'Mostra crescimento por colaboração, conhecimento e relações.',
    espiritualidade:
      'Representa autoconhecimento e compreensão da própria humanidade.',
    conselho:
      'Conheça a si mesmo sem se separar das pessoas.',
    alerta:
      'Não construa sua identidade apenas pela aprovação externa.',
    tempo: 'ligado à evolução das relações.',
    polaridade: 'neutra'
  },

  {
    numero: 21,
    id: 'laguz',
    nome: 'Laguz',
    simbolo: 'ᛚ',
    fonema: 'L',
    aett: 'Tyr',
    elemento: 'Água',
    palavrasChave: [
      'intuição',
      'fluxo',
      'emoção',
      'sensibilidade',
      'adaptação',
      'inconsciente'
    ],
    essencia:
      'O fluxo emocional e intuitivo que conduz sem possuir forma fixa.',
    significado:
      'Representa intuição, emoções, fluxo, sensibilidade, adaptação e conteúdos inconscientes.',
    luz:
      'intuição, criatividade, cura emocional, percepção e capacidade de fluir.',
    sombra:
      'confusão, ilusão, instabilidade emocional, fuga e excesso de sensibilidade.',
    invertida:
      'Pode indicar bloqueio intuitivo, medo, manipulação emocional ou perda de direção.',
    amor:
      'Mostra sentimentos profundos, vínculo emocional e necessidade de clareza afetiva.',
    trabalho:
      'Favorece criatividade e adaptação, mas pede cuidado com decisões puramente emocionais.',
    prosperidade:
      'A prosperidade depende de flexibilidade sem perda de organização.',
    espiritualidade:
      'Representa intuição, sonhos, sensibilidade e contato com o inconsciente.',
    conselho:
      'Escute sua sensibilidade, mas confirme percepções com a realidade.',
    alerta:
      'Não transforme medo, desejo ou ansiedade em certeza intuitiva.',
    tempo: 'fluido e variável.',
    polaridade: 'neutra'
  },

  {
    numero: 22,
    id: 'ingwaz',
    nome: 'Ingwaz',
    simbolo: 'ᛜ',
    fonema: 'NG',
    aett: 'Tyr',
    elemento: 'Terra',
    palavrasChave: [
      'gestação',
      'potencial',
      'conclusão',
      'fertilidade',
      'preparação',
      'energia interna'
    ],
    essencia:
      'A energia acumulada que amadurece internamente antes de se manifestar.',
    significado:
      'Representa potencial, gestação, preparação, conclusão interna e energia pronta para emergir.',
    luz:
      'fertilidade simbólica, amadurecimento, concentração, conclusão e novo começo.',
    sombra:
      'pressão acumulada, atraso, ansiedade, isolamento e dificuldade de liberar o potencial.',
    invertida:
      'É simétrica; em posição desafiadora mostra energia presa ou projeto que ainda não amadureceu.',
    amor:
      'Indica vínculo em amadurecimento, potencial de crescimento ou necessidade de intimidade segura.',
    trabalho:
      'Mostra projeto sendo preparado e resultado próximo após maturação.',
    prosperidade:
      'Favorece construção silenciosa e liberação futura de resultados.',
    espiritualidade:
      'Representa concentração de energia e transformação interior.',
    conselho:
      'Conclua a preparação antes de expor ou lançar o que está sendo criado.',
    alerta:
      'Não confunda silêncio de desenvolvimento com ausência de progresso.',
    tempo: 'próximo após um período de preparação.',
    polaridade: 'favorável'
  },

  {
    numero: 23,
    id: 'dagaz',
    nome: 'Dagaz',
    simbolo: 'ᛞ',
    fonema: 'D',
    aett: 'Tyr',
    elemento: 'Fogo e Ar',
    palavrasChave: [
      'despertar',
      'virada',
      'clareza',
      'transformação',
      'renovação',
      'avanço'
    ],
    essencia:
      'A passagem da escuridão para a luz e a mudança de estado da consciência.',
    significado:
      'Representa despertar, virada, clareza, transformação, renovação e mudança positiva de perspectiva.',
    luz:
      'avanço, entendimento, libertação, sucesso, esperança e renovação.',
    sombra:
      'resistência à mudança, excesso de expectativa e dificuldade de abandonar uma identidade antiga.',
    invertida:
      'É simétrica; em posição desafiadora mostra atraso no despertar ou resistência à evidência.',
    amor:
      'Indica transformação, reconciliação consciente ou clareza definitiva sobre a relação.',
    trabalho:
      'Mostra virada positiva, solução e mudança de fase profissional.',
    prosperidade:
      'Favorece transformação de estratégia e abertura de novas possibilidades.',
    espiritualidade:
      'Representa despertar, integração e compreensão profunda.',
    conselho:
      'Reconheça a mudança e aja de acordo com a nova realidade.',
    alerta:
      'Não tente voltar ao estado anterior apenas por medo do novo.',
    tempo: 'rápido, como uma virada de consciência.',
    polaridade: 'favorável'
  },

  {
    numero: 24,
    id: 'othala',
    nome: 'Othala',
    simbolo: 'ᛟ',
    fonema: 'O',
    aett: 'Tyr',
    elemento: 'Terra',
    palavrasChave: [
      'herança',
      'raízes',
      'lar',
      'ancestralidade',
      'patrimônio',
      'pertencimento'
    ],
    essencia:
      'A herança material e simbólica que liga a pessoa às suas raízes.',
    significado:
      'Representa lar, herança, ancestralidade, patrimônio, tradição e sentimento de pertencimento.',
    luz:
      'segurança, legado, proteção familiar, estabilidade e sabedoria ancestral.',
    sombra:
      'apego ao passado, rigidez familiar, exclusão, controle e repetição de padrões herdados.',
    invertida:
      'Pode indicar conflito familiar, perda, ruptura com raízes ou necessidade de abandonar uma herança prejudicial.',
    amor:
      'Mostra família, construção de lar, compromisso e influência de padrões familiares.',
    trabalho:
      'Favorece patrimônio, empresa familiar, estabilidade e construção de legado.',
    prosperidade:
      'É ligada a bens, patrimônio e segurança de longo prazo.',
    espiritualidade:
      'Representa ancestralidade, raízes e reconhecimento das heranças emocionais.',
    conselho:
      'Honre suas raízes sem repetir automaticamente todos os padrões herdados.',
    alerta:
      'Não permaneça preso ao passado apenas por lealdade familiar.',
    tempo: 'longo e ligado a ciclos familiares ou patrimoniais.',
    polaridade: 'favorável'
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

function gerarSemente(input: RunasInput): number {
  const nome = limparNome(input.fullName);
  const nascimento = String(input.birthDate || '').replace(/\D/g, '');
  const pergunta = normalizar(input.question || '');

  return (
    somaTexto(nome) * 3 +
    somaTexto(nascimento) * 5 +
    somaTexto(pergunta) * 11 +
    nome.length * 17
  );
}

function detectarTema(pergunta: string): TemaRunas {
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
      'dinheiro',
      'prosperidade',
      'riqueza',
      'financeiro',
      'venda',
      'negocio',
      'lucro'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'prosperidade';
  }

  if (
    [
      'espiritual',
      'energia',
      'guia',
      'mediunidade',
      'caminho espiritual',
      'missao'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'espiritualidade';
  }

  if (
    [
      'familia',
      'filho',
      'filha',
      'casa',
      'mae',
      'pai',
      'irmao'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'família';
  }

  if (
    [
      'protecao',
      'inveja',
      'perseguicao',
      'falsidade',
      'ameaca',
      'demanda'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'proteção';
  }

  if (
    [
      'saude',
      'corpo',
      'tratamento',
      'doenca',
      'cansaco',
      'bem estar'
    ].some((termo) => texto.includes(termo))
  ) {
    return 'saúde';
  }

  return 'geral';
}

function selecionarRuna(
  semente: number,
  deslocamento: number,
  usadas: Set<number>
): Runa {
  let indice =
    Math.abs(
      semente +
        deslocamento * deslocamento * 7 +
        deslocamento * 19
    ) % RUNAS.length;

  while (usadas.has(indice)) {
    indice = (indice + 1) % RUNAS.length;
  }

  usadas.add(indice);

  return RUNAS[indice];
}

function calcularInvertida(
  semente: number,
  deslocamento: number,
  runa: Runa
): boolean {
  const runasSimetricas = new Set([
    'gebo',
    'hagalaz',
    'nauthiz',
    'isa',
    'jera',
    'eihwaz',
    'sowilo',
    'ingwaz',
    'dagaz'
  ]);

  if (runasSimetricas.has(runa.id)) {
    return false;
  }

  return Math.abs(semente + deslocamento * 31) % 2 === 1;
}

function interpretarPorTema(
  runa: Runa,
  tema: TemaRunas,
  invertida: boolean
): string {
  if (invertida) {
    return runa.invertida;
  }

  switch (tema) {
    case 'amor':
      return runa.amor;

    case 'trabalho':
      return runa.trabalho;

    case 'prosperidade':
      return runa.prosperidade;

    case 'espiritualidade':
    case 'proteção':
      return runa.espiritualidade;

    case 'família':
      return `${runa.significado} No campo familiar, considere especialmente: ${runa.conselho}`;

    case 'saúde':
      return `${runa.significado} Em questões de saúde, esta interpretação é simbólica e não substitui avaliação profissional.`;

    default:
      return runa.significado;
  }
}

function criarPosicao(
  posicao: RunaSelecionada['posicao'],
  titulo: string,
  runa: Runa,
  invertida: boolean,
  tema: TemaRunas
): RunaSelecionada {
  return {
    posicao,
    titulo,
    runa,
    invertida,
    interpretacaoTematica: interpretarPorTema(
      runa,
      tema,
      invertida
    )
  };
}

function analisarFrequencias(
  runas: RunaSelecionada[]
): {
  runasFavoraveis: string[];
  runasDesafiadoras: string[];
  aettsPresentes: string[];
  elementosDominantes: string[];
  temasRepetidos: string[];
} {
  const runasFavoraveis = runas
    .filter(
      (item) =>
        !item.invertida &&
        item.runa.polaridade === 'favorável'
    )
    .map((item) => item.runa.nome);

  const runasDesafiadoras = runas
    .filter(
      (item) =>
        item.invertida ||
        item.runa.polaridade === 'desafiadora'
    )
    .map((item) =>
      item.invertida
        ? `${item.runa.nome} invertida`
        : item.runa.nome
    );

  const aettsPresentes = Array.from(
    new Set(runas.map((item) => item.runa.aett))
  );

  const elementos = new Map<string, number>();
  const temas = new Map<string, number>();

  for (const item of runas) {
    elementos.set(
      item.runa.elemento,
      (elementos.get(item.runa.elemento) || 0) + 1
    );

    for (const palavra of item.runa.palavrasChave) {
      temas.set(
        palavra,
        (temas.get(palavra) || 0) + 1
      );
    }
  }

  const elementosDominantes = Array.from(
    elementos.entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([elemento]) => elemento);

  const temasRepetidos = Array.from(temas.entries())
    .filter(([, quantidade]) => quantidade >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tema]) => tema);

  return {
    runasFavoraveis,
    runasDesafiadoras,
    aettsPresentes,
    elementosDominantes,
    temasRepetidos
  };
}

function construirDirecaoPrincipal(
  favoraveis: string[],
  desafiadoras: string[],
  conselho: RunaSelecionada
): string {
  const orientacao = conselho.invertida
    ? conselho.runa.invertida
    : conselho.runa.conselho;

  if (favoraveis.length > desafiadoras.length) {
    return `A leitura apresenta maior abertura para avanço. A direção principal vem de ${conselho.runa.nome}: ${orientacao}`;
  }

  if (desafiadoras.length > favoraveis.length) {
    return `A leitura mostra provas e ajustes importantes. Isso não determina fracasso. A orientação central vem de ${conselho.runa.nome}: ${orientacao}`;
  }

  return `A leitura equilibra oportunidades e desafios. A direção principal vem de ${conselho.runa.nome}: ${orientacao}`;
}

function formatarRuna(item: RunaSelecionada): string {
  const interpretacaoPrincipal = item.invertida
    ? item.runa.invertida
    : item.interpretacaoTematica;

  return `
═══════════════════════
${item.titulo.toUpperCase()}
═══════════════════════

Runa ${item.runa.numero}: ${item.runa.nome} ${item.runa.simbolo}

Posição:
${item.invertida ? 'Invertida' : 'Normal'}

Aett:
${item.runa.aett}

Elemento:
${item.runa.elemento}

Essência:
${item.runa.essencia}

Interpretação:
${interpretacaoPrincipal}

Significado:
${item.runa.significado}

Luz:
${item.runa.luz}

Sombra:
${item.runa.sombra}

Conselho:
${item.runa.conselho}

Alerta:
${item.runa.alerta}

Tempo de manifestação:
${item.runa.tempo}
`.trim();
}

export function buildRunasSupremas(
  input: RunasInput
): RunasResultado {
  const entrada = {
    fullName: String(input.fullName || '').trim(),
    birthDate: String(input.birthDate || '').trim(),
    question: String(input.question || '').trim()
  };

  const tema = detectarTema(entrada.question);
  const semente = gerarSemente(entrada);
  const usadas = new Set<number>();

  const construir = (
    posicao: RunaSelecionada['posicao'],
    titulo: string,
    deslocamento: number
  ): RunaSelecionada => {
    const runa = selecionarRuna(
      semente,
      deslocamento,
      usadas
    );

    const invertida = calcularInvertida(
      semente,
      deslocamento,
      runa
    );

    return criarPosicao(
      posicao,
      titulo,
      runa,
      invertida,
      tema
    );
  };

  const origem = construir(
    'origem',
    'Raiz da situação',
    3
  );

  const presente = construir(
    'presente',
    'Energia presente',
    7
  );

  const forca = construir(
    'forca',
    'Força disponível',
    11
  );

  const obstaculo = construir(
    'obstaculo',
    'Prova ou obstáculo',
    17
  );

  const caminho = construir(
    'caminho',
    'Caminho de evolução',
    23
  );

  const tendencia = construir(
    'tendencia',
    'Tendência do processo',
    29
  );

  const conselho = construir(
    'conselho',
    'Conselho final',
    37
  );

  const todas = [
    origem,
    presente,
    forca,
    obstaculo,
    caminho,
    tendencia,
    conselho
  ];

  const analise = analisarFrequencias(todas);

  const direcaoPrincipal = construirDirecaoPrincipal(
    analise.runasFavoraveis,
    analise.runasDesafiadoras,
    conselho
  );

  const resumoParaOraculo = `
RUNAS SUPREMAS

Método:
Círculo das Sete Runas

Tema detectado:
${tema}

${formatarRuna(origem)}

${formatarRuna(presente)}

${formatarRuna(forca)}

${formatarRuna(obstaculo)}

${formatarRuna(caminho)}

${formatarRuna(tendencia)}

${formatarRuna(conselho)}

═══════════════════════
SÍNTESE DA LEITURA
═══════════════════════

Runas favoráveis:
${
  analise.runasFavoraveis.length
    ? analise.runasFavoraveis.join(', ')
    : 'nenhuma predominância favorável isolada'
}

Runas desafiadoras:
${
  analise.runasDesafiadoras.length
    ? analise.runasDesafiadoras.join(', ')
    : 'nenhuma predominância desafiadora isolada'
}

Aetts presentes:
${analise.aettsPresentes.join(', ')}

Elementos dominantes:
${analise.elementosDominantes.join(', ')}

Temas repetidos:
${
  analise.temasRepetidos.length
    ? analise.temasRepetidos.join(', ')
    : 'sem repetição temática dominante'
}

Direção principal:
${direcaoPrincipal}

═══════════════════════
INSTRUÇÕES PARA O CONSULTOR
═══════════════════════

Interprete as runas conforme a identidade, personalidade,
linguagem, tom de voz e estilo do consultor selecionado.

Use a leitura como bastidor interno.

Não diga que sorteou, calculou ou selecionou runas.

Não apresente a resposta como relatório técnico.

Não trate as runas como sentenças imutáveis.

Cruze:

• a raiz da situação;
• a energia presente;
• a força disponível;
• o obstáculo;
• o caminho de evolução;
• a tendência;
• o conselho final.

Considere se a runa apareceu normal ou invertida.

Runas invertidas podem representar bloqueio, atraso,
interiorização, excesso ou dificuldade de expressar a energia.

Não interprete uma runa invertida automaticamente como desastre.

Considere os temas, elementos e padrões repetidos.

Dê maior peso à runa de conselho para a orientação prática.

A tendência mostra possibilidade e direção atual,
não garantia absoluta de acontecimento futuro.

Responda diretamente à pergunta.

Explique:

• qual é a raiz do problema;
• o que atua no presente;
• qual força pode ser usada;
• qual padrão dificulta;
• qual mudança favorece;
• qual tendência está se formando;
• qual atitude prática deve ser tomada.

Não apresente sentimentos ou intenções de terceiros como fatos comprovados.

Não prometa retorno, casamento, separação, traição,
riqueza, gravidez, cura ou qualquer resultado absoluto.

Preserve o livre-arbítrio e a responsabilidade do consulente.

A resposta deve ser firme, simbólica, profunda,
natural, clara e coerente com o consultor escolhido.
`.trim();

  return {
    oracle: 'runas',

    entrada,

    tema,

    metodo: {
      nome: 'Círculo das Sete Runas',
      quantidadeRunas: 7,
      descricao:
        'Leitura com raiz, presente, força, obstáculo, caminho, tendência e conselho.'
    },

    leitura: {
      origem,
      presente,
      forca,
      obstaculo,
      caminho,
      tendencia,
      conselho
    },

    sintese: {
      runasFavoraveis: analise.runasFavoraveis,
      runasDesafiadoras: analise.runasDesafiadoras,
      aettsPresentes: analise.aettsPresentes,
      elementosDominantes:
        analise.elementosDominantes,
      temasRepetidos: analise.temasRepetidos,
      direcaoPrincipal
    },

    resumoParaOraculo
  };
}

export const FUTHARK_ANTIGO = RUNAS;

export default buildRunasSupremas;