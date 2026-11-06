const apiUrl = 'https://graphql.pokeapi.co/v1beta2'
const artworkUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const typeLabels = {
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  grass: 'Planta',
  poison: 'Veneno',
  fire: 'Fogo',
  water: 'Água',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
}

export async function fetchPokemon(signal) {
  const query = `
    {
      pokemon(where: {is_default: {_eq: true}}, order_by: {id: asc}) {
        id
        name
        pokemonspecy {
          id
          generation_id
          evolution_chain_id
          order
        }
        pokemontypes(order_by: {slot: asc}) {
          type { name }
        }
        pokemonstats(order_by: {stat_id: asc}) {
          base_stat
          stat { name }
        }
      }
      megaPokemon: pokemon(where: {pokemonforms: {is_mega: {_eq: true}}}, order_by: {id: asc}) {
        id
        name
        pokemonspecy { id }
        pokemontypes(order_by: {slot: asc}) {
          type { name }
        }
      }
    }
  `
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`PokéAPI retornou HTTP ${response.status}`)
  }

  const { data, errors } = await response.json()

  if (errors?.length || !data?.pokemon) {
    throw new Error('A PokéAPI não retornou a lista de Pokémon.')
  }

  const megaFormsBySpecies = new Map()
  for (const { id, name, pokemonspecy, pokemontypes } of data.megaPokemon ?? []) {
    const forms = megaFormsBySpecies.get(pokemonspecy.id) ?? []
    const suffix = name.split('-mega')[1]?.replaceAll('-', ' ').trim().toUpperCase()
    forms.push({
      id,
      label: suffix ? `Mega ${suffix}` : 'Mega',
      types: pokemontypes.map(({ type }) => typeLabels[type.name] ?? type.name),
      imageUrl: `${artworkUrl}/${id}.png`,
      shinyImageUrl: `${artworkUrl}/shiny/${id}.png`,
    })
    megaFormsBySpecies.set(pokemonspecy.id, forms)
  }

  return data.pokemon.map(({ id, name, pokemonspecy, pokemontypes, pokemonstats }) => ({
    number: String(id).padStart(3, '0'),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    generation: String(pokemonspecy.generation_id),
    evolutionChainId: pokemonspecy.evolution_chain_id,
    speciesOrder: pokemonspecy.order,
    imageUrl: `${artworkUrl}/${id}.png`,
    shinyImageUrl: `${artworkUrl}/shiny/${id}.png`,
    megaForms: megaFormsBySpecies.get(pokemonspecy.id) ?? [],
    types: pokemontypes.map(({ type }) => typeLabels[type.name] ?? type.name),
    stats: pokemonstats.map(({ base_stat, stat }) => ({ name: stat.name, value: base_stat })),
  }))
}
