export interface DrawnSymbol {
  name: string;
  category: string;
  meaning: string;
  imageUrl?: string;
  element?: string;
  keywords?: string[];
}

export const ORACLE_DRAW_DATA: Record<string, DrawnSymbol[]> = {
  tarot: [
    {
      name: 'O Louco (Arcano 0)',
      category: 'Tarot',
      meaning: 'Início de uma nova jornada, liberdade de espírito, espontaneidade e fé no desconhecido.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      keywords: ['Novo Ciclo', 'Inocência', 'Coragem', 'Salto Quântico'],
    },
    {
      name: 'O Mago (Arcano I)',
      category: 'Tarot',
      meaning: 'Manifestação de potenciais, força de vontade, recursos nas mãos e poder de criação.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=200',
      keywords: ['Criação', 'Foco', 'Recursos', 'Manifestação'],
    },
    {
      name: 'A Sacerdotisa (Arcano II)',
      category: 'Tarot',
      meaning: 'Intuição profunda, mistérios velados, paciência e sabedoria que vem do silêncio interior.',
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=200',
      keywords: ['Intuição', 'Mistério', 'Conhecimento Oculto', 'Silêncio'],
    },
    {
      name: 'A Imperatriz (Arcano III)',
      category: 'Tarot',
      meaning: 'Fertilidade, abundância criativa, nutrição maternal, beleza e expansão da vida.',
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=200',
      keywords: ['Fertilidade', 'Prosperidade', 'Sensualidade', 'Crescimento'],
    },
    {
      name: 'O Imperador (Arcano IV)',
      category: 'Tarot',
      meaning: 'Estrutura, estabilidade, autoridade sábia, liderança firme e poder de concretização.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      keywords: ['Estrutura', 'Ordem', 'Liderança', 'Solidez'],
    },
    {
      name: 'Os Enamorados (Arcano VI)',
      category: 'Tarot',
      meaning: 'Escolhas do coração, uniões sagradas, harmonia de valores e atração magnética.',
      imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=200',
      keywords: ['Amor', 'Aliança', 'Dilema do Coração', 'Harmonia'],
    },
    {
      name: 'A Roda da Fortuna (Arcano X)',
      category: 'Tarot',
      meaning: 'Mudanças benéficas de ciclo, destino em movimento, virada favorável e sorte.',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=200',
      keywords: ['Virada', 'Evolução', 'Sincronicidade', 'Destino'],
    },
    {
      name: 'A Estrela (Arcano XVII)',
      category: 'Tarot',
      meaning: 'Esperança renovada, cura espiritual, bênçãos cósmicas, luz e inspiração cristalina.',
      imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=200',
      keywords: ['Esperança', 'Cura', 'Inspiração', 'Luz'],
    },
    {
      name: 'O Sol (Arcano XIX)',
      category: 'Tarot',
      meaning: 'Clareza total, alegria transbordante, sucesso estrondoso, vitalidade e verdade.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=200',
      keywords: ['Sucesso', 'Iluminação', 'Vitória', 'Alegria'],
    },
    {
      name: 'O Mundo (Arcano XXI)',
      category: 'Tarot',
      meaning: 'Realização plena, coroação dos esforços, integração cósmica e vitória absoluta.',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      keywords: ['Plenitude', 'Conclusão', 'Triunfo', 'Totalidade'],
    },
  ],

  'baralho-cigano': [
    {
      name: '1. O Cavaleiro',
      category: 'Baralho Cigano',
      meaning: 'Notícias rápidas a caminho, ação vigorosa, mensagens esperadas e movimento de coragem.',
      keywords: ['Rapidez', 'Notícias', 'Concretização', 'Mensageiro'],
    },
    {
      name: '2. O Trevo',
      category: 'Baralho Cigano',
      meaning: 'Pequenos obstáculos transitórios superados com facilidade e sorte nas oportunidades.',
      keywords: ['Sorte Breve', 'Paciência', 'Superação', 'Oportunidade'],
    },
    {
      name: '3. O Navio',
      category: 'Baralho Cigano',
      meaning: 'Viagens, novos horizontes se abrindo, transição de ciclo e expansão financeira.',
      keywords: ['Viagem', 'Transição', 'Longo Prazo', 'Expansão'],
    },
    {
      name: '4. A Casa',
      category: 'Baralho Cigano',
      meaning: 'Estrutura familiar, porto seguro, aconchego, estabilidade emocional e raízes.',
      keywords: ['Família', 'Estabilidade', 'Lar', 'Segurança'],
    },
    {
      name: '9. O Buquê',
      category: 'Baralho Cigano',
      meaning: 'Presentes da vida, celebração de vitórias, reconhecimento social e harmonia amorosa.',
      keywords: ['Alegria', 'Celebração', 'Presente', 'Afeto'],
    },
    {
      name: '16. As Estrelas',
      category: 'Baralho Cigano',
      meaning: 'Proteção espiritual elevada, inspiração artística, clareza mental e bênçãos do destino.',
      keywords: ['Proteção Espiritual', 'Destino', 'Sucesso', 'Brilho'],
    },
    {
      name: '24. O Coração',
      category: 'Baralho Cigano',
      meaning: 'Amor verdadeiro, sentimentos puros, paixão sincera e generosidade emocional.',
      keywords: ['Amor Verdadeiro', 'Sentimento', 'Paixão', 'Acolhimento'],
    },
    {
      name: '25. O Anel',
      category: 'Baralho Cigano',
      meaning: 'Aliança sólida, união matrimonial, parcerias de sucesso e contratos duradouros.',
      keywords: ['Aliança', 'Compromisso', 'Sociedade', 'União'],
    },
    {
      name: '31. O Sol',
      category: 'Baralho Cigano',
      meaning: 'Energia vital no ápice, sucesso brilhante, prosperidade evidente e saúde vigorosa.',
      keywords: ['Vitória', 'Prosperidade', 'Energia Vital', 'Luz'],
    },
    {
      name: '33. A Chave',
      category: 'Baralho Cigano',
      meaning: 'Solução definitiva para os impasses, abertura de caminhos trancados e respostas claras.',
      keywords: ['Solução', 'Abertura de Caminhos', 'Destravamento', 'Certeza'],
    },
  ],

  cigano: [
    {
      name: '1. O Cavaleiro',
      category: 'Baralho Cigano',
      meaning: 'Notícias rápidas a caminho, ação vigorosa, mensagens esperadas e movimento de coragem.',
      keywords: ['Rapidez', 'Notícias', 'Concretização', 'Mensageiro'],
    },
    {
      name: '9. O Buquê',
      category: 'Baralho Cigano',
      meaning: 'Presentes da vida, celebração de vitórias, reconhecimento social e harmonia amorosa.',
      keywords: ['Alegria', 'Celebração', 'Presente', 'Afeto'],
    },
    {
      name: '16. As Estrelas',
      category: 'Baralho Cigano',
      meaning: 'Proteção espiritual elevada, inspiração artística, clareza mental e bênçãos do destino.',
      keywords: ['Proteção Espiritual', 'Destino', 'Sucesso', 'Brilho'],
    },
    {
      name: '24. O Coração',
      category: 'Baralho Cigano',
      meaning: 'Amor verdadeiro, sentimentos puros, paixão sincera e generosidade emocional.',
      keywords: ['Amor Verdadeiro', 'Sentimento', 'Paixão', 'Acolhimento'],
    },
    {
      name: '25. O Anel',
      category: 'Baralho Cigano',
      meaning: 'Aliança sólida, união matrimonial, parcerias de sucesso e contratos duradouros.',
      keywords: ['Aliança', 'Compromisso', 'Sociedade', 'União'],
    },
    {
      name: '31. O Sol',
      category: 'Baralho Cigano',
      meaning: 'Energia vital no ápice, sucesso brilhante, prosperidade evidente e saúde vigorosa.',
      keywords: ['Vitória', 'Prosperidade', 'Energia Vital', 'Luz'],
    },
    {
      name: '33. A Chave',
      category: 'Baralho Cigano',
      meaning: 'Solução definitiva para os impasses, abertura de caminhos trancados e respostas claras.',
      keywords: ['Solução', 'Abertura de Caminhos', 'Destravamento', 'Certeza'],
    },
  ],

  runas: [
    {
      name: 'Fehu (ᚠ)',
      category: 'Runas Nórdicas',
      meaning: 'Riqueza material e espiritual, abundância gerada pelo esforço e fluxo financeiro positivo.',
      keywords: ['Prosperidade', 'Abundância', 'Realização Material', 'Nutrição'],
    },
    {
      name: 'Ansuz (ᚨ)',
      category: 'Runas Nórdicas',
      meaning: 'A voz sagrada de Odin, comunicação inspirada, revelação profética e conselho de sábios.',
      keywords: ['Comunicação Divina', 'Sabedoria', 'Conselho', 'Inspiração'],
    },
    {
      name: 'Raidho (ᚱ)',
      category: 'Runas Nórdicas',
      meaning: 'A carruagem sagrada, jornada evolutiva, justiça cósmica e ordem nas decisões.',
      keywords: ['Viagem', 'Ritmo', 'Ordem', 'Direção Certa'],
    },
    {
      name: 'Gebo (ᚷ)',
      category: 'Runas Nórdicas',
      meaning: 'Dádiva dos deuses, reciprocidade no amor, alianças equilibradas e generosidade.',
      keywords: ['Presente', 'Reciprocidade', 'Aliança', 'Troca Justa'],
    },
    {
      name: 'Wunjo (ᚹ)',
      category: 'Runas Nórdicas',
      meaning: 'Alegria triunfante, harmonia interior, realização de desejos e paz com a comunidade.',
      keywords: ['Felicidade', 'Realização', 'Glória', 'Paz'],
    },
    {
      name: 'Algiz (ᛉ)',
      category: 'Runas Nórdicas',
      meaning: 'Escudo sagrado do alce, proteção divina inquebrável e conexão com os guardiões espirituais.',
      keywords: ['Proteção Invencível', 'Guarda Espiritual', 'Santuário', 'Defesa'],
    },
    {
      name: 'Sowilo (ᛋ)',
      category: 'Runas Nórdicas',
      meaning: 'A chama solar invicta, triunfo sobre as sombras, energia vital regeneradora e clareza.',
      keywords: ['Vitória Solar', 'Clareza', 'Poder Espiritual', 'Triunfo'],
    },
    {
      name: 'Dagaz (ᛞ)',
      category: 'Runas Nórdicas',
      meaning: 'O despertar da alvorada, iluminação súbita, transformação radical positiva e novo amanhecer.',
      keywords: ['Despertar', 'Novo Dia', 'Transmutação', 'Esperança'],
    },
  ],

  'i-ching': [
    {
      name: 'Hexagrama 1: Ch\'ien (O Criativo / Céu)',
      category: 'I Ching',
      meaning: 'A força primordial criativa do Céu. Perseverança nos objetivos e liderança magnética.',
      keywords: ['Poder Primordial', 'Ação Firme', 'Céu', 'Grandeza'],
    },
    {
      name: 'Hexagrama 2: K\'un (O Receptivo / Terra)',
      category: 'I Ching',
      meaning: 'A devoção nutritiva da Terra. Capacidade de acolher, sustentar e cooperar harmoniosamente.',
      keywords: ['Acolhimento', 'Nutrição', 'Paciência', 'Sustentação'],
    },
    {
      name: 'Hexagrama 11: T\'ai (A Paz / Prosperidade)',
      category: 'I Ching',
      meaning: 'Céu abaixo da Terra em comunhão perfeita. Época de florescimento, harmonia e fartura.',
      keywords: ['Paz Plena', 'União', 'Concordância', 'Prosperidade'],
    },
    {
      name: 'Hexagrama 24: Fu (O Retorno / O Ponto de Virada)',
      category: 'I Ching',
      meaning: 'A luz renasce no momento mais escuro. Retorno dos ciclos benéficos e regeneração.',
      keywords: ['Renascimento', 'Recomeço', 'Ciclo Positivo', 'Esperança'],
    },
    {
      name: 'Hexagrama 48: Ching (O Poço da Sabedoria)',
      category: 'I Ching',
      meaning: 'A fonte inesgotável de sabedoria espiritual que nutre a alma de todos sem se esgotar.',
      keywords: ['Fonte Espiritual', 'Nutrição Coletiva', 'Sabedoria', 'Profundidade'],
    },
  ],

  iching: [
    {
      name: 'Hexagrama 1: Ch\'ien (O Criativo / Céu)',
      category: 'I Ching',
      meaning: 'A força primordial criativa do Céu. Perseverança nos objetivos e liderança magnética.',
      keywords: ['Poder Primordial', 'Ação Firme', 'Céu', 'Grandeza'],
    },
    {
      name: 'Hexagrama 11: T\'ai (A Paz / Prosperidade)',
      category: 'I Ching',
      meaning: 'Céu abaixo da Terra em comunhão perfeita. Época de florescimento, harmonia e fartura.',
      keywords: ['Paz Plena', 'União', 'Concordância', 'Prosperidade'],
    },
    {
      name: 'Hexagrama 24: Fu (O Retorno)',
      category: 'I Ching',
      meaning: 'A luz renasce no momento mais escuro. Retorno dos ciclos benéficos e regeneração.',
      keywords: ['Renascimento', 'Recomeço', 'Ciclo Positivo', 'Esperança'],
    },
  ],

  buzios: [
    {
      name: 'Odú Obará (6 Búzios Abertos)',
      category: 'Búzios Sagrados',
      meaning: 'O caminho do ouro e da realeza. Obará traz fartura, brilho pessoal, prestígio e superação de dores.',
      keywords: ['Prosperidade Real', 'Ouro', 'Fartura', 'Reconhecimento'],
    },
    {
      name: 'Odú Ejionile (8 Búzios Abertos)',
      category: 'Búzios Sagrados',
      meaning: 'A bênção de Oxalá. Paz de espírito, vitória moral, justiça serena e clareza mental.',
      keywords: ['Paz de Oxalá', 'Vitória Moral', 'Equilíbrio', 'Pureza'],
    },
    {
      name: 'Odú Oxé (5 Búzios Abertos)',
      category: 'Búzios Sagrados',
      meaning: 'A vibração de Oxum. Doçura, atração afetiva, fertilidade, intuição e ouro nas mãos.',
      keywords: ['Amor e Doçura', 'Oxum', 'Fertilidade', 'Magnetismo'],
    },
    {
      name: 'Odú Etaogundá (3 Búzios Abertos)',
      category: 'Búzios Sagrados',
      meaning: 'A força guerreira de Ogum. Destemor, abertura de estradas difíceis e vitória nas batalhas.',
      keywords: ['Ogum', 'Abertura de Caminhos', 'Guerra Vencida', 'Coragem'],
    },
  ],

  ifa: [
    {
      name: 'Ejiogbe (O Grande Caminho da Luz)',
      category: 'Ifá e Odús',
      meaning: 'O primeiro Odú maior de Ifá. Luz ininterrupta, sabedoria sacerdotal, vida longa e realizações sublimes.',
      keywords: ['Luz Primordial', 'Supremacia Espiritual', 'Bênção Maior', 'Vida Longa'],
    },
    {
      name: 'Iwori Meji (A Visão Espiritual dos Mistérios)',
      category: 'Ifá e Odús',
      meaning: 'Abertura do terceiro olho e discernimento. Capacidade de enxergar além das aparências materiais.',
      keywords: ['Clarividência', 'Discernimento', 'Sabedoria Profunda', 'Alerta'],
    },
    {
      name: 'Obara Meji (O Senhor da Riqueza e da Generosidade)',
      category: 'Ifá e Odús',
      meaning: 'Manifestação de prosperidade quando há partilha justa e respeito aos ancestrais.',
      keywords: ['Abundância', 'Partilha', 'Fartura de Alimentos', 'Coroa'],
    },
  ],

  astrologia: [
    {
      name: 'Sol em Leão trígono Júpiter em Sagitário',
      category: 'Astrologia',
      meaning: 'Alinhamento cósmico de expansão, confiança radiante, prestígio e expansão de horizontes.',
      keywords: ['Expansão', 'Sorte Astral', 'Liderança Radiante', 'Otimismo'],
    },
    {
      name: 'Vênus em Touro na Casa 2 (Prosperidade e Afeto)',
      category: 'Astrologia',
      meaning: 'Atração magnética de estabilidade financeira, prazeres sensoriais elevados e vínculos duradouros.',
      keywords: ['Segurança Afetiva', 'Prosperidade Material', 'Harmonia', 'Sensualidade'],
    },
    {
      name: 'Mercúrio em Gêmeos em sextil com Marte em Áries',
      category: 'Astrologia',
      meaning: 'Mente afiada e ágil, tomada de decisão veloz, acordos vantajosos e coragem para comunicar.',
      keywords: ['Comunicação Brilhante', 'Agilidade Mental', 'Iniciativa', 'Acordos'],
    },
    {
      name: 'Lua em Câncer na Casa 4 (Proteção e Raízes)',
      category: 'Astrologia',
      meaning: 'Acolhimento da ancestralidade, cura das emoções do lar e nutrição interior acolhedora.',
      keywords: ['Sensibilidade', 'Lar Seguro', 'Cura Emocional', 'Intuição Maternal'],
    },
  ],

  numerologia: [
    {
      name: 'Vibração 1: O Pioneiro e Conquistador',
      category: 'Numerologia',
      meaning: 'Energia de liderança nata, pioneirismo, independência e coragem para fundar novos projetos.',
      keywords: ['Início', 'Independência', 'Liderança', 'Originalidade'],
    },
    {
      name: 'Vibração 3: A Expressão Criativa e Expansão',
      category: 'Numerologia',
      meaning: 'Brilho na comunicação, carisma contagiante, dons artísticos e otimismo que atrai alianças.',
      keywords: ['Carisma', 'Expressão', 'Criatividade', 'Alegria'],
    },
    {
      name: 'Vibração 8: O Poder Executivo e Prosperidade',
      category: 'Numerologia',
      meaning: 'Manifestação de grandes riquezas materiais, justiça nos negócios, autoridade e autorrealização.',
      keywords: ['Poder Material', 'Justiça', 'Conquista Financeira', 'Eficiência'],
    },
    {
      name: 'Número Mestre 11: A Iluminação e Canalização',
      category: 'Numerologia',
      meaning: 'Portal de alta vibração intuitiva, inspiração para guiar multidões e elevação de consciência.',
      keywords: ['Intuição Máxima', 'Canal Espiritual', 'Propósito Superior', 'Luz'],
    },
  ],

  cristais: [
    {
      name: 'Ametista Violeta Real',
      category: 'Cristais Sagrados',
      meaning: 'Transmutação de energias densas em frequências sutis, conexão com o chakra coronário e paz profunda.',
      keywords: ['Transmutação', 'Paz Espiritual', 'Intuição', 'Proteção Psíquica'],
    },
    {
      name: 'Quartzo Rosa do Amor Incondicional',
      category: 'Cristais Sagrados',
      meaning: 'Cura das feridas emocionais, magnetismo amoroso, autoaceitação e abertura do chakra cardíaco.',
      keywords: ['Amor Puro', 'Cura Emocional', 'Autoestima', 'Doçura'],
    },
    {
      name: 'Citrino Natural da Prosperidade Solar',
      category: 'Cristais Sagrados',
      meaning: 'Atração de riqueza, entusiasmo contagiante, foco mental cristalino e fortalecimento do plexo solar.',
      keywords: ['Abundância Solar', 'Sucesso', 'Vitalidade', 'Prosperidade'],
    },
    {
      name: 'Turmalina Negra de Proteção Ancestral',
      category: 'Cristais Sagrados',
      meaning: 'Escudo impenetrável contra inveja, mau-olhado e energias negativas, aterramento da consciência.',
      keywords: ['Proteção Máxima', 'Aterramento', 'Limpeza Energética', 'Segurança'],
    },
    {
      name: 'Lápis Lazúli dos Sacerdotes',
      category: 'Cristais Sagrados',
      meaning: 'Verdade interior, nobreza de espírito, ativação do terceiro olho e comunicação elevada.',
      keywords: ['Sabedoria Nobre', 'Visão Espiritual', 'Verdade', 'Clareza'],
    },
  ],

  mesaradionica: [
    {
      name: 'Emissão da Chama Trina e Pêndulo Cristalino',
      category: 'Mesa Radiônica',
      meaning: 'Equilíbrio das forças do Amor, Poder e Sabedoria divina na matriz quântica do consulente.',
      keywords: ['Harmonização Quântica', 'Chama Trina', 'Alinhamento Áurico', 'Equilíbrio'],
    },
    {
      name: 'Desbloqueio com Disco Solar e Tetragrammaton',
      category: 'Mesa Radiônica',
      meaning: 'Dissolução de miasmas, corte de laços deletérios e abertura dos portais de prosperidade.',
      keywords: ['Limpeza Profunda', 'Corte Energético', 'Proteção Cósmica', 'Abertura'],
    },
    {
      name: 'Ativação da Flor da Vida e Geometria Sagrada',
      category: 'Mesa Radiônica',
      meaning: 'Restauração da matriz energética original de saúde perfeita, plenitude e sincronicidades.',
      keywords: ['Matriz Original', 'Geometria Sagrada', 'Cura Quântica', 'Sincronicidade'],
    },
  ],

  'mesa-radionica': [
    {
      name: 'Emissão da Chama Trina e Pêndulo Cristalino',
      category: 'Mesa Radiônica',
      meaning: 'Equilíbrio das forças do Amor, Poder e Sabedoria divina na matriz quântica do consulente.',
      keywords: ['Harmonização Quântica', 'Chama Trina', 'Alinhamento Áurico', 'Equilíbrio'],
    },
    {
      name: 'Desbloqueio com Disco Solar e Tetragrammaton',
      category: 'Mesa Radiônica',
      meaning: 'Dissolução de miasmas, corte de laços deletérios e abertura dos portais de prosperidade.',
      keywords: ['Limpeza Profunda', 'Corte Energético', 'Proteção Cósmica', 'Abertura'],
    },
    {
      name: 'Ativação da Flor da Vida e Geometria Sagrada',
      category: 'Mesa Radiônica',
      meaning: 'Restauração da matriz energética original de saúde perfeita, plenitude e sincronicidades.',
      keywords: ['Matriz Original', 'Geometria Sagrada', 'Cura Quântica', 'Sincronicidade'],
    },
  ],
};

export function drawSymbolForOracle(oracleType: string): DrawnSymbol {
  const normalizedKey = String(oracleType || 'tarot').toLowerCase().replace(/\s+/g, '-');
  const pool = ORACLE_DRAW_DATA[normalizedKey] || ORACLE_DRAW_DATA.tarot;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
