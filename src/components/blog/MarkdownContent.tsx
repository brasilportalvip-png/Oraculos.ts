import React from 'react';
import { parseMarkdown, type Bloco, type Inline } from '../../utils/markdown';

function renderInline(lista: Inline[], chave = 'i'): React.ReactNode[] {
  return lista.map((n, i) => {
    const k = `${chave}-${i}`;
    if (n.tipo === 'texto') return <React.Fragment key={k}>{n.valor}</React.Fragment>;
    if (n.tipo === 'negrito') return <strong key={k} className="text-white font-semibold">{renderInline(n.filhos, k)}</strong>;
    if (n.tipo === 'italico') return <em key={k}>{renderInline(n.filhos, k)}</em>;
    const externo = n.href.startsWith('http');
    return (
      <a
        key={k}
        href={n.href}
        className="text-[#d4af37] underline underline-offset-4 hover:text-amber-300 font-semibold"
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {renderInline(n.filhos, k)}
      </a>
    );
  });
}

function renderBlocos(blocos: Bloco[], chave = 'b'): React.ReactNode[] {
  return blocos.map((b, i) => {
    const k = `${chave}-${i}`;
    switch (b.tipo) {
      case 'titulo': {
        const classes = {
          2: 'font-serif text-2xl text-white font-normal pt-2',
          3: 'font-serif text-xl text-[#d4af37] font-normal pt-1',
          4: 'text-base text-white font-semibold',
        } as const;
        const Tag = `h${b.nivel}` as 'h2' | 'h3' | 'h4';
        return <Tag key={k} className={classes[b.nivel]}>{renderInline(b.conteudo, k)}</Tag>;
      }
      case 'paragrafo':
        return <p key={k}>{renderInline(b.conteudo, k)}</p>;
      case 'lista': {
        const Tag = b.ordenada ? 'ol' : 'ul';
        return (
          <Tag key={k} className={`${b.ordenada ? 'list-decimal' : 'list-disc'} pl-6 space-y-1.5 marker:text-[#d4af37]`}>
            {b.itens.map((item, j) => (
              <li key={`${k}-${j}`}>{renderInline(item, `${k}-${j}`)}</li>
            ))}
          </Tag>
        );
      }
      case 'citacao':
        return (
          <blockquote key={k} className="p-5 rounded-2xl bg-amber-500/10 border border-[#d4af37]/40 space-y-3">
            {renderBlocos(b.blocos, k)}
          </blockquote>
        );
      case 'tabela':
        return (
          <div key={k} className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {b.cabecalho.map((c, j) => (
                    <th key={`${k}-h${j}`} className="border border-white/10 px-2 py-1.5 text-[#d4af37]">
                      {renderInline(c, `${k}-h${j}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.linhas.map((linha, j) => (
                  <tr key={`${k}-r${j}`}>
                    {linha.map((c, x) => (
                      <td key={`${k}-r${j}-${x}`} className="border border-white/10 px-2 py-1.5 text-center">
                        {renderInline(c, `${k}-r${j}-${x}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'separador':
        return <hr key={k} className="border-white/10" />;
      default:
        return null;
    }
  });
}

export const MarkdownContent: React.FC<{ markdown: string }> = ({ markdown }) => (
  <>{renderBlocos(parseMarkdown(markdown))}</>
);
