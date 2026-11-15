/**
 * Convertit un texte en slug URL-friendly.
 * Gère les accents français et caractères spéciaux.
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/[^a-z0-9\s_-]/g, '')   // garde alphanumérique, espaces, tirets et underscores
    .replace(/[\s_]+/g, '-')          // espaces/underscores → tirets
    .replace(/-+/g, '-')              // tirets multiples → un seul
    .replace(/^-|-$/g, '');           // supprime tirets en début/fin
};

module.exports = slugify;
