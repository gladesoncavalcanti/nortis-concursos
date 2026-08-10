import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, ChevronLeft, Loader2, RotateCcw } from 'lucide-react';
import { getMyProgress } from '@/api/progress.js';

const ProgressPage=()=>{
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null);
  useEffect(()=>{let mounted=true;getMyProgress().then(({data:d,error:e})=>{if(mounted){setData(d);setError(e);setLoading(false);}});return()=>{mounted=false;};},[]);
  const cards=data?[['Questões respondidas',data.answered],['Taxa de acerto',`${data.accuracy}%`],['Simulados concluídos',data.completedSimulations]]:[];
  return <><Helmet><title>Progresso e revisão - NORTIS CONCURSOS</title></Helmet><div className="min-h-screen bg-background py-12"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline"><ChevronLeft className="mr-1 h-4 w-4"/>Central Nortis</Link>
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p><h1 className="mt-2 text-3xl font-bold">Progresso e revisão</h1><p className="mt-3 text-muted-foreground">Indicadores calculados a partir das suas atividades reais.</p>
    {loading?<Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin"/>:error?<p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground">{error}</p>:<>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">{cards.map(([label,value])=><div key={label} className="rounded-2xl bg-card p-6"><BarChart3 className="mb-3 h-6 w-6 text-[hsl(var(--accent))]"/><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div>
      <section className="mt-8 rounded-2xl bg-card p-6"><div className="flex items-center gap-3"><RotateCcw className="h-6 w-6 text-[hsl(var(--accent))]"/><h2 className="text-xl font-bold">Revisar agora</h2></div>
        {data.review.length===0?<div className="mt-6 text-center"><CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-emerald-600"/><p className="text-sm text-muted-foreground">Nenhuma questão pendente de revisão.</p></div>:<ul className="mt-5 space-y-3">{data.review.map(item=><li key={item.question_id} className="rounded-xl bg-muted p-4"><p className="font-medium">{item.questions?.statement||'Questão para revisão'}</p>{item.questions?.syllabus_nodes?.title&&<p className="mt-1 text-xs text-muted-foreground">{item.questions.syllabus_nodes.title}</p>}</li>)}</ul>}
      </section></>}
  </div></div></>;
};
export default ProgressPage;
