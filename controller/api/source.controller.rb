require_relative '../../lib/manga/chapter'
require_relative '../../lib/manga/manga'
require_relative '../../lib/source/source_list'

module Controller
	module Api
		class SourceController < Grape::API
			prefix :source

			get '/' do
				_sources = Source::SourceList::getSourceTypes
				return { sources: _sources }
			end

			get '/:source' do
				_source = Source::SourceList::getSourceList[params[:source]]
				return _source.getOperations
			end
			
			get '/:source/latest' do
				_source = Source::SourceList::getSourceList[params[:source]]
				return _source.getLatest
			end
		end
	end
end