import './PokemonBackdrop.css'

const typeColors = {
  Normal: '#aca48b',
  Lutador: '#c45042',
  Voador: '#90a6e7',
  Planta: '#6bb449',
  Veneno: '#a358bd',
  Fogo: '#ed693b',
  Água: '#4a94e8',
  Terra: '#ba8a52',
  Pedra: '#a99156',
  Inseto: '#99af38',
  Fantasma: '#7763a9',
  Aço: '#8eacbe',
  Elétrico: '#e7be3d',
  Psíquico: '#e16292',
  Gelo: '#79cbd9',
  Dragão: '#7764e7',
  Sombrio: '#8b6a72',
  Fada: '#de8dbc',
}

export default function PokemonBackdrop({ type }) {
  return (
    <div
      className="pokemon-backdrop"
      style={{ '--pokemon-type-color': typeColors[type] ?? typeColors.Normal }}
      aria-hidden="true"
    />
  )
}
