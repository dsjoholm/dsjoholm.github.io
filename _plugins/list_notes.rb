# Short notes on list items (the _lists folder). In a list, write
#
#   - Drive (2011) - A note about it, a sentence or two.
#
# and the part after " - " (or " – ", " — ") goes on its own line under the
# title, in smaller grey text. Items without a dash are left as they are.
# (bin/lock-lists uses this too, for locked lists.)

module ListNotes
  def self.apply(html)
    html.gsub(%r{<li>(.*?)</li>}m) do
      item = Regexp.last_match(1)
      title, note = item.split(/\s+[-–—]\s+/, 2)
      note ? %(<li>#{title.strip}<span class="list-note">#{note.strip}</span></li>) : "<li>#{item}</li>"
    end
  end
end

if defined?(Jekyll::Hooks)
  Jekyll::Hooks.register :lists, :post_convert do |doc|
    doc.content = ListNotes.apply(doc.content)
  end
end
