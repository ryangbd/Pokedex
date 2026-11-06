import PokemonCard from './PokemonCard.jsx'

const pokemon = [
  { number: '001', name: 'Bulbasaur', types: ['Planta', 'Veneno'] },
  { number: '004', name: 'Charmander', types: ['Fogo'] },
  { number: '007', name: 'Squirtle', types: ['Água'] },
]

export default function App() {
  return (
    <main>
      <h1>Pokédex</h1>
      <p>Um catálogo de Pokémon.</p>
      <div className="pokemon-grid">
        {pokemon.map((entry) => (
          <PokemonCard key={entry.number} {...entry} />
        ))}
      </div>
    </main>
  )
}
