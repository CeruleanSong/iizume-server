require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'

module Controller
	module Api
		class MangaController < Grape::API
			get '/' do
				manga = Source::Manga::Chapter.new(0, 'google.ca', '', '0', 'google')
				manga.add_page 'hello world!'
				return manga.to_json()
			end
		end
	end
end