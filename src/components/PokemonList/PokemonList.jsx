import PokemonCard from '../PokemonCard/PokemonCard.jsx'
import './PokemonList.css'

export default function PokemonList({ pokemon, selectedNumber, onSelect }) {
  return (
    <section className="pokemon-results" aria-label="Catálogo">
      <h1>Pokédex</h1>
      <p className="pokemon-results-count">{pokemon.length} Pokémon</p>
      <div className="pokemon-list-scroll" role="region" aria-label="Lista de Pokémon" tabIndex={0}>
        {pokemon.length === 0 ? (
          <p role="status">Nenhum Pokémon encontrado.</p>
        ) : (
          <div className="pokemon-grid">
            {pokemon.map((entry) => (
              <PokemonCard
                key={entry.number}
                number={entry.number}
                name={entry.name}
                types={entry.types}
                imageUrl={entry.imageUrl}
                selected={selectedNumber === entry.number}
                onSelect={() => onSelect(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
