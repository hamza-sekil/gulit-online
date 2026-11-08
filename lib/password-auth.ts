import { headers } from "next/headers";
import { database } from "./catalog";
export const COOKIE="__Host-gulit-admin";
export function hex(b:ArrayBuffer|Uint8Array){return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function digest(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
export async function passwordHash(password:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
export function equal(a:string,b:string){let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
export async function passwordOwner(){const h=await headers();const token=h.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const row=await database().prepare('SELECT expires FROM admin_sessions WHERE token_hash=?').bind(await digest(token)).first<any>();if(!row||row.expires<Date.now())return null;return {userId:'password-owner',email:'owner',displayName:'Owner',fullName:null};}
export function cookie(token:string,age=28800){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;}
