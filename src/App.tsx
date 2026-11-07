import { useState } from 'react';
import './App.css';
import { mockActivities, mockQuotes, mockUser } from './mocks/homeMocks';
import { ActivitiesWorkspace, ClientsWorkspace, FieldCommercial, FreightsWorkspace, OpportunitiesWorkspace, OrdersWorkspace, PriceAgreementsWorkspace, ProductsWorkspace, QuotesWorkspace, SalesWorkspace } from './components/CommercialModules';

const areaMenus = {
  comercial: { label: 'Comercial', icon: '◌', items: [
    ['inicio', 'Inicio', '⌂'], ['campo-comercial', 'Campo comercial', '▧'],
    ['clientes', 'Clientes y seguimiento', '◎'], ['oportunidades', 'Oportunidades', '◇'], ['actividades', 'Actividades y visitas', '◷'], ['cotizaciones', 'Cotizaciones', '▤'],
    ['pedido-360', 'Pedido 360', '◉'], ['pedidos-sap', 'Pedidos SAP', '▣'],
    ['precios', 'Precios acordados', '¤'], ['productos', 'Productos y costos', '◇'],
    ['fletes', 'Tarifas de flete', '⇄'],
  ] },
  produccion: { label: 'Producción', icon: '▧', items: [['produccion', 'Vista de producción', '▧'], ['pedido-360', 'Pedido 360', '◉']] },
  logistica: { label: 'Logística', icon: '↝', items: [['logistica', 'Centro logístico', '↝'], ['pedido-360', 'Pedido 360', '◉'], ['pedidos-sap', 'Pedidos SAP', '▣']] },
  finanzas: { label: 'Finanzas', icon: '▦', items: [['finanzas', 'Control financiero', '▦'], ['pedido-360', 'Pedido 360', '◉']] },
  control: { label: 'Centro de control', icon: '◉', items: [['control', 'Vista general', '◉'], ['configuracion', 'Administración y parámetros', '⚙']] },
} as const;

type AreaKey = keyof typeof areaMenus;

const money = (value: number) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(value);

function App() {
  const [active, setActive] = useState('inicio');
  const [activeArea, setActiveArea] = useState<AreaKey>('comercial');
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pendingActivities = mockActivities.filter((activity) => activity.status === 'Pendiente');
  const overdueActivities = pendingActivities.filter((activity) => activity.overdue);
  const count = (status: string) => mockQuotes.filter((quote) => quote.status === status).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const currentMenu = areaMenus[activeArea];

  const navigate = (id: string) => {
    setActive(id);
    setMenuOpen(false);
  };

  const openArea = (area: AreaKey) => {
    setActiveArea(area);
    setActive(areaMenus[area].items[0][0]);
    setMenuOpen(false);
  };

  const searchResults = search.trim()
    ? mockQuotes.filter((quote) => `${quote.id} ${quote.client}`.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];

  return (
    <main className={`appShell ${menuOpen ? 'menuOpen' : ''}`}>
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="logoShell sidebarLogo"><img src="/aislapol-logo.svg" alt="Aislapol" /></div>
          <div className="productName"><strong>Aislapol Gestión</strong><small>Plataforma operativa interna</small></div>
        </div>

        <nav className="areaNavigation" aria-label="Áreas principales">
          <p className="navGroupLabel">Áreas</p>
          {(Object.keys(areaMenus) as AreaKey[]).map((area) => (
            <button key={area} type="button" className={`areaNavItem ${activeArea === area ? 'active' : ''}`} aria-current={activeArea === area ? 'page' : undefined} onClick={() => openArea(area)}>
              <span aria-hidden="true">{areaMenus[area].icon}</span>{areaMenus[area].label}
            </button>
          ))}
        </nav>

        <nav className="moduleNavigation" aria-label={`Módulos de ${currentMenu.label}`}>
          <p className="navGroupLabel">{currentMenu.label}</p>
          {currentMenu.items.map(([id, label, icon]) => (
            <button key={`${activeArea}-${id}`} type="button" className={`navItem ${active === id ? 'active' : ''}`} aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <span aria-hidden="true">{icon}</span>{label}
            </button>
          ))}
        </nav>

        <button className="sidebarHelp" type="button"><strong>¿Necesitas ayuda?</strong><span>Envía una solicitud directamente a administración.</span></button>
      </aside>

      <section className="workspace">
        <header className="appHeader">
          <button className="menuButton" type="button" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? '×' : '☰'}</button>
          <div className="mobileBrand"><img src="/aislapol-logo.svg" alt="Aislapol" /></div>
          <div className="globalSearch">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Buscador global" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar clientes, materiales, cotizaciones o fletes" />
            {search.trim() && <div className="globalSearchResults">{searchResults.length ? searchResults.map((quote) => (
              <button key={quote.id} onClick={() => { setSearch(''); navigate('cotizaciones'); }}><span className="searchType">Cotización</span><strong>{quote.id}</strong><small>{quote.client}</small></button>
            )) : <p>No encontramos resultados para “{search}”.</p>}</div>}
          </div>
          <div className="headerActions">
            <span className="headerVersion">CRM V3 · MFA · Pedido SAP R2</span>
            <div className="userInfo"><span>{mockUser.initials}</span><div><strong>{mockUser.name}</strong></div></div>
            <button className="logout" type="button">Salir</button>
          </div>
        </header>

        <div className="pageContent">
          {active === 'inicio' && activeArea === 'comercial' ? (
            <div className="homeDashboard">
              <section className="homeIntro">
                <div><span className="homeContext">Aislapol / Gestión comercial interna</span><h1>{greeting}, {mockUser.name.split(' ')[0]}.</h1><p>Todo lo necesario para atender clientes, preparar cotizaciones y seguir pedidos SAP.</p></div>
                <button className="primary homePrimaryAction" onClick={() => navigate('cotizaciones')}>Crear cotización</button>
              </section>
              <section className="homeFocus" aria-label="Resumen de trabajo">
                <div><span>Requieren revisión</span><strong>{count('Revisar')}</strong><small>Cotizaciones pendientes de validar</small></div>
                <div className={overdueActivities.length ? 'homeFocusUrgent' : ''}><span>Compromisos vencidos</span><strong>{overdueActivities.length}</strong><small>Actividades por atender</small></div>
                <div><span>Pedidos en SAP</span><strong>{count('Ingresado SAP')}</strong><small>Cotizaciones ingresadas</small></div>
              </section>
              <section className="homeWorkflows" aria-labelledby="home-workflows-title">
                <div className="homeSectionHeading"><h2 id="home-workflows-title">¿Qué necesitas hacer?</h2><p>Entra por la tarea; las oportunidades y visitas están vinculadas a los clientes.</p></div>
                <div className="homeWorkflowGrid">
                  <article className="homeWorkflow"><div><span className="homeWorkflowIndex">Cuenta comercial</span><h3>Clientes y seguimiento</h3><p>Consulta una ficha, registra un negocio y revisa próximas acciones.</p></div><div className="homeWorkflowActions"><button onClick={() => navigate('clientes')}>Abrir clientes</button><button onClick={() => navigate('ventas')}>Resumen comercial</button></div></article>
                  <article className="homeWorkflow"><div><span className="homeWorkflowIndex">Proceso de venta</span><h3>Cotizaciones</h3><p>Prepara, revisa y consulta las propuestas comerciales.</p></div><div className="homeWorkflowActions"><button onClick={() => navigate('cotizaciones')}>Ver cotizaciones</button><button onClick={() => navigate('cotizaciones')}>Crear nueva</button></div></article>
                  <article className="homeWorkflow"><div><span className="homeWorkflowIndex">Seguimiento de entrega</span><h3>Pedidos SAP</h3><p>Consulta el avance, despacho y facturación de un pedido.</p></div><div className="homeWorkflowActions"><button onClick={() => navigate('pedidos-sap')}>Consultar pedidos</button></div></article>
                </div>
              </section>
              <section className="homeToday" aria-labelledby="home-today-title">
                <div className="homeSectionHeading"><h2 id="home-today-title">Mi día</h2><p>La información prioritaria para comenzar la jornada comercial.</p></div>
                <div className="homeTodayGrid">
                  <article className="card homeTodayCard"><div className="cardHead"><div><p className="kicker">SEGUIMIENTO</p><h2>Próximas acciones</h2></div></div>{pendingActivities.slice(0,3).map((activity) => <button className="homeTodayItem" key={activity.id}><time>{activity.date}</time><span><strong>{activity.subject}</strong><small>Cliente demo</small></span><b>→</b></button>)}</article>
                  <article className="card homeTodayCard"><div className="cardHead"><div><p className="kicker">ÚLTIMA ACTIVIDAD</p><h2>Cotizaciones recientes</h2></div></div>{mockQuotes.slice(0,3).map((quote) => <button className="homeTodayItem" key={quote.id} onClick={() => navigate('cotizaciones')}><time>{quote.delivery}</time><span><strong>{quote.id}</strong><small>{quote.client} · {quote.status}</small></span><b>→</b></button>)}</article>
                  <article className="card homeTodayCard"><div className="cardHead"><div><p className="kicker">TRAZABILIDAD</p><h2>Últimos movimientos</h2></div></div>{mockQuotes.slice(0,3).map((quote) => <button className="homeTodayItem" key={quote.id} onClick={() => navigate('cotizaciones')}><time>{quote.delivery}</time><span><strong>{quote.status}</strong><small>{quote.id} · {quote.client}</small></span><b>→</b></button>)}</article>
                </div>
              </section>
              <section className="dashboardGrid homeDashboardGrid">
                <div><div className="cardHead dashboardHead"><div><h2>Cotizaciones recientes</h2><p>Trabajo comercial del equipo</p></div><button className="textButton" onClick={() => navigate('cotizaciones')}>Ver todas →</button></div><article className="card tableCard"><div className="tableScroll"><table><thead><tr><th>Correlativo</th><th>Versión</th><th>Cliente</th><th>Total</th><th>Entrega</th><th>Estado</th><th /></tr></thead><tbody>{mockQuotes.slice(0,5).map((quote) => <tr key={quote.id}><td>{quote.id}</td><td>V{quote.version}</td><td>{quote.client}</td><td>{money(quote.total)}</td><td>{quote.delivery}</td><td><span className={`status ${quote.status === 'Ingresado SAP' ? 'success' : quote.status === 'Revisar' ? 'danger' : 'info'}`}>{quote.status}</span></td><td><button className="textButton" onClick={() => navigate('cotizaciones')}>Abrir →</button></td></tr>)}</tbody></table></div></article></div>
                <aside className="card alertsCard"><div className="cardHead"><div><p className="kicker">PRÓXIMOS PASOS</p><h2>Actividades y visitas</h2></div></div>{pendingActivities.map((activity) => <p key={activity.id}>{activity.date} · {activity.subject}</p>)}</aside>
              </section>
            </div>
          ) : active === 'ventas' ? (
            <SalesWorkspace onNavigate={navigate} />
          ) : active === 'campo-comercial' ? (
            <FieldCommercial />
          ) : active === 'clientes' ? (
            <ClientsWorkspace onNavigate={navigate} />
          ) : active === 'oportunidades' ? (
            <OpportunitiesWorkspace />
          ) : active === 'actividades' ? (
            <ActivitiesWorkspace />
          ) : active === 'cotizaciones' ? (
            <QuotesWorkspace onNavigate={navigate} />
          ) : active === 'pedido-360' || active === 'pedidos-sap' ? (
            <OrdersWorkspace initialTab={active === 'pedido-360' ? '360' : 'sap'} />
          ) : active === 'precios' ? (
            <PriceAgreementsWorkspace />
          ) : active === 'productos' ? (
            <ProductsWorkspace />
          ) : active === 'fletes' ? (
            <FreightsWorkspace />
          ) : (
            <section className="pendingModule"><p className="kicker">{currentMenu.label}</p><h1>{currentMenu.items.find(([id]) => id === active)?.[1] ?? currentMenu.label}</h1><p>Módulo pendiente de migración</p></section>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
