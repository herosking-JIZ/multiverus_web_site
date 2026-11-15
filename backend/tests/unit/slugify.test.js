const slugify = require('../../src/utils/slugify');

describe('Utils: slugify', () => {
  it('should_convert_simple_text_to_lowercase_slug_when_standard_string_provided', () => {
    const input = 'MultiVerus Cloud Platform';
    const result = slugify(input);
    expect(result).toBe('multiverus-cloud-platform');
  });

  it('should_strip_french_accents_when_accented_characters_present', () => {
    const input = 'Développement Numérique & Sécurité Avancée à l\'international';
    const result = slugify(input);
    expect(result).toBe('developpement-numerique-securite-avancee-a-linternational');
  });

  it('should_replace_multiple_spaces_and_underscores_with_single_hyphen_when_whitespace_is_irregular', () => {
    const input = 'Service   Special___Conseil   Audit';
    const result = slugify(input);
    expect(result).toBe('service-special-conseil-audit');
  });

  it('should_strip_leading_and_trailing_hyphens_when_symbols_appear_at_boundaries', () => {
    const input = '---Audit Cyber---';
    const result = slugify(input);
    expect(result).toBe('audit-cyber');
  });

  it('should_return_empty_string_when_text_has_only_symbols_or_spaces', () => {
    const input = '??? !!! @@@';
    const result = slugify(input);
    expect(result).toBe('');
  });
});
