require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'

module Controller
	module Api
		class MangaController < Grape::API
			prefix :manga

			desc 'Get manga info by manga id.'
			route [:get, :post], '/:manga_id' do
				return "todo"
			end
		end
	end
end