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
		end
	end
end