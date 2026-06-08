"use client";

import { useEffect, useRef } from "react";

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = "" }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderLatex = async () => {
      const katex = (await import("katex")).default;

      // Load KaTeX CSS if not already loaded
      if (!document.querySelector('link[href*="katex"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
        document.head.appendChild(link);
      }

      let processed = content;

      // Convert markdown headings
      processed = processed.replace(/^### (.+)$/gm, '<h3>$1</h3>');
      processed = processed.replace(/^## (.+)$/gm, '<h2>$1</h2>');
      processed = processed.replace(/^# (.+)$/gm, '<h1>$1</h1>');

      // Convert bold and italic
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

      // Convert blockquotes
      processed = processed.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

      // Convert tables (simple)
      processed = processed.replace(
        /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g,
        (match, header, rows) => {
          const headers = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('');
          const rowsHtml = rows.trim().split('\n').map((row: string) => {
            const cells = row.split('|').filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
          }).join('');
          return `<table><thead><tr>${headers}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
        }
      );

      // Convert newlines to paragraphs (but not inside HTML tags)
      const paragraphs = processed.split('\n\n').map(block => {
        if (block.trim().startsWith('<')) return block;
        return `<p>${block.trim()}</p>`;
      }).join('\n');

      containerRef.current!.innerHTML = paragraphs;

      // Now render LaTeX in the container
      const elements = containerRef.current!.childNodes;
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) return;
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          Array.from(el.childNodes).forEach(processNode);
        }
      };

      // Process display math $$...$$
      const renderMath = (html: string) => {
        // Display math
        html = html.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
          try {
            return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
          } catch {
            return `<span class="text-red-500">[LaTeX Error]</span>`;
          }
        });
        // Inline math $...$
        html = html.replace(/\$([^$\n]+)\$/g, (_, math) => {
          try {
            return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
          } catch {
            return `<span class="text-red-500">[LaTeX Error]</span>`;
          }
        });
        return html;
      };

      containerRef.current!.innerHTML = renderMath(paragraphs);
    };

    renderLatex();
  }, [content]);

  return <div ref={containerRef} className={`math-content ${className}`} />;
}
