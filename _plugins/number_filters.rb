# {{ 12345 | number_with_delimiter }} → "12,345" (used by the footer's word count).
# Jekyll doesn't include this filter, so it's defined here.

module NumberFilters
  def number_with_delimiter(number, delimiter = ",")
    number.to_s.reverse.scan(/\d{1,3}/).join(delimiter).reverse
  end
end

Liquid::Template.register_filter(NumberFilters)
