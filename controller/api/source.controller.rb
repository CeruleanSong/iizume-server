require "json-schema"

require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'
require_relative '../../lib/source/source_list'

module Controller
	module Api
		class SourceController < Grape::API
			prefix :source

			desc 'Get all sources'
			route :any, '/' do
				sources = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled).all
				return sources
			end

			desc 'Get source info by source id or alias'
			route :any, '/:source_id' do
				source = $DB[:source]
				.where(Sequel.or(alias: params[:source_id], source_id: params[:source_id]))
				.select(:source_id, :origin, :alias, :enabled).first
				return source
			end
			
			desc 'Get latest manga from source'
			route :any, '/:source_id/latest' do
				begin
					options = {
						page: params[:page] && Integer(params[:page]) > 0 ? (Integer(params[:page]) - 1) : 0,
						limit: params[:limit] && Integer(params[:limit]) > 0 ? Integer(params[:limit]) : 30
					}
				rescue
					return "invalid body?"
				end

				latest_list = $DB.fetch("
					SELECT 
						source_id,
						manga_id,
						chapter_id,
						chapter_n,
						title,
						cover,
						MAX(T3.released) AS released,
						updated
					FROM
						(SELECT 
							T2.*, source.source_id
						FROM
							(SELECT 
							T1.*, manga.title, manga.cover
						FROM
							(SELECT 
							manga_chapter.manga_id,
								chapter.chapter_id,
								chapter_n,
								released,
								updated
						FROM
							chapter
						LEFT JOIN manga_chapter ON chapter.chapter_id = manga_chapter.chapter_id) AS T1
						LEFT JOIN manga ON T1.manga_id = manga.manga_id) AS T2
						LEFT JOIN source_manga ON T2.manga_id = source_manga.manga_id
						LEFT JOIN `source` ON source_manga.source_id = source.source_id) AS T3
					GROUP BY manga_id , chapter_id
					ORDER BY T3.released , T3.updated DESC
					LIMIT ? OFFSET ?
				", options[:limit], options[:page]*options[:limit])
				
				return latest_list.all
			end
		end
	end
end