require_relative 'api/chapter.controller'
require_relative 'api/manga.controller'
require_relative 'api/source.controller'

module Controller
	class ApiController < Grape::API
		version 'v1', using: :header, vendor: 'iizu.me'
		format :json
		
		desc 'Chapter controller.'
		mount Api::ChapterController

		desc 'Manga controller.'
		mount Api::MangaController

		desc 'Source controller.'
		mount Api::SourceController
	end
end