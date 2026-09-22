/**
 * Extrait et normalise les paramètres de pagination depuis req.query.
 * page: défaut 1, min 1
 * limit: défaut 20, min 1, max 100
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Formate une réponse paginée standardisée.
 */
const paginatedResponse = (data, total, page, limit) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});

module.exports = { getPagination, paginatedResponse };
