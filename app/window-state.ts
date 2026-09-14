export type ImageWindow = {id:string;src:string;title:string;alt:string;minimized:boolean;order:number;projectIndex?:number};
export type WindowAction = {type:'open';window:Omit<ImageWindow,'minimized'|'order'>}|{type:'close'|'minimize'|'activate'|'toggle';id:string}|{type:'minimize-all'};
export function imageWindowReducer(windows:ImageWindow[],action:WindowAction):ImageWindow[]{
 const order=Math.max(0,...windows.map(window=>window.order))+1;
 if(action.type==='open'){
  const existing=windows.find(window=>window.id===action.window.id);
  return existing?windows.map(window=>window.id===existing.id?{...window,minimized:false,order}:window):[...windows,{...action.window,minimized:false,order}];
 }
 if(action.type==='close')return windows.filter(window=>window.id!==action.id);
 if(action.type==='minimize-all')return windows.map(window=>({...window,minimized:true}));
 const active=windows.filter(window=>!window.minimized).sort((a,b)=>b.order-a.order)[0];
 if(action.type==='activate'&&active?.id===action.id)return windows;
 return windows.map(window=>window.id!==action.id?window:{...window,minimized:action.type==='minimize'||(action.type==='toggle'&&active?.id===window.id),order});
}
