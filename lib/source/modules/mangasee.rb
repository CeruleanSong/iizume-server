module Source
	class Scraper
		def initialize
			@origin = 'https://mangasee123.com'
			@name = 'mangasee123'
			@alias = 'mangasee'
		end
		
		def getOrigin
			return @origin
		end
		
		def getName
			return @name
		end
		
		def getAlias
			return @alias
		end
	end
end