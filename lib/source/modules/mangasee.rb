module Source
	class Scraper
		def initialize
			@origin = 'https://mangasee123.com/'
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
			# browser = Ferrum::Browser.new
			# browser.go_to("#{@origin}/")
			# browser.screenshot(path: "google.png")
			# vm.HotUpdateJSON
			_page = Net::HTTP.get URI(@origin)
			_latest_data = _page.match(/\svm\.LatestJSON = (\[\{.*\}\])/)
			return JSON.parse _latest_data[1]
		end

		def getHot
		end
	end
end