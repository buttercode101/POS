
import {openDB} from 'idb'
const dbp=openDB('ultimate-pos',1,{
 upgrade(db){
  db.createObjectStore('orders',{keyPath:'id',autoIncrement:true})
  db.createObjectStore('menu',{keyPath:'id'})
  db.createObjectStore('tables',{keyPath:'id'})
 }
})

export const saveOrder=async(o:any)=>{const db=await dbp;await db.add('orders',{...o,date:new Date().toISOString()})}
export const getOrders=async()=>{const db=await dbp;return db.getAll('orders')}
export const saveMenu=async(m:any[])=>{const db=await dbp;const tx=db.transaction('menu','readwrite');await tx.store.clear();for(const i of m) await tx.store.put(i);await tx.done}
export const getMenu=async()=>{const db=await dbp;return db.getAll('menu')}
