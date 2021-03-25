require 'nokogiri'
require 'securerandom'

require_relative '../helper/cache_helper'
require_relative '../helper/log_helper'

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
			manga_info = Helper::Cache.find_manga_by_title_or_id @source_id, manga_id

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
				manga_status_origin = parse_manga_status(status_origin)
				status_scan = rows[8-alt_offset-otl_offset].css("a")[1].text
				manga_status_scan = parse_manga_status(status_scan)

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

					Helper::Cache.store_tags(manga_id, tag_list)
				end
			else
				return nil
			end
		end

		def cache_manga_chapters(manga_id)
			manga_info = Helper::Cache.find_manga_by_title_or_id @source_id, manga_id

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

					chapter_info = Helper::Cache.find_chapter_by_number(manga_id, chapter_number)
					chapter_id = chapter_info ? chapter_info[:chapter_id] : SecureRandom.hex(8)
					if !chapter_info
						Helper::Cache.store_manga_chapter(manga_id, {
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

		def cache_latest(n_page)
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
					manga_info = Helper::Cache.find_manga_by_origin_or_title(@source_id, manga_origin, manga_title)
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
						Helper::Cache.store_manga(@source_id, {
							manga_id: manga_id,
							origin: manga_origin,
							cover: manga_cover,
							title: manga_title
						})
					end

					chapter_info = Helper::Cache.find_chapter_by_number(manga_id, chapter_number)
					chapter_id = chapter_info ? chapter_info[:chapter_id] : SecureRandom.hex(8)
					if !chapter_info
						Helper::Cache.store_manga_chapter(manga_id, {
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

		def cache_all(start = 1, limit = 0)
			# print start, " --- ", limit, "\n"
			browser = Ferrum::Browser.new({timeout: 20})
			browser.go_to("#{@origin}/directory")
			sleep 5 # pause to load javascript

			complete_list = []
			fail_list = []
			current_row = 0
			dir = Nokogiri::HTML(browser.body)
			dir.css('div.top-15 a').each do |link|
				if((limit <= 0) || (current_row < (start + limit)))
					current_row+=1
					if(current_row <= start)
						next
					end
				else
					break
				end

				begin
					manga_row = Nokogiri::HTML(link[:title])
					tags_and_status = manga_row.xpath('//div').text.split(':')

					manga_link = link['href']
					manga_title = link.text.strip
					manga_cover = manga_row.xpath('//img')[0][:src]
					manga_status = parse_manga_status(tags_and_status[1])

					manga_data = Helper::Cache.find_manga_by_origin_or_title(@source_id, manga_link, manga_title)

					tag_list = []
					for tag in tags_and_status[2].split(',')
						tag_list << tag.strip
					end

					manga_id = manga_data ? manga_data[:manga_id] : SecureRandom.hex(8)
					manga_payload = {
						manga_id: manga_id,
						origin: manga_link,
						title: manga_title,
						cover: manga_cover,
						status_scan: manga_status,
						updated: DateTime.now
					}
					complete_list << manga_payload
					if manga_data
						$DB[:manga]
						.where(manga_id: manga_id)
						.update(manga_payload)
					else
						Helper::Cache.store_manga(@source_id, manga_payload)
					end
					Helper::Cache.store_tags(manga_id, tag_list)
				rescue
				end
			end
			if fail_list.length > 0
				Helper::Log.create_fail_log(JSON.pretty_generate(complete_list.last))
			end
			Helper::Log.create_log(complete_list)
		end

		def n_count
			browser = Ferrum::Browser.new({timeout: 20})
			browser.go_to("#{@origin}/directory")
			sleep 1 # pause to load javascript

			doc = Nokogiri::HTML(browser.body)
			scrape_count = doc.css('div.Box div.BoxHeader')[0].text.strip
			string_count = scrape_count.split("(").last.split(")")[0]
			manga_count = Integer(string_count.gsub!(",", ""))
			return manga_count
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

		def parse_manga_status(status_t)
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
	end
end