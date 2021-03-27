#!/usr/bin/env ruby
require 'ferrum'
require 'nokogiri'

module Source
	def self.cache_latest
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to(CONFIG['origin'])
		sleep 0.25 # pause to load javascript

		for index in 0..7
			browser.execute('document.getElementsByClassName(\'ViewMore\')[0].click()')
		end
		sleep 0.25 # pause to load javascript

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

	def self.cache_all(start = 1, limit = 0)
		browser = Ferrum::Browser.new({timeout: 20, window_size: [400, 800]})
		browser.go_to("#{CONFIG['origin']}/directory")
		sleep 2 # pause to load javascript

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