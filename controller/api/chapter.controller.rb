require_relative '../../lib/source/manga/chapter'
require_relative '../../lib/source/manga/manga'

module Controller
	module Api
		class ChapterController < Grape::API
			prefix :chapter

			desc 'Get chapters in manga by manga id.'
			route [:get, :post], '/:manga_id' do
				return "todo"
			end
			
			desc 'Get pages in chapter by manga id and chapter id.'
			route [:get, :post], '/:manga_id/:chapter_id' do
				return "todo"
			end
		end
	end
end