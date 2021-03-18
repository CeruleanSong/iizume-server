module Controller
	module Api
		class MangaController < Grape::API
			prefix :manga

			get '/' do
				{ Hello: 'World!' }
			end
		end
	end
end