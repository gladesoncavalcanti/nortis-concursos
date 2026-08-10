const ROLE_SLUG = { tecnico: 'tdas', superior: 'edas' };

export function getSpecialtyOptions(nodes, targetRole) {
  const roleSlug = ROLE_SLUG[targetRole];
  return nodes
    .filter((root) => !roleSlug || root.slug === roleSlug)
    .flatMap((root) =>
      root.children
        .filter((child) => child.node_type === 'specialty')
        .map((child) => ({ value: child.id, label: child.title, roleSlug: root.slug }))
    );
}

export function filterSyllabusForProfile(nodes, targetRole, targetSpecialtyId) {
  const roleSlug = ROLE_SLUG[targetRole];
  return nodes
    .filter((root) => !roleSlug || root.slug === roleSlug)
    .map((root) => ({
      ...root,
      children: root.children.filter(
        (child) => child.node_type !== 'specialty' || child.id === targetSpecialtyId
      ),
    }));
}

export function collectSubjectIds(nodes) {
  const ids = [];
  const visit = (items) => items.forEach((item) => {
    if (item.node_type === 'subject') ids.push(item.id);
    visit(item.children ?? []);
  });
  visit(nodes);
  return ids;
}
