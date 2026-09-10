"use client";
import { useEffect, useRef } from "react";
import type { NetworkPoint } from "@/lib/network";

type Tone="active"|"master"|"future";
function tone(p:NetworkPoint):Tone{return p.future?"future":(p.type==="master"||p.type==="international")?"master":"active";}
function iconUrl(t:Tone){return t==="active"?"/go/go-green.png":t==="master"?"/go/go-blue.png":"/go/go-gray.png";}
function googleLink(p:NetworkPoint){const q=Number.isFinite(p.lat)&&Number.isFinite(p.lng)?`${p.lat},${p.lng}`:(p.address||`${p.city} ${p.state||""} ${p.country}`);return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;}

declare global { interface Window { L?: any; } }

export default function LeafletNetworkMap({points,selected,onSelect}:{points:NetworkPoint[];selected:NetworkPoint|null;onSelect:(p:NetworkPoint)=>void}){
 const hostRef=useRef<HTMLDivElement|null>(null);
 const mapRef=useRef<any>(null);
 const layerRef=useRef<any>(null);

 useEffect(()=>{
  let cancelled=false;
  const init=()=>{
   if(cancelled||!hostRef.current||!window.L)return;
   const L=window.L;
   if(!mapRef.current){
    mapRef.current=L.map(hostRef.current,{zoomControl:true,scrollWheelZoom:true}).setView([-15.5,-51.5],4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(mapRef.current);
   }
   if(layerRef.current){layerRef.current.remove();layerRef.current=null;}
   const group=L.layerGroup().addTo(mapRef.current); layerRef.current=group;
   const bounds:any[]=[];
   points.forEach(p=>{
    if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng))return;
    const t=tone(p),size=t==="active"?44:46;
    const icon=L.icon({iconUrl:iconUrl(t),iconSize:[size,size],iconAnchor:[size/2,size*.78],popupAnchor:[0,-size*.7],className:"leafletGoIcon"});
    const marker=L.marker([p.lat,p.lng],{icon,title:p.name}).addTo(group);
    marker.bindPopup(`<div class="goMapPopup"><strong>${p.name}</strong><span>${p.address||`${p.city} • ${p.country}`}</span><a href="${googleLink(p)}" target="_blank" rel="noreferrer">Abrir no Google Maps ↗</a></div>`);
    marker.on("click",()=>onSelect(p));
    bounds.push([p.lat,p.lng]);
   });
   if(selected&&Number.isFinite(selected.lat)&&Number.isFinite(selected.lng)){
    mapRef.current.flyTo([selected.lat,selected.lng],13,{duration:.8});
   }else if(bounds.length>1){
    mapRef.current.fitBounds(bounds,{padding:[28,28],maxZoom:5});
   }else if(bounds.length===1){mapRef.current.setView(bounds[0],12);}
  };
  const ensure=()=>{
   if(window.L){init();return;}
   if(!document.querySelector('link[data-leaflet="1"]')){const l=document.createElement("link");l.rel="stylesheet";l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";l.dataset.leaflet="1";document.head.appendChild(l);}
   const existing=document.querySelector('script[data-leaflet="1"]') as HTMLScriptElement|null;
   if(existing){existing.addEventListener("load",init,{once:true});return;}
   const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.dataset.leaflet="1";s.async=true;s.onload=init;document.body.appendChild(s);
  };
  ensure();
  return()=>{cancelled=true;};
 },[points,selected,onSelect]);

 return <div ref={hostRef} className="leafletNetworkMap"/>;
}
