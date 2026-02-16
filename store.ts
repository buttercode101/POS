
import {create} from 'zustand'
export type Item={id:string,name:string,price:number}
export type OrderItem={item:Item,qty:number}

type State={
 menu:Item[]
 order:OrderItem[]
 table:string|null
 theme:'light'|'dark'
 setMenu:(m:Item[])=>void
 add:(i:Item)=>void
 clear:()=>void
 setTable:(t:string|null)=>void
 toggle:()=>void
}

export const useStore=create<State>((set,get)=>({
 menu:[],
 order:[],
 table:null,
 theme:'light',
 setMenu:(m)=>set({menu:m}),
 add:(i)=>{
  const ex=get().order.find(o=>o.item.id===i.id)
  if(ex){
   set(s=>({order:s.order.map(o=>o.item.id===i.id?{...o,qty:o.qty+1}:o)}))
  }else set(s=>({order:[...s.order,{item:i,qty:1}]}))
 },
 clear:()=>set({order:[],table:null}),
 setTable:(t)=>set({table:t}),
 toggle:()=>set(s=>({theme:s.theme==='light'?'dark':'light'}))
}))
