require "json-schema"

require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'
require_relative '../../lib/source/source_list'
require_relative '../../lib/source/helper/source_helper'

module Controller
	module Api
		class SourceController < Grape::API
			get '/' do
				_sources = $DB[:source]
				.select(:source_id, :origin, :alias, :enabled).all
				return _sources
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
				return Helper::Source.get_latest(options[:page], options[:limit]).all
			end
		end
	end
end