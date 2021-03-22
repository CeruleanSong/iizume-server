require_relative '../../lib/source/manga/chapter'
require_relative '../../lib/source/manga/manga'
require_relative '../../lib/source/source_list'

module Controller
	module Api
		class SourceController < Grape::API
			prefix :source

			get '/' do
				sources = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled).all
				return sources
			end

			get '/:source' do
				source = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled)
				.where(Sequel.or(name: params[:source], source_id: params[:source]))
				.first
				return source
			end
			
			get '/:source/latest' do
				source = $DB[:manga]
				_source = Source::SourceList::getSourceList[params[:source]]
				return _source.getLatest
			end
		end
	end
end