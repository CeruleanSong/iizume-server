require_relative '../../lib/manga/chapter'
require_relative '../../lib/manga/manga'

module Controller
	module Api
		class MangaController < Grape::API
			prefix :manga

			get '/' do
				manga = Model::Source::Chapter.new(0, 'google.ca', '', '0', 'google')
				manga.add_page 'hello world!'
				return manga.to_json()
			end
		end
	end
end