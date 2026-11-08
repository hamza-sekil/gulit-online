import { env } from "cloudflare:workers";
import defaults from "./catalog-defaults.json";
export const CATEGORIES=["Electronics", "Home & Living", "Fashion", "Beauty & Care", "Groceries", "Supermarket", "Restaurant", "Laundry service", "Car & garage", "MEP", "Cleaning & Laundry", "Baby & Kids", "Appliances", "Mobiles & Tablets", "Home & Garden", "Stationery & Office", "Pet Supplies", "Toys & Outdoor", "Gaming & Cameras"];
export type Product={id:number;name:string;cat:string;price:number;stock:number;image:string;badge:string;revision:number;manufacturingDate?:string|null;expiryDate?:string|null};
export function database(){if(!env.DB)throw new Error("Catalog database is unavailable");return env.DB;}
export async function catalog(includeArchived=false,includeStoreStock=true){
 const all=new Map<number,any>(defaults.map(p=>[p.id,{...p,archived:0}]));
 const data=await database().prepare("SELECT * FROM products").all();
 for(const row of data.results as any[]){all.set(row.id,{photoKind:row.image==='/icon-512.png'||row.image===all.get(row.id)?.image?all.get(row.id)?.photoKind:undefined,brand:all.get(row.id)?.brand,group:all.get(row.id)?.group,id:row.id,name:row.name,cat:row.category,price:row.price_cents/100,stock:row.stock,manufacturingDate:row.manufacturing_date,expiryDate:row.expiry_date,image:row.image==='/icon-512.png'?(all.get(row.id)?.image||row.image):row.image,badge:"Gulit collection",revision:row.revision,archived:row.archived});}
 if(includeStoreStock){
 const stocks=await database().prepare('SELECT x.*,s.name AS store_name,s.active AS store_active FROM store_stock x JOIN stores s ON s.id=x.store_id').all();
 for(const row of stocks.results as any[]){const p=all.get(row.product_id);if(!p)continue;if(!p.storeStock){p.storeStock=[];p.stockManaged=true;p.stock=0;}if(!row.store_active)continue;p.stock+=row.quantity;p.storeStock.push({storeId:row.store_id,storeName:row.store_name,quantity:row.quantity,manufacturingDate:row.manufacturing_date,expiryDate:row.expiry_date,checked:row.updated_by!=='pending',updatedAt:row.updated_at});}
 for(const p of all.values())if(p.storeStock){const m=new Set(p.storeStock.map((x:any)=>x.manufacturingDate)),e=new Set(p.storeStock.map((x:any)=>x.expiryDate));p.datesVary=m.size>1||e.size>1;p.manufacturingDate=m.size===1?[...m][0]:null;p.expiryDate=e.size===1?[...e][0]:null;}
 }
 return [...all.values()].filter(p=>includeArchived||!p.archived);
}
export function validateProduct(input:any){
 if(typeof input!=='object'||!input)throw new Error("Invalid product");
 const name=String(input.name||'').trim();if(name.length<2||name.length>160)throw new Error("Product name must be 2–160 characters");
 const cat=String(input.cat||'');if(!CATEGORIES.includes(cat))throw new Error("Choose a valid category");
 const price=Number(input.price),stock=Number(input.stock);if(!Number.isFinite(price)||price<0||price>100000000)throw new Error("Enter a valid price in birr");
 if(!Number.isSafeInteger(stock)||stock<0||stock>100000000)throw new Error("Stock must be a whole number of zero or more");
 let image=String(input.image||'').trim();if(image.length>2000)throw new Error('Photo URL is too long');if(!image)image='/icon-512.png';
 if(image!=='/icon-512.png'&&image!=='/photo-pending.svg'&&!/^\/product-photos\/[a-f0-9]{18}\.jpg$/.test(image)&&!/^\/api\/images\/[a-zA-Z0-9._-]+$/.test(image)){
  let url;try{url=new URL(image);}catch{throw new Error("Upload a photo or enter a valid HTTPS image URL");}
  if(url.protocol!=='https:'||url.username||url.password)throw new Error("Photo URL must use HTTPS");
 }
 return {name,cat,priceCents:Math.round(price*100),stock,image,...validateProductDates(input)};
}

export function validateProductDates(input:any){
 const date=(value:unknown,label:string)=>{if(value===null||value===undefined||value==='')return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'1900-01-01'||value>'9999-12-31')throw Error(label+' must be a valid Gregorian date (YYYY-MM-DD).');const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw Error(label+' must be a real calendar date.');return value;};
 const manufacturingDate=date(input.manufacturingDate,'Manufacturing date'),expiryDate=date(input.expiryDate,'Expiry date');
 if(manufacturingDate&&expiryDate&&expiryDate<manufacturingDate)throw Error('Expiry date cannot be before manufacturing date.');
 return {manufacturingDate,expiryDate};
}
