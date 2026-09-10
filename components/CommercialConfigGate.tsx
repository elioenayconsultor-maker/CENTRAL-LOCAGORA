"use client";
import type { ReactNode } from "react";
import { PremisesProvider, usePremises } from "@/components/providers/PremisesProvider";
import AsyncState from "@/components/ui/AsyncState";

function Gate({children}:{children:ReactNode}){const {loading,error,reload}=usePremises();if(loading)return <AsyncState state="loading" title="Atualizando parâmetros comerciais"/>;if(error)return <AsyncState state="error" title="Não foi possível carregar as premissas" description={error} actionLabel="Tentar novamente" onAction={()=>void reload()}/>;return <>{children}</>;}
export default function CommercialConfigGate({children}:{children:ReactNode}){return <PremisesProvider><Gate>{children}</Gate></PremisesProvider>;}
