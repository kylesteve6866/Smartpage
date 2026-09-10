interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const assetTags = new Set(['a', 'img', 'source', 'video', 'audio']);

export default function rehypeBaseAssets(options: { base: string }) {
  const normalizedBase = options.base === '/' ? '' : `/${options.base.replace(/^\/+|\/+$/g, '')}`;
  return (tree: HastNode) => {
    if (!normalizedBase) return;
    const visit = (node: HastNode) => {
      if (node.type === 'element' && node.tagName && assetTags.has(node.tagName) && node.properties) {
        for (const key of ['src', 'href', 'poster']) {
          const value = node.properties[key];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith(`${normalizedBase}/`)) {
            node.properties[key] = `${normalizedBase}${value}`;
          }
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
