import './PokemonCard.css'

export default function PokemonCard({ number, name, types }) {
  return (
    <article className="pokemon-card">
      <span className="pokemon-number">#{number}</span>
      <h2>{name}</h2>
      <ul className="pokemon-types" aria-label="Tipos">
        {types.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </article>
  )
}
