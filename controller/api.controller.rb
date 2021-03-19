require_relative 'api/manga.controller'

module Controller
	class ApiController < Grape::API
		version 'v1', using: :header, vendor: 'iizu.me'
		format :json
		
		desc 'Get Manga.'
		mount Api::MangaController
	end
end