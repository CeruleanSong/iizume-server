require 'nokogiri'
require 'securerandom'

module Source
	class Scraper
		def initialize
			@origin = 'https://mangasee123.com'
			@name = 'mangasee123'
			@alias = 'mangasee'
			@enabled = true
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

		def isEnabled
			return @enabled
		end

		def cache_all
			browser = Ferrum::Browser.new({timeout: 20})
			browser.go_to("#{@origin}/directory")

			sleep 3 # load javascript

			page_list = []
			dir = Nokogiri::HTML(browser.body)
			dir.css('div.top-15 a').each do |link|
				page_list << {
					link: link['href'],
					title: link.text
				}
			end

			completed = []
			for page in page_list
				retrys = 0
				begin
					source = $DB[:source].where(alias: @alias).first
					
					browser.go_to("#{@origin}#{page[:link]}")
					sleep 1

					manga_page = Nokogiri::HTML(browser.body)
					manga_data = manga_page.css('li.list-group-item')
					
					alt_offset = (manga_data[2].css("span").text.include? "Alternate") ? 0 : 1
					otl_offset = (manga_data[7-alt_offset].css("span").text.include? "Official") ? 0 : 1

					manga_id = SecureRandom.hex(8)
					manga_origin = "#{@origin}#{page[:link]}"
					manga_cover = manga_page.css('div.col-3 img')[0]['src']
					manga_title = page[:title]

					manga_author = manga_data[3-alt_offset].css("a")[0].text
					has_artist = manga_data[3-alt_offset].css("a").length > 1
					manga_artist = has_artist ? manga_data[3-alt_offset].css("a")[1].text : nil

					manga_description = manga_data[10-alt_offset-otl_offset].css("div").text
					
					manga_tags = []
					for tag in manga_data[4-alt_offset].css("a")
						manga_tags << tag.text
					end

					manga_type = manga_data[5-alt_offset].css("a").text
					manga_released = Date.new(Integer(manga_data[6-alt_offset].css("a").text))

					status_origin = manga_data[8-alt_offset-otl_offset].css("a")[0].text
					manga_status_origin = parse_status(status_origin)
					status_scan = manga_data[8-alt_offset-otl_offset].css("a")[1].text
					manga_status_scan = parse_status(status_scan)

					$DB.transaction do
						manga_info = $DB[:manga]
						.where(title: manga_title)
						.join(:source_manga, manga_id: :id)
						.where(source_id: source[:id]).first
						if !manga_info
							$DB[:manga].insert(
								manga_id: manga_id,
								cover: manga_cover,
								title: manga_title,
								author: manga_author,
								artist: manga_artist,
								description: manga_description,
								type: manga_type,
								released: manga_released,
								status_origin: manga_status_origin,
								status_scan: manga_status_scan
							)
							$DB[:source_manga]
							.insert(
								manga_id: $DB[:manga].where(manga_id: manga_id).first[:id],
								source_id: source[:id],
								origin: manga_origin
							)
						else
							$DB[:manga].where(id: manga_info[:id])
							.update(
								cover: manga_cover,
								title: manga_title,
								author: manga_author,
								artist: manga_artist,
								description: manga_description,
								type: manga_type,
								released: manga_released,
								status_origin: manga_status_origin,
								status_scan: manga_status_scan,
								updated: DateTime.now
							)
						end

						manga_info = $DB[:manga]
						.where(title: manga_title)
						.join(:source_manga, manga_id: :id)
						.where(source_id: source[:id]).first

						for tag in manga_tags
							if !$DB[:tag].where(name: tag).first
								$DB[:tag].insert(
									name: tag
								)
							end

							tag_info = $DB[:tag]
							.where(name: tag).first

							manga_tag_info = $DB[:manga]
							.where(id: manga_info[:id])
							.join(:manga_tag, manga_id: :id)
							.where(tag_id: tag_info[:id]).first

							if !manga_tag_info
								$DB[:manga_tag]
								.insert(
									manga_id: manga_info[:id],
									tag_id: tag_info[:id]
								)
							end
						end
					end
					completed << {
						title: manga_title,
						id: manga_info[:id],
						hash: manga_info[:manga_id]
					}
				rescue
					retrys+=1
					if retrys < 3
						retry
					end
				end
				File.open("db/log_cache_all.json","w") do |f|
					f.write(completed.to_json)
				end
			end
		end

		def parse_status(_status)
				if _status.include?('Cancelled')
					return "cancelled"
				elsif _status.include?('Complete')
					return "complete"
				elsif _status.include?('Discontinued')
					return "discontinued"
				elsif _status.include?('Hiatus')
					return "hiatus"
				elsif _status.include?('Ongoing')
					return "ongoing"
				else
					return "unknown"
				end
		end
	end
end