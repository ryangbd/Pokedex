import './PokemonStats.css'

const statLabels = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidade',
}

export default function PokemonStats({ stats }) {
  return (
    <section className="pokemon-stats" aria-label="Status base">
      <h3>Status base</h3>
      {stats.map(({ name, value }) => (
        <div className="pokemon-stat" key={name}>
          <span>{statLabels[name] ?? name}</span>
          <strong>{value}</strong>
          <span className="pokemon-stat-track" aria-hidden="true">
            <span style={{ width: `${Math.min(value / 255 * 100, 100)}%` }} />
          </span>
        </div>
      ))}
    </section>
  )
}
