#!/usr/bin/env ruby
require 'ferrum'
require 'nokogiri'

module Source
	def self.read_manga(url)
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to("#{CONFIG['origin']}#{url}")
		sleep 0.25 # pause to load javascript

		doc = Nokogiri::HTML(browser.body)
		rows = doc.css('li.list-group-item')
				
		# alternate name(s) row 
		alt_offset = (rows[2].css("span").text.include? "Alternate") ? 0 : 1
		# offical tl row 
		otl_offset = (rows[7-alt_offset].css("span").text.include? "Official") ? 0 : 1

		manga_cover = doc.css('div.col-3 img')[0]['src']
		manga_title = rows[0].text.strip #("a")[0].text
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

		manga_payload = {
			origin: url,
			cover: manga_cover,
			title: manga_title,
			author: manga_author,
			artist: manga_artist,
			status_origin: manga_status_scan,
			status_scan: manga_status_scan,
			type: manga_type,
			description: manga_description,
			release_date: manga_released,
		}
		puts JSON.pretty_generate(manga_payload)
	end

	def self.read_chapter_list(url)
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to("#{CONFIG['origin']}#{url}")
		sleep 0.25 # pause to load javascript

		browser.execute('
			let button = document.getElementsByClassName(\'ShowAllChapters\')[0];
			if(button) {
				button.click();
			}'
		)
		sleep 1.5 # pause to load javascript

		doc = Nokogiri::HTML(browser.body)
		rows = doc.css('div.list-group a')

		chapter_list = []
		for chapter in rows
			chapter_origin = chapter['href'].strip

			scrape_chapter = chapter.css('span')[0].text.strip
			chapter_number = parse_chapter_number(scrape_chapter)

			row = chapter.css('span')
			if(row.length > 2 && (row[2].text.split(' ').length > 1))
				frame = row[2].text.split(' ')
				time = frame[2].split(':')
				if(frame[3] === 'PM')
					hour = 12 + Integer(time[0])
				else
					hour = 12 + Integer(time[0])
				end
				chapter_release = Time.new(
					Time.now.year,
					Time.now.month,
					Time.now.day - 1,
					hour,
					Integer(time[1])
				)
			elsif
				if(row.length > 2 )
					scape_release = row[2].text.strip.split(/\//)
				else
					scape_release = row[1].text.strip.split(/\//)
				end
				chapter_release = Time.new(scape_release[2], scape_release[0], scape_release[1])
			end
			
			chapter_list << {
				origin: chapter_origin,
				chapter_number: chapter_number,
				release_date: chapter_release,
			}
		end
		puts JSON.pretty_generate(chapter_list)
	end

	def self.read_page_list(url)
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to("#{CONFIG['origin']}#{url}")
		sleep 0.25 # pause to load javascript

		doc = Nokogiri::HTML(browser.body)
		rows = doc.css('div.DesktopNav div button.btn')
		view_type = rows[2].text.strip
		if(view_type.include? 'Long')
			browser.execute('
				let button = document.getElementsByClassName(\'btn\')[5];
				if(button) {
					button.click();
				}'
			)
			sleep 0.50 # pause to load javascript
		end

		doc = Nokogiri::HTML(browser.body)
		rows = doc.css('div.ImageGallery div div img.img-fluid')
		page_list = []
		current_page_number = 1
		for page in rows
			page_origin = url.split('-page')[0]
			page_origin = page_origin + '-page-' + String(current_page_number)

			image_link = page['src'].strip

			page_number = current_page_number
			current_page_number+=1

			page_list << {
				origin: page_origin,
				image_link: image_link,
				page_number: page_number
			}
		end
		puts JSON.pretty_generate(page_list)
	end

	def self.read_latest
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to(CONFIG['origin'])
		sleep 0.25 # pause to load javascript

		for index in 0..7
			browser.execute('document.getElementsByClassName(\'ViewMore\')[0].click()')
		end
		sleep 1.5 # pause to load javascript

		manga_list = []

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
			
			manga_payload = {
				cover: manga_cover,
				title: manga_title,
				origin: manga_origin,
				chapters: [
					origin: chapter_origin,
					chapter_number: chapter_number,
					release_date: chapter_release,
				]
			}
			manga_list << manga_payload
		end
		puts JSON.pretty_generate(manga_list)
	end

	def self.read_directory(limit = 0, start = 1)
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to("#{CONFIG['origin']}/directory")
		sleep 4.0 # pause to load javascript

		manga_list = []

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

			manga_row = Nokogiri::HTML(link[:title])
			tags_and_status = manga_row.xpath('//div').text.split(':')

			manga_origin = link['href']
			manga_cover = manga_row.xpath('//img')[0][:src]
			manga_title = link.text.strip
			manga_status = parse_manga_status(tags_and_status[1])

			manga_tag_list = []
			for tag in tags_and_status[2].split(',')
				manga_tag_list << tag.strip
			end

			manga_payload = {
				origin: manga_origin,
				title: manga_title,
				cover: manga_cover,
				status_scan: manga_status,
				tags: manga_tag_list,
			}
			manga_list << manga_payload
		end
		puts JSON.pretty_generate(manga_list)
	end

	#####################################################################
	#
	#					Helper Functions Below Here
	#
	#####################################################################

	def self.parse_chapter_number(chapter_n)
		chapter_number = chapter_n.split(' ')
		return begin Float(chapter_number[1]) rescue 0 end
	end

	def self.parse_chapter_release(chapter_r)
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

	def self.parse_manga_status(status_t)
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