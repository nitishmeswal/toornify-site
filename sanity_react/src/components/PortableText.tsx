import { urlFor } from '@/lib/sanity-client';
import type { ReactNode } from 'react';

interface PortableTextProps {
  value: any[];
  className?: string;
}

/**
 * Portable Text Renderer for Sanity Content
 * Renders rich text content from Sanity CMS
 */
export function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value || !Array.isArray(value)) {
    return null;
  }

  const renderChildren = (children: any[]) => {
    return children?.map((child: any, childIndex: number) => {
      let text: any = child.text;

      if (child.marks && child.marks.length > 0) {
        child.marks.forEach((mark: string) => {
          if (mark === 'strong') {
            text = <strong key={childIndex}>{text}</strong>;
          } else if (mark === 'em') {
            text = <em key={childIndex}>{text}</em>;
          } else if (mark === 'underline') {
            text = <u key={childIndex}>{text}</u>;
          } else if (mark === 'code') {
            text = <code key={childIndex} className="bg-gray-800 px-1 py-0.5 rounded text-sm">{text}</code>;
          }
        });
      }

      return <span key={childIndex}>{text}</span>;
    });
  };

  const blocks: ReactNode[] = [];
  let currentList: { type: string; items: ReactNode[] } | null = null;

  const flushList = () => {
    if (!currentList) return;

    const ListTag = currentList.type === 'number' ? 'ol' : 'ul';
    const listClass = currentList.type === 'number' ? 'list-decimal' : 'list-disc';
    blocks.push(
      <ListTag key={`list-${blocks.length}`} className={`${listClass} pl-8 mb-4 space-y-2 text-gray-300`}>
        {currentList.items}
      </ListTag>
    );
    currentList = null;
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {(() => {
        value.forEach((block, index) => {
          if (block.listItem) {
            const children = renderChildren(block.children || []);
            const listItem = (
              <li key={`li-${index}`} className="leading-relaxed">
                {children}
              </li>
            );

            if (currentList && currentList.type === block.listItem) {
              currentList.items.push(listItem);
            } else {
              flushList();
              currentList = { type: block.listItem, items: [listItem] };
            }
            return;
          }

          flushList();

          if (block._type === 'block') {
            const children = renderChildren(block.children || []);

            switch (block.style) {
              case 'h1':
                blocks.push(
                  <h1 key={`h1-${index}`} className="text-4xl font-bold text-white mb-4">
                    {children}
                  </h1>
                );
                break;
              case 'h2':
                blocks.push(
                  <h2 key={`h2-${index}`} className="text-3xl font-bold text-white mb-3">
                    {children}
                  </h2>
                );
                break;
              case 'h3':
                blocks.push(
                  <h3 key={`h3-${index}`} className="text-2xl font-bold text-white mb-2">
                    {children}
                  </h3>
                );
                break;
              case 'h4':
                blocks.push(
                  <h4 key={`h4-${index}`} className="text-xl font-bold text-white mb-2">
                    {children}
                  </h4>
                );
                break;
              case 'blockquote':
                blocks.push(
                  <blockquote key={`quote-${index}`} className="border-l-4 border-purple-500 pl-4 italic text-gray-300 my-4">
                    {children}
                  </blockquote>
                );
                break;
              default:
                blocks.push(
                  <p key={`p-${index}`} className="text-gray-300 mb-4 leading-relaxed">
                    {children}
                  </p>
                );
                break;
            }
            return;
          }

          if (block._type === 'image') {
            const imageUrl = block.asset ? urlFor(block.asset).url() : '';
            blocks.push(
              <figure key={`img-${index}`} className="my-8">
                <img src={imageUrl} alt={block.alt || ''} className="w-full rounded-lg" />
                {block.caption && (
                  <figcaption className="text-sm text-gray-400 mt-2 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
            return;
          }

          if (block._type === 'code') {
            blocks.push(
              <pre key={`code-${index}`} className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4">
                <code className="text-sm text-gray-300">{block.code}</code>
              </pre>
            );
            return;
          }
        });
        flushList();
        return blocks;
      })()}
    </div>
  );
}

export default PortableText;
