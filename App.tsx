
import {useEffect,useState} from 'react'
import {useStore} from './store'
import {saveOrder,getOrders,saveMenu,getMenu} from './db'
import {BarChart,Bar,XAxis,YAxis,Tooltip} from 'recharts'

export default function App(){
 const {menu,setMenu,order,add,clear,table,setTable,theme,toggle}=useStore()
 const [view,setView]=useState<'pos'|'menu'|'kitchen'|'tables'|'dashboard'>('pos')
 const [orders,setOrders]=useState<any[]>([])

 useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark')},[theme])
 useEffect(()=>{getMenu().then(m=>{if(m.length)setMenu(m);else{const d=[{id:'1',name:'Burger',price:40},{id:'2',name:'Fries',price:25},{id:'3',name:'Cola',price:15}];setMenu(d);saveMenu(d)}})},[])
 useEffect(()=>{getOrders().then(setOrders)},[view])

 const total=order.reduce((s,o)=>s+o.item.price*o.qty,0)

 const checkout=async()=>{
  if(!order.length)return
  await saveOrder({items:order,total,table})
  window.print()
  clear()
  alert('Saved')
 }

 if(view==='menu') return <MenuEditor back={()=>setView('pos')}/>
 if(view==='kitchen') return <Kitchen back={()=>setView('pos')} orders={orders}/>
 if(view==='tables') return <Tables back={()=>setView('pos')} setTable={setTable}/>
 if(view==='dashboard') return <Dashboard back={()=>setView('pos')} orders={orders}/>

 return (
 <div className="flex min-h-screen">
  <div className="flex-1 p-4">
   <TopNav setView={setView} toggle={toggle}/>
   <div className="mb-3 font-semibold">Table: {table||'None'}</div>
   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {menu.map(m=>(
     <button key={m.id} onClick={()=>add(m)} className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow">
      <div className="font-semibold">{m.name}</div>
      <div>R{m.price}</div>
     </button>
    ))}
   </div>
  </div>

  <div className="w-96 bg-gray-50 dark:bg-neutral-950 p-4">
   <h2 className="font-bold mb-3">Order</h2>
   {order.map(o=>(
    <div key={o.item.id} className="flex justify-between bg-white dark:bg-neutral-800 p-2 mb-2 rounded">
     <span>{o.item.name} x{o.qty}</span>
     <span>R{o.item.price*o.qty}</span>
    </div>
   ))}
   <div className="font-bold mt-4">Total: R{total}</div>
   <button onClick={checkout} className="w-full py-3 mt-3 bg-green-600 text-white rounded-xl">Pay & Print</button>
   <button onClick={clear} className="w-full py-2 mt-2 bg-red-500 text-white rounded-xl">Clear</button>
  </div>
 </div>)
}

function TopNav({setView,toggle}:{setView:any,toggle:any}){
 return(
 <div className="flex gap-2 mb-4 flex-wrap">
  <button onClick={()=>setView('tables')} className="px-3 py-2 bg-blue-600 text-white rounded">Tables</button>
  <button onClick={()=>setView('menu')} className="px-3 py-2 bg-indigo-600 text-white rounded">Menu</button>
  <button onClick={()=>setView('kitchen')} className="px-3 py-2 bg-orange-600 text-white rounded">Kitchen</button>
  <button onClick={()=>setView('dashboard')} className="px-3 py-2 bg-purple-700 text-white rounded">Dashboard</button>
  <button onClick={toggle} className="px-3 py-2 bg-black text-white rounded">Theme</button>
 </div>)
}

function Tables({back,setTable}:{back:any,setTable:any}){
 const tables=Array.from({length:12},(_,i)=>`T${i+1}`)
 return(
 <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Select Table</h1>
  <div className="grid grid-cols-4 gap-3">
   {tables.map(t=>(
    <button key={t} onClick={()=>{setTable(t);back()}} className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow">{t}</button>
   ))}
  </div>
 </div>)
}

function Kitchen({back,orders}:{back:any,orders:any[]}){
 return(
 <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Kitchen Screen</h1>
  {orders.map((o,i)=>(
   <div key={i} className="bg-white dark:bg-neutral-800 p-4 rounded mb-3">
    <div className="font-bold">Table {o.table||'-'} | R{o.total}</div>
    {o.items.map((it:any,j:number)=>(<div key={j}>{it.item.name} x{it.qty}</div>))}
   </div>
  ))}
  <button onClick={back} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
 </div>)
}

function Dashboard({orders,back}:{orders:any[],back:any}){
 const total=orders.reduce((s,o)=>s+o.total,0)
 const data=orders.map((o,i)=>({name:i+1,total:o.total}))
 return(
 <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
  <div className="mb-3">Orders: {orders.length}</div>
  <div className="mb-6 font-bold">Revenue: R{total}</div>
  <BarChart width={300} height={200} data={data}>
   <XAxis dataKey="name"/><YAxis/><Tooltip/>
   <Bar dataKey="total"/>
  </BarChart>
  <br/>
  <button onClick={()=>window.print()} className="px-4 py-2 bg-black text-white rounded mr-2">Print</button>
  <button onClick={back} className="px-4 py-2 bg-gray-600 text-white rounded">Back</button>
 </div>)
}

function MenuEditor({back}:{back:any}){
 const {menu,setMenu}=useStore()
 const [items,setItems]=useState(menu)
 const addItem=()=>setItems([...items,{id:Date.now().toString(),name:'New',price:0}])
 const save=()=>{setMenu(items);saveMenu(items);alert('Saved');back()}
 return(
 <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Menu Editor</h1>
  {items.map((it,i)=>(
   <div key={it.id} className="flex gap-2 mb-2">
    <input value={it.name} onChange={e=>{const c=[...items];c[i].name=e.target.value;setItems(c)}} className="border p-2 flex-1"/>
    <input type="number" value={it.price} onChange={e=>{const c=[...items];c[i].price=Number(e.target.value);setItems(c)}} className="border p-2 w-24"/>
   </div>
  ))}
  <button onClick={addItem} className="px-4 py-2 bg-blue-600 text-white rounded mr-2">Add</button>
  <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded mr-2">Save</button>
  <button onClick={back} className="px-4 py-2 bg-gray-500 text-white rounded">Back</button>
 </div>)
}
