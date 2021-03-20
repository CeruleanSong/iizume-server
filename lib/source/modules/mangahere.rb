module Source
	class Scraper
		def initialize
			@origin = 'http://www.mangahere.cc/'
			@name = 'mangahere'
			@alias = 'mangahere'
		end
		
		def getOperations
			{
				
			}
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