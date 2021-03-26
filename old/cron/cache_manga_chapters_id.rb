#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'
require_relative '../lib/source/source_list'

manga = $DB[:manga_by_source][manga_id: ARGV[0]]
if manga
	source_alias = $DB[:source][source_id: manga[:source_id]][:alias]
	Source::SourceList.load_module(source_alias)
	source = Source::SourceList.getSource(source_alias)
	source.cache_manga_chapters(ARGV[0])
	exit true
else
	exit false
end