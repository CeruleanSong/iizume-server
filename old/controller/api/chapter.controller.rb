require 'securerandom'
require 'json'
require 'net/http'

require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'

module Controller
	module Api
		class ChapterController < Grape::API
			desc 'Get chapters in manga by manga id.'
			route [:get, :post], '/manga/:manga_id' do
				source_id = $DB[:manga_by_source][manga_id: params[:manga_id]][:source_id]
				source_alias = $DB[:source][source_id: source_id][:alias]
				if params[:recache]
					new_job = {
						job_id: SecureRandom.hex(8),
						type: "CACHE_MANGA_CHAPTERS",
						target: params[:manga_id],
					}
					$DB[:job]
					.insert(new_job)
					Net::HTTP.post_form(URI('http://localhost:3001/job'), new_job)
				end
				return $DB.fetch("
					SELECT * FROM chapter_by_manga
					WHERE manga_id = ?
					ORDER BY chapter_n
				", 
				params[:manga_id]).all
			end
			
			desc 'Get pages in chapter by manga id and chapter id.'
			route [:get, :post], '/:manga_id/:chapter_id' do
				return "todo"
			end
		end
	end
end