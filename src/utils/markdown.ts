/**
 * Markdown simples e seguro para os artigos do blog.
 * Gera blocos estruturados (sem HTML arbitrário) usados tanto pela tela React
 * quanto pelas páginas pré-renderizadas para os buscadores.
 */

export type Inline =
  | { tipo: 'texto'; valor: string }
  | { tipo: 'negrito'; filhos: Inline[] }
  | { tipo: 'italico'; filhos: Inline[] }
  | { tipo: 'link'; href: string; filhos: Inline[] };

export type Bloco =
  | { tipo: 'titulo'; nivel: 2 | 3 | 4; conteudo: Inline[] }
  | { tipo: 'paragrafo'; conteudo: Inline[] }
  | { tipo: 'lista'; ordenada: boolean; itens: Inline[][] }
  | { tipo: 'citacao'; blocos: Bloco[] }
  | { tipo: 'tabela'; cabecalho: Inline[][]; linhas: Inline[][][] }
  | { tipo: 'separador' };

export function linkSeguro(href: string): string | null {
  const h = String(href || '').trim();
  if (/^\/(?!\/)/.test(h)) return h;
  if (/^https:\/\/[^\s]+$/i.test(h)) return h;
  return null;
}

export function parseInline(texto: string): Inline[] {
  const resultado: Inline[] = [];
  let resto = String(texto || '');
  const re = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\(([^)\s]+)\))|(\*([^*]+)\*)/;
  while (resto) {
    const m = resto.match(re);
    if (!m || m.index === undefined) {
      resultado.push({ tipo: 'texto', valor: resto });
      break;
    }
    if (m.index > 0) resultado.push({ tipo: 'texto', valor: resto.slice(0, m.index) });
    if (m[1]) resultado.push({ tipo: 'negrito', filhos: parseInline(m[2]) });
    else if (m[3]) {
      const href = linkSeguro(m[5]);
      if (href) resultado.push({ tipo: 'link', href, filhos: parseInline(m[4]) });
      else resultado.push(...parseInline(m[4]));
    } else if (m[6]) resultado.push({ tipo: 'italico', filhos: parseInline(m[7]) });
    resto = resto.slice(m.index + m[0].length);
  }
  return resultado;
}

function celulas(linha: string): string[] {
  return linha
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function parseMarkdown(md: string): Bloco[] {
  const linhas = String(md || '').replace(/\r/g, '').split('\n');
  const blocos: Bloco[] = [];
  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i].trim();
    if (!linha) {
      i++;
      continue;
    }

    const titulo = linha.match(/^(#{1,4})\s+(.+)$/);
    if (titulo) {
      // O H1 da página já é o título do artigo: "#" vira H2.
      const nivel = Math.min(4, Math.max(2, titulo[1].length + (titulo[1].length === 1 ? 1 : 0))) as 2 | 3 | 4;
      blocos.push({ tipo: 'titulo', nivel, conteudo: parseInline(titulo[2]) });
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(linha)) {
      blocos.push({ tipo: 'separador' });
      i++;
      continue;
    }

    if (linha.startsWith('>')) {
      const conteudo: string[] = [];
      while (i < linhas.length && linhas[i].trim().startsWith('>')) {
        conteudo.push(linhas[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocos.push({ tipo: 'citacao', blocos: parseMarkdown(conteudo.join('\n')) });
      continue;
    }

    if (linha.startsWith('|') && i + 1 < linhas.length && /^\|?\s*:?-{2,}/.test(linhas[i + 1].trim())) {
      const cabecalho = celulas(linha).map(parseInline);
      i += 2;
      const corpo: Inline[][][] = [];
      while (i < linhas.length && linhas[i].trim().startsWith('|')) {
        corpo.push(celulas(linhas[i]).map(parseInline));
        i++;
      }
      blocos.push({ tipo: 'tabela', cabecalho, linhas: corpo });
      continue;
    }

    const itemLista = linha.match(/^([-*•]|\d+\.)\s+(.+)$/);
    if (itemLista) {
      const ordenada = /\d+\./.test(itemLista[1]);
      const itens: Inline[][] = [];
      while (i < linhas.length) {
        const m = linhas[i].trim().match(/^([-*•]|\d+\.)\s+(.+)$/);
        if (!m || /\d+\./.test(m[1]) !== ordenada) break;
        itens.push(parseInline(m[2]));
        i++;
      }
      blocos.push({ tipo: 'lista', ordenada, itens });
      continue;
    }

    const paragrafo: string[] = [];
    while (
      i < linhas.length &&
      linhas[i].trim() &&
      !/^(#{1,4}\s|>|\||([-*•]|\d+\.)\s|-{3,}$)/.test(linhas[i].trim())
    ) {
      paragrafo.push(linhas[i].trim());
      i++;
    }
    blocos.push({ tipo: 'paragrafo', conteudo: parseInline(paragrafo.join(' ')) });
  }

  return blocos;
}

// ---------------------------------------------------------------------------
// HTML (para as páginas pré-renderizadas)
// ---------------------------------------------------------------------------

export function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function inlineParaHtml(lista: Inline[]): string {
  return lista
    .map((n) => {
      if (n.tipo === 'texto') return escaparHtml(n.valor);
      if (n.tipo === 'negrito') return `<strong>${inlineParaHtml(n.filhos)}</strong>`;
      if (n.tipo === 'italico') return `<em>${inlineParaHtml(n.filhos)}</em>`;
      return `<a href="${escaparHtml(n.href)}">${inlineParaHtml(n.filhos)}</a>`;
    })
    .join('');
}

export function blocosParaHtml(blocos: Bloco[]): string {
  return blocos
    .map((b) => {
      switch (b.tipo) {
        case 'titulo':
          return `<h${b.nivel}>${inlineParaHtml(b.conteudo)}</h${b.nivel}>`;
        case 'paragrafo':
          return `<p>${inlineParaHtml(b.conteudo)}</p>`;
        case 'lista': {
          const tag = b.ordenada ? 'ol' : 'ul';
          return `<${tag}>${b.itens.map((it) => `<li>${inlineParaHtml(it)}</li>`).join('')}</${tag}>`;
        }
        case 'citacao':
          return `<blockquote>${blocosParaHtml(b.blocos)}</blockquote>`;
        case 'tabela':
          return `<table><thead><tr>${b.cabecalho.map((c) => `<th>${inlineParaHtml(c)}</th>`).join('')}</tr></thead><tbody>${b.linhas
            .map((l) => `<tr>${l.map((c) => `<td>${inlineParaHtml(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`;
        case 'separador':
          return '<hr>';
        default:
          return '';
      }
    })
    .join('\n');
}

export function markdownParaHtml(md: string): string {
  return blocosParaHtml(parseMarkdown(md));
}
