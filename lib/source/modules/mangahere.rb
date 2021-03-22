module Source
	def self.create
		Mangahere.new
	end

	class Mangahere
		def initialize
			@origin = 'http://www.mangahere.cc'
			@name = 'mangahere'
			@alias = 'mangahere'
			@enabled = false
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

		def isEnabled
			return @enabled
		end
	end
end