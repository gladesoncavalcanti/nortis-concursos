export function buildTutorGuidance(progress,intent){
 if(!progress||progress.answered===0)return'Comece pelo banco de questões para gerar seu primeiro diagnóstico. Depois de algumas respostas, consigo orientar sua revisão com base em evidências.';
 if(intent==='review')return progress.review.length>0?`Você tem ${progress.review.length} ${progress.review.length===1?'questão':'questões'} para revisar. Retome primeiro os erros mais recentes e confirme o aprendizado com uma nova tentativa.`:'Sua fila de erros está vazia. Use os flashcards ou faça novas questões para manter a revisão ativa.';
 if(intent==='performance')return`Você respondeu ${progress.answered} questões, com ${progress.accuracy}% de acerto, e concluiu ${progress.completedSimulations} ${progress.completedSimulations===1?'simulado':'simulados'}. Sua sequência atual é de ${progress.streak} ${progress.streak===1?'dia':'dias'}.`;
 if(progress.review.length>0)return`Prioridade de hoje: revise as ${progress.review.length} questões que ainda estão pendentes. Em seguida, faça um bloco curto de novas questões e registre a próxima sessão no plano de estudos.`;
 if(progress.completedSimulations===0&&progress.answered>=5)return'Você já possui prática suficiente para um primeiro simulado. Reserve um bloco no plano de estudos e use o resultado para definir a próxima revisão.';
 return'Mantenha uma sessão curta e objetiva: novas questões, revisão dos flashcards programados e registro da próxima tarefa no plano de estudos.';
}
