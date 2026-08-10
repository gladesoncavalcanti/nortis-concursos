const DAY=86400000;
export function buildSuggestedStudyItems({profile,progress,weakSubjects=[],startDate=new Date()}){
 const minutes=Math.max(30,Math.min(profile?.daily_minutes??45,180));const short=Math.max(15,Math.round(minutes/2));const priorities=[];
 if(progress?.review?.length)priorities.push(['Revisar questões com erro',short]);
 if(weakSubjects.length)priorities.push([`Revisar: ${weakSubjects[0]}`,minutes]);
 else if(profile?.primary_difficulty==='redacao')priorities.push(['Praticar produção discursiva',minutes]);
 else if(profile?.primary_difficulty==='legislacao')priorities.push(['Revisar legislação prioritária',minutes]);
 else priorities.push(['Revisar conteúdo prioritário',minutes]);
 weakSubjects.slice(1,3).forEach((title)=>priorities.push([`Reforçar: ${title}`,minutes]));
 priorities.push(['Resolver questões do conteúdo estudado',minutes],['Revisar flashcards programados',short]);
 if((progress?.answered??0)>=5)priorities.push(['Realizar simulado e analisar o resultado',Math.min(180,minutes+30)]);
 return [...new Map(priorities.map(item=>[item[0],item])).values()].slice(0,5).map(([title,duration_minutes],index)=>({title,duration_minutes,scheduled_date:new Date(startDate.getTime()+index*DAY).toISOString().slice(0,10)}));
}
