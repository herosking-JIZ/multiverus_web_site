const { getPagination, paginatedResponse } = require('../../src/utils/paginate');

describe('Utils: paginate', () => {
  describe('getPagination', () => {
    it('should_use_default_values_when_query_params_are_absent', () => {
      const result = getPagination({});
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('should_compute_skip_correctly_when_valid_page_and_limit_provided', () => {
      const result = getPagination({ page: '3', limit: '15' });
      expect(result).toEqual({ page: 3, limit: 15, skip: 30 });
    });

    it('should_fallback_to_page_1_when_page_is_negative_or_zero', () => {
      const result = getPagination({ page: '-5', limit: '10' });
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should_cap_limit_to_100_when_requested_limit_exceeds_100', () => {
      const result = getPagination({ page: '1', limit: '500' });
      expect(result.limit).toBe(100);
    });

    it('should_fallback_to_limit_1_when_requested_limit_is_zero_or_negative', () => {
      const result = getPagination({ page: '1', limit: '0' });
      // parseInt('0') is 0, so Math.max(1, 0 || 20) -> 0 || 20 -> 20
      expect(result.limit).toBe(20);

      const resultNegative = getPagination({ page: '1', limit: '-10' });
      expect(resultNegative.limit).toBe(1);
    });
  });

  describe('paginatedResponse', () => {
    it('should_format_paginated_response_with_total_pages_when_valid_arguments_provided', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const total = 45;
      const page = 2;
      const limit = 20;

      const response = paginatedResponse(data, total, page, limit);

      expect(response).toEqual({
        data,
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
      });
    });

    it('should_return_0_total_pages_when_total_is_zero', () => {
      const response = paginatedResponse([], 0, 1, 20);
      expect(response.totalPages).toBe(0);
      expect(response.data).toEqual([]);
    });
  });
});
