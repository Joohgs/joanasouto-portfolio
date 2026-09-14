export type WindowOffset={x:number;y:number};
export function windowOffset(element:HTMLElement,target:Element|null|undefined):WindowOffset{
 const rect=element.getBoundingClientRect(),button=target?.getBoundingClientRect();
 return {x:button?button.x+button.width/2-(rect.x+rect.width/2):0,y:button?button.y+button.height/2-(rect.y+rect.height/2):60};
}
export function animateWindow(element:HTMLElement,direction:'open'|'minimize',offset:WindowOffset):Animation|null{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
 const {x,y}=offset;
 const frames=direction==='minimize'?[
  {opacity:1,transform:'translate(0,0) scale(1)'},
  {opacity:.65,offset:.55,transform:`translate(${x*.45}px,${y*.55}px) scale(.55,.7)`},
  {opacity:0,transform:`translate(${x}px,${y}px) scale(.06,.025)`}
 ]:[
  {opacity:0,transform:`translate(${x}px,${y}px) scale(.06,.025)`},
  {opacity:1,offset:.78,transform:'translate(0,-3px) scale(1.008)'},
  {opacity:1,transform:'translate(0,0) scale(1)'}
 ];
 return element.animate(frames,direction==='minimize'?{duration:280,easing:'cubic-bezier(.4,0,.8,.4)',fill:'forwards'}:{duration:460,easing:'cubic-bezier(.16,1,.3,1)'});
}
