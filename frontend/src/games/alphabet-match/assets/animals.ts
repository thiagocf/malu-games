import type { Animal } from '../game/types'

import abelha from './animals/abelha.jpeg'
import aguia from './animals/aguia.jpeg'
import alce from './animals/alce.jpeg'
import baleia from './animals/baleia.jpeg'
import beijaFlor from './animals/beija-flor.jpeg'
import besouro from './animals/besouro.jpeg'
import borboleta from './animals/borboleta.jpeg'
import burro from './animals/burro.jpeg'
import cachorro from './animals/cachorro.jpeg'
import cavalo from './animals/cavalo.jpeg'
import cobra from './animals/cobra.jpeg'
import coelho from './animals/coelho.jpeg'
import dinossauro from './animals/dinossauro.jpeg'
import elefante from './animals/elefante.jpeg'
import esquilo from './animals/esquilo.jpeg'
import estrelaDoMar from './animals/estrela-do-mar.jpeg'
import flamingo from './animals/flamingo.jpeg'
import foca from './animals/foca.jpeg'
import formiga from './animals/formiga.jpeg'
import gato from './animals/gato.jpeg'
import girafa from './animals/girafa.jpeg'
import hamster from './animals/hamster.jpeg'
import hiena from './animals/hiena.jpeg'
import hipopotamo from './animals/hipopotamo.jpeg'
import iguana from './animals/iguana.jpeg'
import jacare from './animals/jacaré.jpeg'
import joaninha from './animals/joaninha.jpeg'
import leao from './animals/leao.jpeg'
import lobo from './animals/lobo.jpeg'
import lontra from './animals/lontra.jpeg'
import macaco from './animals/macaco.jpeg'
import minhoca from './animals/minhoca.jpeg'
import morcego from './animals/morcego.jpeg'
import mosquito from './animals/mosquito.jpeg'
import onca from './animals/onça.jpeg'
import ornitorrinco from './animals/ornitorrinco.jpeg'
import ovelha from './animals/ovelha.jpeg'
import pato from './animals/pato.jpeg'
import peixe from './animals/peixe.jpeg'
import porco from './animals/porco.jpeg'
import quati from './animals/quati.jpeg'
import queroQuero from './animals/quero-quero.jpeg'
import raposa from './animals/raposa.jpeg'
import rato from './animals/rato.jpeg'
import rinoceronte from './animals/rinoceronte.jpeg'
import sapo from './animals/sapo.jpeg'
import suricato from './animals/suricato.jpeg'
import tartaruga from './animals/tartaruga.jpeg'
import tigre from './animals/tigre.jpeg'
import touro from './animals/touro.jpeg'
import tucanucu from './animals/tucanuçu.jpeg'
import urso from './animals/urso.jpeg'
import urubu from './animals/urubu.jpeg'
import vaca from './animals/vaca.jpeg'
import veado from './animals/veado.jpeg'
import zebra from './animals/zebra.jpeg'

export const ANIMALS: Animal[] = [
  { id: 'abelha',         label: 'Abelha',         imagePath: abelha,        firstLetter: 'A', gender: 'F' },
  { id: 'aguia',          label: 'Águia',          imagePath: aguia,         firstLetter: 'A', gender: 'F' },
  { id: 'alce',           label: 'Alce',           imagePath: alce,          firstLetter: 'A', gender: 'M' },
  { id: 'baleia',         label: 'Baleia',         imagePath: baleia,        firstLetter: 'B', gender: 'F' },
  { id: 'beija-flor',     label: 'Beija-flor',     imagePath: beijaFlor,     firstLetter: 'B', gender: 'M' },
  { id: 'besouro',        label: 'Besouro',        imagePath: besouro,       firstLetter: 'B', gender: 'M' },
  { id: 'borboleta',      label: 'Borboleta',      imagePath: borboleta,     firstLetter: 'B', gender: 'F' },
  { id: 'burro',          label: 'Burro',          imagePath: burro,         firstLetter: 'B', gender: 'M' },
  { id: 'cachorro',       label: 'Cachorro',       imagePath: cachorro,      firstLetter: 'C', gender: 'M' },
  { id: 'cavalo',         label: 'Cavalo',         imagePath: cavalo,        firstLetter: 'C', gender: 'M' },
  { id: 'cobra',          label: 'Cobra',          imagePath: cobra,         firstLetter: 'C', gender: 'F' },
  { id: 'coelho',         label: 'Coelho',         imagePath: coelho,        firstLetter: 'C', gender: 'M' },
  { id: 'dinossauro',     label: 'Dinossauro',     imagePath: dinossauro,    firstLetter: 'D', gender: 'M' },
  { id: 'elefante',       label: 'Elefante',       imagePath: elefante,      firstLetter: 'E', gender: 'M' },
  { id: 'esquilo',        label: 'Esquilo',        imagePath: esquilo,       firstLetter: 'E', gender: 'M' },
  { id: 'estrela-do-mar', label: 'Estrela-do-mar', imagePath: estrelaDoMar,  firstLetter: 'E', gender: 'F' },
  { id: 'flamingo',       label: 'Flamingo',       imagePath: flamingo,      firstLetter: 'F', gender: 'M' },
  { id: 'foca',           label: 'Foca',           imagePath: foca,          firstLetter: 'F', gender: 'F' },
  { id: 'formiga',        label: 'Formiga',        imagePath: formiga,       firstLetter: 'F', gender: 'F' },
  { id: 'gato',           label: 'Gato',           imagePath: gato,          firstLetter: 'G', gender: 'M' },
  { id: 'girafa',         label: 'Girafa',         imagePath: girafa,        firstLetter: 'G', gender: 'F' },
  { id: 'hamster',        label: 'Hamster',        imagePath: hamster,       firstLetter: 'H', gender: 'M' },
  { id: 'hiena',          label: 'Hiena',          imagePath: hiena,         firstLetter: 'H', gender: 'F' },
  { id: 'hipopotamo',     label: 'Hipopótamo',     imagePath: hipopotamo,    firstLetter: 'H', gender: 'M' },
  { id: 'iguana',         label: 'Iguana',         imagePath: iguana,        firstLetter: 'I', gender: 'F' },
  { id: 'jacare',         label: 'Jacaré',         imagePath: jacare,        firstLetter: 'J', gender: 'M' },
  { id: 'joaninha',       label: 'Joaninha',       imagePath: joaninha,      firstLetter: 'J', gender: 'F' },
  { id: 'leao',           label: 'Leão',           imagePath: leao,          firstLetter: 'L', gender: 'M' },
  { id: 'lobo',           label: 'Lobo',           imagePath: lobo,          firstLetter: 'L', gender: 'M' },
  { id: 'lontra',         label: 'Lontra',         imagePath: lontra,        firstLetter: 'L', gender: 'F' },
  { id: 'macaco',         label: 'Macaco',         imagePath: macaco,        firstLetter: 'M', gender: 'M' },
  { id: 'minhoca',        label: 'Minhoca',        imagePath: minhoca,       firstLetter: 'M', gender: 'F' },
  { id: 'morcego',        label: 'Morcego',        imagePath: morcego,       firstLetter: 'M', gender: 'M' },
  { id: 'mosquito',       label: 'Mosquito',       imagePath: mosquito,      firstLetter: 'M', gender: 'M' },
  { id: 'onca',           label: 'Onça',           imagePath: onca,          firstLetter: 'O', gender: 'F' },
  { id: 'ornitorrinco',   label: 'Ornitorrinco',   imagePath: ornitorrinco,  firstLetter: 'O', gender: 'M' },
  { id: 'ovelha',         label: 'Ovelha',         imagePath: ovelha,        firstLetter: 'O', gender: 'F' },
  { id: 'pato',           label: 'Pato',           imagePath: pato,          firstLetter: 'P', gender: 'M' },
  { id: 'peixe',          label: 'Peixe',          imagePath: peixe,         firstLetter: 'P', gender: 'M' },
  { id: 'porco',          label: 'Porco',          imagePath: porco,         firstLetter: 'P', gender: 'M' },
  { id: 'quati',          label: 'Quati',          imagePath: quati,         firstLetter: 'Q', gender: 'M' },
  { id: 'quero-quero',    label: 'Quero-quero',    imagePath: queroQuero,    firstLetter: 'Q', gender: 'M' },
  { id: 'raposa',         label: 'Raposa',         imagePath: raposa,        firstLetter: 'R', gender: 'F' },
  { id: 'rato',           label: 'Rato',           imagePath: rato,          firstLetter: 'R', gender: 'M' },
  { id: 'rinoceronte',    label: 'Rinoceronte',    imagePath: rinoceronte,   firstLetter: 'R', gender: 'M' },
  { id: 'sapo',           label: 'Sapo',           imagePath: sapo,          firstLetter: 'S', gender: 'M' },
  { id: 'suricato',       label: 'Suricato',       imagePath: suricato,      firstLetter: 'S', gender: 'M' },
  { id: 'tartaruga',      label: 'Tartaruga',      imagePath: tartaruga,     firstLetter: 'T', gender: 'F' },
  { id: 'tigre',          label: 'Tigre',          imagePath: tigre,         firstLetter: 'T', gender: 'M' },
  { id: 'touro',          label: 'Touro',          imagePath: touro,         firstLetter: 'T', gender: 'M' },
  { id: 'tucanucu',       label: 'Tucanuçu',       imagePath: tucanucu,      firstLetter: 'T', gender: 'M' },
  { id: 'urso',           label: 'Urso',           imagePath: urso,          firstLetter: 'U', gender: 'M' },
  { id: 'urubu',          label: 'Urubu',          imagePath: urubu,         firstLetter: 'U', gender: 'M' },
  { id: 'vaca',           label: 'Vaca',           imagePath: vaca,          firstLetter: 'V', gender: 'F' },
  { id: 'veado',          label: 'Veado',          imagePath: veado,         firstLetter: 'V', gender: 'M' },
  { id: 'zebra',          label: 'Zebra',          imagePath: zebra,         firstLetter: 'Z', gender: 'F' },
]
