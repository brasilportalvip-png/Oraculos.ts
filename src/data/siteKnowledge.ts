/**
 * ORACULOS.TS — O que todo atendente sabe sobre o site
 *
 * Os atendentes conhecem o site de ponta a ponta para tirar qualquer dúvida
 * do consulente sem sair do personagem: minutos, pacotes, bônus, pagamento,
 * reembolso, painel, segurança, suporte e como funciona a leitura.
 */

export interface PacoteResumo {
  title: string;
  priceBrl: number;
  minutes: number;
  bonusMinutes?: number;
  active?: boolean;
}

export interface AtendenteResumo {
  name: string;
  pricePerMinute?: number;
  authorizedOracles?: string[];
}

function moeda(valor: number): string {
  return `R$ ${Number(valor || 0).toFixed(2).replace('.', ',')}`;
}

export function formatarConhecimentoDoSite(pacotes: PacoteResumo[], atendente: AtendenteResumo): string {
  const ativos = (pacotes || []).filter((p) => p && p.active !== false && Number(p.priceBrl) > 0);
  const listaPacotes = ativos.length
    ? ativos
        .map((p) => {
          const bonus = Number(p.bonusMinutes || 0);
          return `   • ${p.title}: ${moeda(p.priceBrl)} = ${p.minutes} min${bonus > 0 ? ` + ${bonus} min de bônus` : ''}`;
        })
        .join('\n')
    : '   • Pacotes a partir de R$ 5,00 (veja o botão "+" ao lado do saldo, no topo do site).';

  const consumo = Number(atendente.pricePerMinute || 0);

  return `O QUE VOCÊ SABE SOBRE O ORACULOS.TS (responda dúvidas do site com segurança, do seu jeito, e volte para a consulta)
1. COMO FUNCIONA: a pessoa se cadastra com nome completo de solteiro(a) e data de nascimento (hora de nascimento é opcional). Esses dados natal são a base de toda leitura. Depois escolhe um oraculista, compra minutos e conversa por chat ou vídeo.
2. MINUTOS E PACOTES (pagamento pelo Mercado Pago, com Pix ou cartão; os minutos entram assim que o pagamento é aprovado):
${listaPacotes}
3. SEU ATENDIMENTO: ${consumo > 0 ? `cada minuto com você consome ${consumo.toFixed(2).replace('.', ',')} min do saldo` : 'o consumo por minuto aparece no seu perfil'}. O tempo só conta depois que a consulta começa; ela encerra sozinha quando o saldo acaba, e a pessoa pode encerrar quando quiser. Seus oráculos: ${(atendente.authorizedOracles || []).join(', ') || 'os do seu perfil'}.
4. SALDO E RECARGA: o saldo aparece no topo do site; o botão "+" ao lado abre a recarga. Cupons de bônus são digitados na tela de recarga e valem uma vez por pessoa.
5. PAINEL DO CLIENTE ("Minha conta", em /painel): saldo, histórico de consultas e de recargas, dados de cadastro e foto.
6. REEMBOLSO: até 7 dias após a compra para minutos não usados (Código de Defesa do Consumidor), pelo formulário de suporte em /ajuda-e-privacidade, informando o e-mail ou o ID da compra. Política completa em /reembolso.
7. PRIVACIDADE E SEGURANÇA: consultas sigilosas, dados protegidos pela LGPD (detalhes em /privacidade e /termos). Nunca peça senha, número de cartão ou documento — o pagamento é sempre pelo Mercado Pago.
8. PERGUNTAS SOBRE OUTRAS PESSOAS: basta informar nome completo e data de nascimento da pessoa (sócio, chefe, filho, amor, funcionária...).
9. PERGUNTAS COM DATA: a pessoa pode perguntar por "amanhã", "daqui 4 dias", "sexta-feira" ou uma data — você sabe exatamente que dia é.
10. OUTROS CAMINHOS: conhecer todos os oráculos em /oraculos, outros oraculistas em /especialistas, artigos no /blog, como funciona em /como-funciona, e quem quer atender pelo site se inscreve em /trabalhe-conosco.
Se a pessoa estiver com dúvida de pagamento ou problema técnico que você não consegue resolver, oriente com carinho a falar com o suporte em /ajuda-e-privacidade — sem inventar informações.`;
}
