const DAY=86400000;
export function buildSuggestedStudyItems({profile,progress,objectiveWeakSubjects=[],selfReportedWeakSubjects=[],startDate=new Date()}){
 const minutes=Math.max(30,Math.min(profile?.daily_minutes??45,180));const short=Math.max(15,Math.round(minutes/2));const priorities=[];
 if(progress?.review?.length)priorities.push(['Revisar questões com erro',short]);
 if(objectiveWeakSubjects.length)priorities.push([`Reforçar por desempenho: ${objectiveWeakSubjects[0]}`,minutes]);
 const objectiveSet=new Set(objectiveWeakSubjects);
 const perceived=selfReportedWeakSubjects.filter((title)=>!objectiveSet.has(title));
 if(perceived.length)priorities.push([`Revisar por autoavaliação: ${perceived[0]}`,minutes]);
 if(!objectiveWeakSubjects.length&&!perceived.length){
  if(profile?.primary_difficulty==='redacao')priorities.push(['Praticar produção discursiva',minutes]);
  else if(profile?.primary_difficulty==='legislacao')priorities.push(['Revisar legislação prioritária',minutes]);
  else priorities.push(['Revisar conteúdo prioritário',minutes]);
 }
 objectiveWeakSubjects.slice(1,3).forEach((title)=>priorities.push([`Reforçar por desempenho: ${title}`,minutes]));
 perceived.slice(1,3).forEach((title)=>priorities.push([`Revisar por autoavaliação: ${title}`,minutes]));
 priorities.push(['Resolver questões do conteúdo estudado',minutes],['Revisar flashcards programados',short]);
 if((progress?.answered??0)>=5)priorities.push(['Realizar simulado e analisar o resultado',Math.min(180,minutes+30)]);
 return [...new Map(priorities.map(item=>[item[0],item])).values()].slice(0,5).map(([title,duration_minutes],index)=>({title,duration_minutes,scheduled_date:new Date(startDate.getTime()+index*DAY).toISOString().slice(0,10)}));
}
