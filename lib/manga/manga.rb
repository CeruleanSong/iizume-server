module Model
	module Source
		class Manga
			def initialize(origin, cover, title, author, artist, description,
				tags, type, released, status_origin, status_scan)
				@origin = origin
				@cover = cover
				@title = title
				@author = authors
				@artist = artist
				@description = description
				@tags = tags
				@type = type
				@released = released
				@status_origin = type
				@status_scan = type
				@chapter_list = Array.new
			end

			def addChapter(chapter)
				@page_list << chapter
			end
			
			def to_json(options={})
				{
					origin: @origin,
					title: @title,
					authors: @authors,
					description: @description
				}
			end
		end
	end
end