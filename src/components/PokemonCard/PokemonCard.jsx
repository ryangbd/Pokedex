import './PokemonCard.css'

export default function PokemonCard({ number, name, types, imageUrl }) {
  return (
    <article className="pokemon-card">
      <span className="pokemon-number">#{number}</span>
      <img
        className="pokemon-icon"
        src={imageUrl}
        alt=""
        width="96"
        height="96"
        loading="lazy"
        decoding="async"
      />
      <h2>{name}</h2>
      <ul className="pokemon-types" aria-label="Tipos">
        {types.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </article>
  )
}
