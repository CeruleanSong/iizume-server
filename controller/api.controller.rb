require_relative 'api/manga.controller'
require_relative 'api/source.controller'

module Controller
	class ApiController < Grape::API
		version 'v1', using: :header, vendor: 'iizu.me'
		format :json
		
		desc 'Get manga.'
		mount Api::MangaController

		desc 'Use sources.'
		mount Api::SourceController
	end
end