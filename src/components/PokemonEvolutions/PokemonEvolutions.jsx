import './PokemonEvolutions.css'

export default function PokemonEvolutions({ evolutionFamily, selectedNumber, onSelect }) {
  if (evolutionFamily.length <= 1) return null

  return (
    <ul className="pokemon-evolutions" aria-label="Linha evolutiva">
      {evolutionFamily.map((entry) => (
        <li key={entry.number}>
          <button
            type="button"
            aria-label={entry.name}
            aria-pressed={entry.number === selectedNumber}
            title={entry.name}
            onClick={() => onSelect(entry)}
          >
            <img src={entry.imageUrl} alt="" width="48" height="48" />
          </button>
        </li>
      ))}
    </ul>
  )
}
