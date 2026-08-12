-- Normaliza os literais UTF-8 dos flashcards após a primeira aplicação.
-- Os títulos oficiais dos conteúdos permanecem os já cadastrados no edital.

update public.flashcard_decks deck
set title = 'Revisão — ' || specialty.title,
    description = 'Cartões baseados nos blocos oficiais da especialidade selecionada.'
from public.syllabus_nodes specialty
where specialty.id = deck.syllabus_node_id
  and specialty.node_type = 'specialty';

update public.flashcards card
set front_text = 'Quais pontos do edital devem ser revisados em “' || subject.title || '”?'
from public.flashcard_decks deck
join public.syllabus_nodes specialty
  on specialty.id = deck.syllabus_node_id
 and specialty.node_type = 'specialty'
join public.syllabus_nodes subject
  on subject.parent_id = specialty.id
 and subject.product_id = specialty.product_id
 and subject.node_type = 'subject'
where card.deck_id = deck.id
  and card.sort_order = subject.sort_order;
