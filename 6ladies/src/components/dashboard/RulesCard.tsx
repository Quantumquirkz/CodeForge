export function RulesCard() {
  return (
    <section id="rules-section" className="sidebar-card">
      <span className="eyebrow">Reglas del juego</span>
      <h3 className="sidebar-card__title">6 damas en esquina</h3>
      <p className="sidebar-card__text">
        El objetivo es llevar las seis fichas de cada color a la esquina opuesta y reconstruir la misma formación
        triangular.
      </p>
      <ul className="rules-list">
        <li>Se juega sobre un tablero de ajedrez 8x8 con seis fichas rojas y seis negras.</li>
        <li>Cada color inicia en su esquina sobre casillas blancas, en formación triangular.</li>
        <li>Las fichas solo avanzan hacia su esquina objetivo: no se permite retroceder.</li>
        <li>Un movimiento es un salto recto sobre una ficha o una serie contigua de fichas.</li>
        <li>Las fichas saltadas permanecen en el tablero.</li>
        <li>Gana quien complete primero su formación de seis fichas en la esquina opuesta.</li>
      </ul>
    </section>
  );
}
