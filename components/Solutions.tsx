"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, Presentation } from "lucide-react";
import { PRODUCT_REGISTRY, type ProductRegistryEntry } from "@/lib/product-registry";
import { getPublicProduct } from "@/lib/public-products";
import type { Simulation } from "@/lib/types";
import LocInvestCalculator from "./LocInvestCalculator";
import EuroLocCalculator from "./EuroLocCalculator";
import LocInternacionalCalculator from "./LocInternacionalCalculator";
import LocMillionCalculator from "./LocMillionCalculator";
import FranquiaNacionalCalculator from "./FranquiaNacionalCalculator";
import FranquiaInternacionalCalculator from "./FranquiaInternacionalCalculator";
import MiniMasterCalculator from "./MiniMasterCalculator";
import MasterRegionalCalculator from "./MasterRegionalCalculator";
import PageHero from "./PageHero";
import PublicProductGallery from "./PublicProductGallery";

const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

type ProductStage = "presentation" | "simulation";

function ProductCalculator({
  product,
  onBack,
  onSave,
}: {
  product: ProductRegistryEntry;
  onBack: () => void;
  onSave: (simulation: Simulation) => void;
}) {
  if (!product.calculatorKey || product.min === null) return null;

  const common = {
    initialCapital: product.min,
    onBack,
    onSave,
    saveLabel: "Gerar proposta",
  };

  switch (product.calculatorKey) {
    case "locinvest":
      return <LocInvestCalculator {...common} />;
    case "euroloc":
      return <EuroLocCalculator {...common} />;
    case "locinternacional":
      return <LocInternacionalCalculator {...common} />;
    case "locmillion":
      return <LocMillionCalculator {...common} />;
    case "franquia-nacional":
      return <FranquiaNacionalCalculator {...common} />;
    case "franquia-internacional":
      return <FranquiaInternacionalCalculator {...common} />;
    case "mini-master":
      return <MiniMasterCalculator {...common} />;
    case "master-regional":
      return <MasterRegionalCalculator {...common} />;
    default:
      return null;
  }
}

export default function Solutions({ onJourney }: { onJourney?: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stage, setStage] = useState<ProductStage>("presentation");
  const product = PRODUCT_REGISTRY.find((item) => item.id === selectedId) ?? null;

  const publicProduct = useMemo(() => {
    if (!product) return null;
    return (
      getPublicProduct(product.primaryPublicSlug) ??
      product.publicAliases.map((slug) => getPublicProduct(slug)).find(Boolean) ??
      null
    );
  }, [product]);

  const selectProduct = (id: string) => {
    setSelectedId(id);
    setStage("presentation");
  };

  const closeProduct = () => {
    setSelectedId(null);
    setStage("presentation");
  };

  const generateProposal = (simulation: Simulation) => {
    localStorage.setItem("locagora_pending_simulation", JSON.stringify(simulation));
    localStorage.setItem("locagora_pending_proposal", "1");
    localStorage.setItem("locagora_pending_new_client", "1");
    localStorage.setItem("locagora_preselect_product", simulation.sourceRoute);
    onJourney?.();
  };

  const startAssistedJourney = (selected: ProductRegistryEntry) => {
    localStorage.removeItem("locagora_pending_simulation");
    localStorage.setItem("locagora_pending_new_client", "1");
    localStorage.setItem("locagora_preselect_product", selected.internalRoute);
    localStorage.setItem("locagora_preselect_product_id", selected.id);
    localStorage.setItem("locagora_preselect_product_crm", selected.crmCode);
    onJourney?.();
  };

  if (product) {
    const hasCalculator = product.calculatorKey !== null && product.min !== null;

    if (stage === "simulation" && hasCalculator) {
      return (
        <main className="workspace presentationWorkspace">
          <section className="presentationBanner">
            <div>
              <Presentation size={20} />
              <div>
                <small>ÁREA DO COLABORADOR • SIMULAÇÃO</small>
                <b>{product.name}</b>
                <p>
                  Simulação interna do produto. Ao voltar, você retorna à apresentação e ao PDF deste modelo.
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setStage("presentation")}>
              <ArrowLeft size={15} /> Voltar à apresentação
            </button>
          </section>

          <ProductCalculator
            product={product}
            onBack={() => setStage("presentation")}
            onSave={generateProposal}
          />
        </main>
      );
    }

    return (
      <main className="workspace presentationWorkspace">
        <section className="presentationBanner">
          <div>
            <Presentation size={20} />
            <div>
              <small>ÁREA DO COLABORADOR • APRESENTAÇÃO DO PRODUTO</small>
              <b>{product.name}</b>
              <p>
                Consulte a apresentação e o PDF do produto antes de iniciar a simulação. Todo o fluxo permanece dentro da área do colaborador.
              </p>
            </div>
          </div>
          <button type="button" onClick={closeProduct}>
            <ArrowLeft size={15} /> Voltar aos produtos
          </button>
        </section>

        {publicProduct ? (
          <PublicProductGallery product={publicProduct} />
        ) : (
          <section className="panel" style={{ marginTop: 16 }}>
            <div className="presentationInfo">
              <Presentation size={18} />
              <div>
                <b>Material em atualização</b>
                <span>Não foi localizado um material de apresentação vinculado a este produto.</span>
              </div>
            </div>
          </section>
        )}

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="presentationInfo">
            {hasCalculator ? <Presentation size={18} /> : <MessageCircle size={18} />}
            <div>
              <b>{hasCalculator ? "Pronto para simular" : "Atendimento personalizado"}</b>
              <span>
                {hasCalculator
                  ? "Depois de apresentar o material ao cliente, avance para a calculadora interna deste produto."
                  : "Este produto não possui calculadora padrão. O atendimento segue internamente para cadastro e condição comercial personalizada."}
              </span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            {hasCalculator ? (
              <button className="primary" type="button" onClick={() => setStage("simulation")}>
                Ir para simulação <ArrowRight size={16} />
              </button>
            ) : (
              <button className="primary" type="button" onClick={() => startAssistedJourney(product)}>
                Iniciar atendimento interno <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  const investments = PRODUCT_REGISTRY.filter((item) =>
    item.category.startsWith("INVESTIMENTOS")
  );
  const franchises = PRODUCT_REGISTRY.filter((item) =>
    item.category.startsWith("FRANQUIAS")
  );

  const renderCards = (items: readonly ProductRegistryEntry[]) => (
    <div className="productGrid">
      {items.map((item) => (
        <button
          type="button"
          className="productCard eligible"
          key={item.id}
          onClick={() => selectProduct(item.id)}
        >
          <small>{item.category}</small>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <span>
            {item.min === null ? (
              <b>Condição personalizada</b>
            ) : (
              <>
                A partir de <b>{money(item.min)}</b>
              </>
            )}
          </span>
          <strong>VER APRESENTAÇÃO →</strong>
        </button>
      ))}
    </div>
  );

  return (
    <main className="workspace">
      <PageHero
        kicker="NEGÓCIOS & INVESTIMENTOS • ÁREA DO COLABORADOR"
        title="Portfólio comercial Locagora"
        description="Abra o produto, apresente o material e o PDF ao cliente e só então avance para a simulação — sem sair da área autenticada."
      />

      <section className="panel portfolioPanel">
        <div className="presentationInfo">
          <Presentation size={18} />
          <div>
            <b>Apresentação antes da simulação</b>
            <span>
              Cada produto mantém seu material comercial e PDF disponível dentro da Central LOC. A calculadora é a etapa seguinte do atendimento.
            </span>
          </div>
        </div>

        <div className="portfolioGroups">
          <div>
            <small>INVESTIMENTOS BRASIL E INTERNACIONAL</small>
            <span>Produtos de investimento e participação em ativos.</span>
          </div>
        </div>
        {renderCards(investments)}

        <div className="portfolioGroups" style={{ marginTop: 24 }}>
          <div>
            <small>FRANQUIAS BRASIL E INTERNACIONAL</small>
            <span>Modelos de operação, expansão territorial e franquias.</span>
          </div>
        </div>
        {renderCards(franchises)}
      </section>
    </main>
  );
}
