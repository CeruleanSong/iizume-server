require_relative '../../lib/source/model/chapter'
require_relative '../../lib/source/model/manga'

module Controller
	module Api
		class MangaController < Grape::API
			get '/' do
				manga = Source::Manga::Chapter.new(0, 'google.ca', '', '0', 'google')
				manga.add_page 'hello world!'
				return manga.to_json()
			end

			desc 'Get latest manga from all sources'
			route :any, '/latest' do
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

			desc 'Get latest manga from a particular source'
			route :any, '/latest/:source_id' do
				begin
					options = {
						page: params[:page] && Integer(params[:page]) > 0 ? (Integer(params[:page]) - 1) : 0,
						limit: params[:limit] && Integer(params[:limit]) > 0 ? Integer(params[:limit]) : 15
					}
				rescue
					return "invalid body?"
				end
				return Helper::Source.get_latest(options[:page], options[:limit], params[:source_id]).all
			end

			desc 'Get a manga by id'
			route :any, '/:manga_id' do
				return $DB[:manga][manga_id: params[:manga_id]]
			end
		end
	end
end