module Model
	module Source
		class Manga
			def initialize(origin, title, authors, description)
				@origin = origin
				@title = title
				@authors = authors
				@description = description
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