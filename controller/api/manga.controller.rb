require_relative '../../lib/source/manga/chapter'
require_relative '../../lib/source/manga/manga'

module Controller
	module Api
		class MangaController < Grape::API
			prefix :manga

			route :any, '/:manga_id' do
				manga = $DB['
					SELECT * FROM manga_from_source
					JOIN tags_from_manga
					ON manga_from_source.manga_id = tags_from_manga.manga_id
					WHERE manga_from_source.manga_id = ?',
					params[:manga_id]
				].first
				return manga
			end

			route :any, '/:manga_id/chapter' do
				manga = $DB[:chapter_from_manga]
				.where(manga_id: params[:manga_id])
				.first
				return manga
			end
		end
	end
end