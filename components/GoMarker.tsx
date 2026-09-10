import Image from "next/image";

const SRC={active:"/go/go-green.png",master:"/go/go-blue.png",future:"/go/go-gray.png"} as const;
export default function GoMarker({tone="active",small=false}:{tone?:"active"|"master"|"future";small?:boolean}){
 const size=small?30:54;
 return <span className={`goImageMarker ${tone} ${small?"small":""}`} aria-label="Marcador Locagora GO">
   <Image src={SRC[tone]} alt="GO Locagora" width={size} height={size} className="goImageMarkerImg"/>
 </span>
}
