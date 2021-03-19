module Model
	module Source
		class Chapter
			def initialize(origin, title, chapter_n, upload_date, scanlator)
				@chapter_n = chapter_n
				@origin = origin
				@title = title
				@upload_date = upload_date
				@scanlator = scanlator
				@page_list = Array.new
			end
			
			def add_page(page)
				@page_list << page
			end

			def to_json(options={})
				{
					chapter_n: @chapter_n,
					origin: @origin,
					title: @title,
					upload_date: @upload_date,
					scanlator: @scanlator
				}
			end
		end
	end
end