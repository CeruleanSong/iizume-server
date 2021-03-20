module Source
	class Scraper
		def initialize
			@origin = 'https://mangasee123.com'
			@name = 'mangasee123'
			@alias = 'mangasee'
		end
		
		def getOperations
			{
				"operations": [
					'latest',
					'hot'
				]
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

		def getLatest
		end

		def getHot
		end
	end
end