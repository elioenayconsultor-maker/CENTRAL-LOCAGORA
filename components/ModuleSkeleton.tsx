export default function ModuleSkeleton(){
  return <main className="workspace moduleSkeleton" aria-busy="true" aria-label="Carregando módulo">
    <div className="skeleton skeletonHero"/>
    <div className="skeletonGrid">
      <div className="skeleton skeletonCard"/><div className="skeleton skeletonCard"/><div className="skeleton skeletonCard"/>
    </div>
  </main>;
}
