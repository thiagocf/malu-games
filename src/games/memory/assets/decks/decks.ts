import type { Animal, DeckConfig } from '../../game/types'

const ANIMALS_ITEMS: Animal[] = [
  { id: 'dog',     emoji: '🐶', label: 'Cachorro' },
  { id: 'cat',     emoji: '🐱', label: 'Gato'     },
  { id: 'frog',    emoji: '🐸', label: 'Sapo'     },
  { id: 'lion',    emoji: '🦁', label: 'Leão'     },
  { id: 'rabbit',  emoji: '🐰', label: 'Coelho'   },
  { id: 'bear',    emoji: '🐻', label: 'Urso'     },
  { id: 'penguin', emoji: '🐧', label: 'Pinguim'  },
  { id: 'fox',     emoji: '🦊', label: 'Raposa'   },
]

const FRUITS_ITEMS: Animal[] = [
  { id: 'apple',      emoji: '🍎', label: 'Maçã'     },
  { id: 'orange',     emoji: '🍊', label: 'Laranja'  },
  { id: 'lemon',      emoji: '🍋', label: 'Limão'    },
  { id: 'grapes',     emoji: '🍇', label: 'Uva'      },
  { id: 'strawberry', emoji: '🍓', label: 'Morango'  },
  { id: 'banana',     emoji: '🍌', label: 'Banana'   },
  { id: 'watermelon', emoji: '🍉', label: 'Melancia' },
  { id: 'peach',      emoji: '🍑', label: 'Pêssego'  },
]

const FACES_ITEMS: Animal[] = [
  { id: 'happy',     emoji: '😀', label: 'Feliz'       },
  { id: 'sad',       emoji: '😢', label: 'Triste'      },
  { id: 'angry',     emoji: '😡', label: 'Bravo'       },
  { id: 'surprised', emoji: '😮', label: 'Surpreso'    },
  { id: 'sleepy',    emoji: '😴', label: 'Com sono'    },
  { id: 'thinking',  emoji: '🤔', label: 'Pensativo'   },
  { id: 'love',      emoji: '😍', label: 'Apaixonado'  },
  { id: 'laughing',  emoji: '😂', label: 'Gargalhando' },
]

const VEHICLES_ITEMS: Animal[] = [
  { id: 'car',        emoji: '🚗', label: 'Carro'       },
  { id: 'bus',        emoji: '🚌', label: 'Ônibus'      },
  { id: 'train',      emoji: '🚂', label: 'Trem'        },
  { id: 'airplane',   emoji: '✈️',  label: 'Avião'       },
  { id: 'helicopter', emoji: '🚁', label: 'Helicóptero' },
  { id: 'ship',       emoji: '🚢', label: 'Navio'       },
  { id: 'rocket',     emoji: '🚀', label: 'Foguete'     },
  { id: 'racecar',    emoji: '🏎️',  label: 'Kart'        },
]

const FOODS_ITEMS: Animal[] = [
  { id: 'pizza',    emoji: '🍕', label: 'Pizza'      },
  { id: 'burger',   emoji: '🍔', label: 'Hambúrguer' },
  { id: 'taco',     emoji: '🌮', label: 'Tacos'      },
  { id: 'icecream', emoji: '🍦', label: 'Sorvete'    },
  { id: 'donut',    emoji: '🍩', label: 'Rosquinha'  },
  { id: 'cake',     emoji: '🎂', label: 'Bolo'       },
  { id: 'cookie',   emoji: '🍪', label: 'Biscoito'   },
  { id: 'sandwich', emoji: '🥪', label: 'Sanduíche'  },
]

export const DECKS: DeckConfig[] = [
  { id: 'animals',  name: 'Animais',    emoji: '🐶', items: ANIMALS_ITEMS  },
  { id: 'fruits',   name: 'Frutas',     emoji: '🍎', items: FRUITS_ITEMS   },
  { id: 'faces',    name: 'Expressões', emoji: '😀', items: FACES_ITEMS    },
  { id: 'vehicles', name: 'Veículos',   emoji: '🚗', items: VEHICLES_ITEMS },
  { id: 'foods',    name: 'Alimentos',  emoji: '🍕', items: FOODS_ITEMS    },
]
