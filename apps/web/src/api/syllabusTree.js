const NODE_TYPE_LABELS = {
  position: 'Cargo',
  specialty: 'Especialidade',
  subject: 'Disciplina',
  topic: 'Tópico',
};

export function buildSyllabusTree(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, { ...node, children: [] }]));
  const roots = [];

  byId.forEach((node) => {
    const parent = node.parent_id ? byId.get(node.parent_id) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const sortNodes = (items) => {
    items.sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title, 'pt-BR'));
    items.forEach((item) => sortNodes(item.children));
    return items;
  };

  return sortNodes(roots);
}

export function getSyllabusNodeTypeLabel(nodeType) {
  return NODE_TYPE_LABELS[nodeType] ?? 'Conteúdo';
}
