import { supabase } from '@/lib/supabase';

export async function getMyFlashcards(){
  const [{data:decks,error:deckError},{data:progress,error:progressError}]=await Promise.all([
    supabase.from('flashcard_decks').select('id,title,description,sort_order,flashcards(id,front_text,back_text,sort_order)').order('sort_order'),
    supabase.from('flashcard_progress').select('flashcard_id,repetitions,next_review_at')
  ]);
  if(deckError||progressError)return{data:[],error:'Não foi possível carregar os flashcards agora.'};
  const byCard=new Map((progress??[]).map(item=>[item.flashcard_id,item]));
  return{data:(decks??[]).map(deck=>({...deck,flashcards:[...(deck.flashcards??[])].sort((a,b)=>a.sort_order-b.sort_order).map(card=>({...card,progress:byCard.get(card.id)??null}))})),error:null};
}
export async function reviewFlashcard(id,rating){const{data,error}=await supabase.rpc('review_flashcard',{p_flashcard_id:id,p_rating:rating});return error?{data:null,error:'Não foi possível salvar a revisão.'}:{data:data?.[0],error:null};}
