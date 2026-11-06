import PokemonStats from '../PokemonStats/PokemonStats.jsx'
import PokemonEvolutions from '../PokemonEvolutions/PokemonEvolutions.jsx'
import PokemonBackdrop from '../PokemonBackdrop/PokemonBackdrop.jsx'
import './PokemonDetails.css'

export default function PokemonDetails({
  selectedPokemon,
  previousPokemon,
  nextPokemon,
  evolutionFamily,
  selectPokemon,
  megaFormId,
  setMegaFormId,
}) {
  const megaForm = selectedPokemon?.megaForms.find((form) => form.id === megaFormId)
  const displayedForm = megaForm ?? selectedPokemon
  const types = displayedForm?.types ?? selectedPokemon?.types

  return (
    <aside
      className="pokemon-details"
      data-selected={Boolean(selectedPokemon)}
      aria-label="Pokémon selecionado"
      aria-live="polite"
    >
      {selectedPokemon ? (
        <>
          <PokemonBackdrop type={types[0]} />
          <img
            className="pokemon-details-icon"
            src={displayedForm.imageUrl}
            alt={megaForm ? `${selectedPokemon.name} · ${megaForm.label}` : selectedPokemon.name}
            width="400"
            height="400"
          />
          <div className="pokemon-details-controls">
            <div className="pokemon-details-navigation">
              <button
                type="button"
                aria-label="Pokémon anterior"
                disabled={!previousPokemon}
                onClick={() => selectPokemon(previousPokemon)}
              >
                <span aria-hidden="true">‹</span>
              </button>
              <button
                type="button"
                aria-label="Próximo Pokémon"
                disabled={!nextPokemon}
                onClick={() => selectPokemon(nextPokemon)}
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>
            {selectedPokemon.megaForms.length > 0 && (
              <select
                className="pokemon-form-select"
                aria-label="Forma do Pokémon"
                value={megaFormId ?? ''}
                onChange={(event) => setMegaFormId(Number(event.target.value) || null)}
              >
                <option value="">Forma normal</option>
                {selectedPokemon.megaForms.map((form) => (
                  <option key={form.id} value={form.id}>{form.label}</option>
                ))}
              </select>
            )}
          </div>
          <header className="pokemon-details-header">
            <div className="pokemon-details-title">
              <h2>{selectedPokemon.name}</h2>
            </div>
            <p className="pokemon-details-number">#{selectedPokemon.number} · Geração {selectedPokemon.generation}</p>
            <ul className="pokemon-details-types" aria-label="Tipos">
              {types.map((type) => <li key={type}>{type}</li>)}
            </ul>
          </header>
          <PokemonStats stats={selectedPokemon.stats} />
          <PokemonEvolutions
            evolutionFamily={evolutionFamily}
            selectedNumber={selectedPokemon.number}
            onSelect={selectPokemon}
          />
        </>
      ) : (
        <p>Selecione um Pokémon para exibi-lo aqui.</p>
      )}
    </aside>
  )
}
