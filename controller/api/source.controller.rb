require "json-schema"

require_relative '../../lib/source/manga/chapter'
require_relative '../../lib/source/manga/manga'
require_relative '../../lib/source/source_list'
require_relative '../../lib/schema/latest'

module Controller
	module Api
		class SourceController < Grape::API
			prefix :source

			route :any, '/' do
				sources = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled).all
				return sources
			end

			route :any, '/:source' do
				source = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled)
				.where(Sequel.or(alias: params[:source], source_id: params[:source]))
				.first
				return source
			end
			
			route :any, '/:source/latest' do
				source = $DB[:source]
				.select(:alias)
				.where(Sequel.or(alias: params[:source], source_id: params[:source]))
				.first

				begin
					req = {
						page: params[:page] ? Integer(params[:page]) : 1,
						limit: params[:limit] ? Integer(params[:limit]) : 30
					}
				rescue
					return "invalid body?"
				end

				_source = Source::SourceList::getSource(source[:alias])
				return _source.getLatest(req[:page], req[:limit])
			end
		end
	end
end