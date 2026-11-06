import PokemonCatalog from '../PokemonCatalog/PokemonCatalog.jsx'
import usePokemon from '../../hooks/usePokemon.js'
import './App.css'

export default function App() {
  const { pokemon, hasError, retry } = usePokemon()

  return (
    <main className="pokedex">
      {hasError ? (
        <div>
          <p role="alert">Não foi possível carregar os Pokémon.</p>
          <button type="button" onClick={retry}>Tentar novamente</button>
        </div>
      ) : pokemon === null ? (
        <p role="status">Carregando Pokémon…</p>
      ) : (
        <PokemonCatalog pokemon={pokemon} />
      )}
    </main>
  )
}
