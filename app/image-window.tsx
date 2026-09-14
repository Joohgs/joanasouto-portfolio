'use client';
import {useCallback,useLayoutEffect,useEffect,useRef,useState} from 'react';
import {animateWindow,windowOffset} from './window-animation';
import {ImageIcon,Folder,Minus,X} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {ProjectDetails} from './project-explorer';
import type {ImageWindow as WindowState} from './window-state';
export function ImageWindow({window,lang,rank,active,onClose,onMinimize,onActivate,onImage}:{onImage?:(index:number)=>void;window:WindowState;lang:'pt'|'en';rank:number;active:boolean;onClose:()=>void;onMinimize:()=>void;onActivate:()=>void}){
 const [shown,setShown]=useState(!window.minimized);
 const element=useRef<HTMLDivElement|null>(null),animation=useRef<Animation|null>(null),phase=useRef<'open'|'minimize'|null>(null);
 const run=useCallback((node:HTMLDivElement,direction:'open'|'minimize')=>{
  if(animation.current){animation.current.onfinish=null;animation.current.cancel()}
  phase.current=direction;
  const target=document.querySelector(`[data-image-task="${CSS.escape(window.id)}"]`);
  const next=animateWindow(node,direction,windowOffset(node,target));animation.current=next;
  const finish=()=>{phase.current=null;if(direction==='minimize')setShown(false)};
  if(next)next.onfinish=finish;else finish();
 },[window.id]);
 const attach=useCallback((node:HTMLDivElement|null)=>{element.current=node;if(node)run(node,'open')},[run]);
 useLayoutEffect(()=>{
  if(window.minimized){if(element.current)run(element.current,'minimize');else setShown(false)}
  else if(!shown)setShown(true);
  else if(element.current&&phase.current==='minimize')run(element.current,'open');
 },[window.minimized,run]);
 useEffect(()=>()=>{animation.current?.cancel()},[]);

 return <Dialog modal={false} open={shown} onOpenChange={open=>{if(!open)onClose()}}><DialogContent ref={attach} showCloseButton={false} onCloseAutoFocus={event=>event.preventDefault()} onInteractOutside={event=>event.preventDefault()} onPointerDownCapture={onActivate} onFocusCapture={onActivate} className={`animate-none! transition-none! flex! w-[calc(100%-2rem)] max-w-4xl! max-h-[calc(100dvh-8rem)] flex-col gap-0 rounded-none border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] p-1 shadow-[6px_8px_0_#081d5055] ${['z-50!','z-60!','z-70!','z-80!','z-90!','z-100!'][Math.max(0,Math.min(rank,5))]}`}>
 <div className={`flex h-9 shrink-0 items-center justify-between gap-3 px-2 text-sm text-white ${active?'bg-linear-to-r from-[#000080] to-[#2859a8]':'bg-[#747b8a]'}`}><DialogTitle className="flex min-w-0 items-center gap-2 text-sm">{window.projectIndex!==undefined?<Folder size={17} fill="#f6d279" className="shrink-0"/>:<ImageIcon size={17} className="shrink-0"/>}<span className="truncate">{window.title}</span></DialogTitle><div className="flex gap-1"><button aria-label={lang==='pt'?'Minimizar janela':'Minimize window'} onClick={onMinimize} className="flex size-6 items-center justify-center border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] text-black"><Minus size={14}/></button><button aria-label={lang==='pt'?'Fechar janela':'Close window'} onClick={onClose} className="flex size-6 items-center justify-center border-2 border-t-white border-l-white border-r-[#444] border-b-[#444] bg-[#c7c7c7] text-black"><X size={14}/></button></div></div>
 <div className={`min-h-0 flex-1 overflow-auto overscroll-contain ${window.projectIndex!==undefined?'bg-[#f4f3ef]':'bg-[#14224b] p-3'}`}>
 {window.projectIndex!==undefined?<ProjectDetails index={window.projectIndex} lang={lang} onImage={index=>onImage?.(index)}/>:<img src={window.src} alt={window.alt} className="mx-auto max-h-[calc(100dvh-15rem)] w-full object-contain [image-rendering:pixelated]"/>}
 </div><DialogDescription className="px-2 py-2 text-xs text-[#515667]">{window.projectIndex!==undefined?(lang==='pt'?'Detalhes do projeto':'Project details'):(lang==='pt'?'Visualização ampliada · ilustração conceitual':'Enlarged view · conceptual illustration')}</DialogDescription>
 </DialogContent></Dialog>
}
