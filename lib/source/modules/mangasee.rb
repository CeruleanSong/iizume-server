require 'nokogiri'
require 'securerandom'

require_relative '../helper/cache_helper'

module Source
	def self.create(source_id)
		Mangasee.new(source_id)
	end

	class Mangasee
		def initialize(source_id)
			@origin = 'https://mangasee123.com'
			@title = 'mangasee123'
			@alias = 'mangasee'
			@enabled = true
			@source_id = source_id
		end
		
		def getOrigin
			return @origin
		end
		
		def getTitle
			return @title
		end
		
		def getAlias
			return @alias
		end

		def isEnabled
			return @enabled
		end

		def cache_manga(manga_id)
			manga_info = Helper.find_manga_by_title_or_id @source_id, manga_id

			if manga_info
				browser = Ferrum::Browser.new({timeout: 20})
				browser.go_to("#{@origin}#{manga_info[:origin]}")
				# sleep 0.25 # pause to load javascript
				
				doc = Nokogiri::HTML(browser.body)
				rows = doc.css('li.list-group-item')
				
				# alternate name(s) row 
				alt_offset = (rows[2].css("span").text.include? "Alternate") ? 0 : 1
				# offical tl row 
				otl_offset = (rows[7-alt_offset].css("span").text.include? "Official") ? 0 : 1

				manga_cover = doc.css('div.col-3 img')[0]['src']

				manga_author = rows[3-alt_offset].css("a")[0].text
				has_artist = rows[3-alt_offset].css("a").length > 1
				manga_artist = has_artist ? rows[3-alt_offset].css("a")[1].text : nil

				manga_description = rows[10-alt_offset-otl_offset].css("div").text

				tag_list = []
				for tag in rows[4-alt_offset].css("a")
					tag_list << tag.text
				end

				manga_type = rows[5-alt_offset].css("a").text
				manga_released = Time.new(Integer(rows[6-alt_offset].css("a").text))

				status_origin = rows[8-alt_offset-otl_offset].css("a")[0].text
				manga_status_origin = parse_chapter_status(status_origin)
				status_scan = rows[8-alt_offset-otl_offset].css("a")[1].text
				manga_status_scan = parse_chapter_status(status_scan)

				$DB.transaction do
					$DB[:manga]
					.where(manga_id: manga_id)
					.update({
						manga_id: manga_info[:manga_id],
						author: manga_author,
						artist: manga_artist,
						description: manga_description,
						status_origin: manga_status_origin,
						status_scan: manga_status_scan,
						type: manga_type,
						released: manga_released,
						partial: false,
						updated: DateTime.now
					})

					Helper.store_tags(manga_id, tag_list)
				end
			else
				return nil
			end
		end

		def cache_manga_chapters(manga_id)
			manga_info = Helper.find_manga_by_title_or_id @source_id, manga_id

			if manga_info
				browser = Ferrum::Browser.new({timeout: 20})
				browser.go_to("#{@origin}#{manga_info[:origin]}")
				sleep 0.05 # pause to load javascript

				browser.execute('document.getElementsByClassName(\'ShowAllChapters\')[0].click()')
				sleep 0.25 # pause to load javascript

				doc = Nokogiri::HTML(browser.body)
				rows = doc.css('.ChapterLink')
				for chapter in rows
					chapter_origin = chapter[:href]
					chapter_number = parse_chapter_number(chapter.css('span')[0].text.strip)
					scape_release = chapter.css('div')[0].text.strip

					if scape_release.split(/\//).length > 1
						release_parts = scape_release.split(/\//)
						chapter_release = Date.new(
							Float(release_parts[2]),
							Float(release_parts[0]),
							Float(release_parts[1])
						)
					else
						chapter_release = parse_chapter_release(scape_release)
					end

					chapter_info = Helper.find_chapter_by_number(manga_id, chapter_number)
					chapter_id = chapter_info ? chapter_info[:chapter_id] : SecureRandom.hex(8)
					if !chapter_info
						Helper.store_manga_chapter(manga_id, {
							chapter_id: chapter_id,
							origin: chapter_origin,
							chapter_n: chapter_number,
							released: chapter_release,
							updated: DateTime.now
						})
					end
				end
			end
		end

		def cache_latest(n_page = 2)
			browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
			browser.go_to("#{@origin}")
			sleep 0.05 # pause to load javascript

			for index in 0..(n_page > 7 ? 7 : n_page)
				browser.execute('document.getElementsByClassName(\'ViewMore\')[0].click()')
			end
			sleep 0.05 # pause to load javascript

			manga_info_list = []

			doc = Nokogiri::HTML(browser.body)
			row = doc.css('div.LatestChapters div.row.Chapter')
			for item in row
				manga_origin = item.css('div.Image a')[0]['href'].strip
				manga_cover = item.css('div.Image a img')[0]['src'].strip
				manga_title = item.css('div.Label .SeriesName').text.strip

				scrape_chapter = item.css('div.Label .ChapterLabel').text.strip
				scrape_chapter_release = item.css('div.Label .DateLabel').text.strip
				chapter_origin = item.css('div.Label a')[0]['href'].strip

				chapter_number = parse_chapter_number(scrape_chapter)
				chapter_release = parse_chapter_release(scrape_chapter_release)

				$DB.transaction do
					manga_info = Helper.find_manga_by_title(@source_id, manga_title)
					manga_id = manga_info ? manga_info[:manga_id] : SecureRandom.hex(8)
					if manga_info
						$DB[:manga]
						.where(manga_id: manga_id)
						.update({
							manga_id: manga_id,
							cover: manga_cover,
							updated: DateTime.now
						})
					else
						Helper.store_manga(@source_id, {
							manga_id: manga_id,
							origin: manga_origin,
							cover: manga_cover,
							title: manga_title
						})
					end

					chapter_info = Helper.find_chapter_by_number(manga_id, chapter_number)
					chapter_id = chapter_info ? chapter_info[:chapter_id] : SecureRandom.hex(8)
					if !chapter_info
						Helper.store_manga_chapter(manga_id, {
							chapter_id: chapter_id,
							origin: chapter_origin,
							chapter_n: chapter_number,
							released: chapter_release,
							updated: DateTime.now
						})
					end
				end
			end
		end

		def parse_chapter_number(chapter_n)
			chapter_number = chapter_n.split(' ')
			return begin Float(chapter_number[1]) rescue 0 end
		end

		def parse_chapter_release(chapter_r)
			release_string = chapter_r.split(' ', 2)
			string_n = release_string[0]
			frame = release_string[1].split[0]
			number = begin Integer(string_n) rescue false end

			if number
				if frame.include? "minute"
					return Time.now - number
				elsif frame.include? "hour"
					return Time.now - (number*(60*60))
				elsif frame.include? "day"
					return Time.now - (number*(60*60*24))
				else
					return Time.now
				end
			else
				if frame.include? "hour"
					return Time.now - (60*60)
				elsif frame.include? "day"
					return Time.now - (60*60*24)
				end
			end
		end

		def parse_chapter_status(status_t)
			if status_t.include?('Cancelled')
				return "cancelled"
			elsif status_t.include?('Complete')
				return "complete"
			elsif status_t.include?('Discontinued')
				return "discontinued"
			elsif status_t.include?('Hiatus')
				return "hiatus"
			elsif status_t.include?('Ongoing')
				return "ongoing"
			else
				return "unknown"
			end
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

			current = 0
			completed = []
			for page in page_list
				current+=1
				if current < 890
					next
				end
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
					else
						next
					end
				end
				File.open("db/log_cache_all.json","w") do |f|
					f.write(completed.to_json)
				end
			end
		end

		def getLatest(page, limit)
			$DB[:latest_manga]
			.where(source_id: @source_id)
			.limit(limit, page)
			.all
		end

		def getManga(manga_id)
			return @origin
		end
	end
end