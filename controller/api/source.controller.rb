require "json-schema"

require_relative '../../lib/source/manga/chapter'
require_relative '../../lib/source/manga/manga'
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
				return "todo"
			end
		end
	end
end